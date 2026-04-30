import fs from "fs";
import path from "path";

const VAULT_PATH = "/Users/destiny/Important/llm-wiki";
const OUTPUT_FILE = path.join(process.cwd(), "public", "graph.json");

const nodesMap = new Map(); // id -> { id, label }
const links = [];           // array of { source, target, weight }

const basenameToId = new Map();
const searchTerms = new Map(); // lowercase term -> targetId

function cleanLabel(label) {
  if (!label) return label;
  let cleaned = label.includes("/") ? label.split("/").pop() : label;
  cleaned = cleaned.replace(/\|/g, "");
  return cleaned.trim();
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function discoverFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      discoverFiles(fullPath);
    } else if (entry.name.endsWith(".md")) {
      const relativePath = path.relative(VAULT_PATH, fullPath);
      const id = relativePath.slice(0, -3); 
      const basename = path.basename(entry.name, ".md");

      basenameToId.set(basename.toLowerCase(), id);

      // Pre-read content for aliases
      const content = fs.readFileSync(fullPath, "utf-8");
      
      let label = basename;
      const termsForThisNode = new Set();
      termsForThisNode.add(basename.toLowerCase());

      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\n---/);
      if (fmMatch) {
        const fmContent = fmMatch[1];
        const aliasMatch = fmContent.match(/^alias(?:es)?:\s*(.*)/mi);
        if (aliasMatch) {
          let aliasVal = aliasMatch[1].trim();
          let aliases = [];
          if (aliasVal.startsWith("[")) {
             aliases = aliasVal.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
          } else {
             aliases = [aliasVal.replace(/^["']|["']$/g, "")];
          }
          
          if (aliases.length > 0 && aliases[0]) {
             label = aliases[0];
             for (const al of aliases) {
                if (al && al.length > 2) termsForThisNode.add(al.toLowerCase());
             }
          }
        }
      }

      nodesMap.set(id, { id, label: cleanLabel(label) });

      for (const term of termsForThisNode) {
        // Exclude terms that are too short to prevent random word matching
        if (term.length > 2) {
          searchTerms.set(term, id);
        }
      }
    }
  }
}

let searchRegex = null;
let sortedTerms = [];

function buildSearchRegex() {
  sortedTerms = Array.from(searchTerms.keys()).sort((a, b) => b.length - a.length);
  if (sortedTerms.length > 0) {
     searchRegex = new RegExp("\\b(" + sortedTerms.map(escapeRegExp).join("|") + ")\\b", "gi");
  }
}

function parseFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      parseFiles(fullPath);
    } else if (entry.name.endsWith(".md")) {
      const relativePath = path.relative(VAULT_PATH, fullPath);
      const id = relativePath.slice(0, -3);
      const content = fs.readFileSync(fullPath, "utf-8");

      let contentWithoutWikilinks = content;
      const linkWeights = new Map(); // targetId -> weight
      const addLinkWeight = (tId, weight = 1) => {
         linkWeights.set(tId, (linkWeights.get(tId) || 0) + weight);
      };

      const explicitLinks = new Set();

      // 1. Extract Explicit Wikilinks
      const wikilinkRegex = /\[\[(.*?)\]\]/g;
      let match;
      
      while ((match = wikilinkRegex.exec(content)) !== null) {
        const linkContent = match[1];
        const parts = linkContent.split("|");
        const targetPathRaw = parts[0].trim();
        const displayAlias = parts[1] ? parts[1].trim() : null;

        const targetFile = targetPathRaw.split("#")[0].trim();
        if (!targetFile) continue;

        const targetBasename = path.basename(targetFile);

        const resolvedId = basenameToId.get(targetBasename.toLowerCase());
        const targetId = resolvedId || targetBasename;

        if (!nodesMap.has(targetId)) {
          nodesMap.set(targetId, {
            id: targetId,
            label: cleanLabel(displayAlias || targetBasename)
          });
        }

        explicitLinks.add(targetId);
        addLinkWeight(targetId, 1);
        
        // Blank out the wikilink in the text so we don't double count it during plain text search
        contentWithoutWikilinks = contentWithoutWikilinks.replace(match[0], " ".repeat(match[0].length));
      }

      // 2. Parse Plain Text Mentions
      if (searchRegex) {
         let textMatch;
         searchRegex.lastIndex = 0;
         while ((textMatch = searchRegex.exec(contentWithoutWikilinks)) !== null) {
            const matchedTerm = textMatch[1].toLowerCase();
            const targetId = searchTerms.get(matchedTerm);
            // Only increase edge weight if the edge already exists explicitly
            if (targetId && targetId !== id && explicitLinks.has(targetId)) {
               addLinkWeight(targetId, 1);
            }
         }
      }

      for (const [targetId, weight] of linkWeights.entries()) {
         links.push({ source: id, target: targetId, weight });
      }
    }
  }
}

console.log("🔍 Scanning Obsidian Vault...");
discoverFiles(VAULT_PATH);

console.log("🛠️ Building search index for plain text mentions...");
buildSearchRegex();

console.log("🔗 Parsing notes and wikilinks...");
parseFiles(VAULT_PATH);

// Calculate weights (degrees) for each node based on links
const nodeWeights = new Map();
for (const link of links) {
  nodeWeights.set(link.source, (nodeWeights.get(link.source) || 0) + link.weight);
  nodeWeights.set(link.target, (nodeWeights.get(link.target) || 0) + link.weight);
}

for (const node of nodesMap.values()) {
  node.weight = nodeWeights.get(node.id) || 0;
}

const graphData = {
  nodes: Array.from(nodesMap.values()),
  links: links,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(graphData, null, 2));

console.log(`✅ Successfully generated graph.json with ${graphData.nodes.length} nodes and ${graphData.links.length} unique connections!`);
