# AGENTS.md — Debarka Mondal Portfolio & Systems Showcase

This document provides guidelines, context, and operational instructions for AI coding agents working in this repository.

---

## 1. Project Overview & Context

This is the personal portfolio and engineering showcase site for **Debarka Mondal** (`debarkamondal`), Full Stack & Systems Engineer.

- **Primary URL**: [debarkamondal.com](https://debarkamondal.com)
- **GitHub**: [github.com/debarkamondal](https://github.com/debarkamondal)
- **Organization**: Creator of [deez-in](https://github.com/deez-in) and [DeezChatz](https://chatz.deez.in) (Signal Protocol E2EE messaging platform)

### Core Architecture & Tech Stack

- **Framework**: [Astro](https://astro.build) (SSR/Static Hybrid) with `@astrojs/cloudflare` adapter.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) integrated via `@tailwindcss/vite`.
- **Visualizations**: [D3.js](https://d3js.org) for interactive knowledge graphs (`d3`).
- **Runtime & Deployment**: Node.js `>=22.12.0` / Cloudflare Pages via Wrangler.
- **Package Manager**: `bun` (preferred) or `npm`.

---

## 2. Strict Design & Aesthetic Rules

When editing or creating UI components, **strictly adhere** to the user's design principles:

### ❌ What NOT to Use
- **NO PILLS OR ROUNDED BUBBLES**: Never use `rounded-full` badges or pill-shaped borders for tags or status indicators.
- **NO GREEN / COLORED STATUS DOTS**: Do not insert green/pulsing "online" or "active" status dots.
- **NO FADING ON HOVER**: Interactive items and cards must NEVER fade, dim, or appear disabled on hover.

### ✅ What to Use
- **Monochrome & Brutalist Developer Aesthetic**: Clean borders (`border-border`), high contrast monospace annotations (`font-mono text-accent`), and sharp rectangular buttons.
- **Card Hover Pop**: Cards must brighten and lift on hover:
  ```html
  hover:bg-white dark:hover:bg-[#18181b] hover:border-text/70 dark:hover:border-white/40 hover:-translate-y-1 hover:shadow-md
  ```
- **Mobile First Interactivity**: For expandable or interactive cards, always ensure phone/touch viewers have dedicated tap triggers (e.g., tap buttons or cards) without accidental navigation conflicts.

---

## 3. Development Commands

```bash
# Install dependencies
bun install

# Start local dev server
bun run dev

# Production build
bun run build

# Preview build locally
bun run preview

# Generate Cloudflare Worker / Pages types
bun run generate-types
```

---

## 4. Component Structure & Architecture

Map of key components in `src/components/`:

| Component | Purpose & Rules |
|-----------|-----------------|
| **`Hero.astro`** | Monospace bio text. Contains the underlined link to `deez-in` GitHub org. Two distinct action button rows: Row 1 (`DeezChatz ↗` solid + `deez-in ↗` outline) and Row 2 (`Explore Knowledge Graph →` card-style). |
| **`OpenSource.astro`** | Pull Request-centric upstream work showcase (`stephenberry/opus-pure`, `rmqtt/rmqtt`, `Lidarr/Lidarr`). NOTE: `opus-pure` is a forked library, not a personal one. Displays PRs with expandable commit lists and direct PR links. |
| **`Ecosystem.astro`** | Core architectural projects including `libsignal-dezire`, `deezchatz-api`, `deezchatz-mobile`, etc. |
| **`KnowledgeGraph.astro`** | Interactive D3-powered force-directed knowledge graph mapping concepts, technologies, and repositories. |
| **`HobbyProjects.astro`** | Side experiments and hobby software. |
| **`Contact.astro`** | Terminal-styled contact card with PGP key and social links. |
| **`Navigation.astro`** | Top navbar with responsive mobile drawer and section jump links. |
| **`ThemeToggle.astro`** | Fast, script-driven dark/light mode toggle. |
| **`RepoModal.astro`** | Dynamic repository info popup dialog with 30-minute client caching for GitHub releases and latest commits. |

---

## 5. Ecosystem Relationships

The projects showcased on this portfolio link directly to Debarka's open-source projects across GitHub and the `deez-in` ecosystem:

- **`deez-in` Organization**: [github.com/deez-in](https://github.com/deez-in)
- **`DeezChatz` App**: [chatz.deez.in](https://chatz.deez.in)
- **`libsignal-dezire`**: Pure-Rust implementation of Signal Protocol with FFI bindings.
- **`stephenberry/opus-pure`**: Upstream PR #3 (allocations, Ogg bounding, NEON dispatch).
- **`rmqtt/rmqtt`**: Upstream PR #372 (offline message webhooks) & PR #381 (Docker 99% size reduction & CI fixes).
- **`Lidarr/Lidarr`**: Upstream PR #5750 (custom indexer search schemas).

---

## 6. Code Style & Conventions

- **Astro Components**: Use standard Frontmatter `---` for logic/imports. Prefer TypeScript in frontmatter and `<script>` blocks.
- **Scoped Styles**: Use Tailwind classes for layout and styling; use component `<style>` blocks sparingly for complex animations or pseudo-selectors when Tailwind utilities are insufficient.
- **Accessibility (a11y)**: Ensure all interactive buttons include `aria-label`, explicit `type="button"`, and appropriate focus states.
- **Documentation Integrity**: Keep comments, docstrings, and established links intact when refactoring.
