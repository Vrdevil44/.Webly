# .Webly

A demo web-design agency website with glassmorphism styling and vanilla-tilt card effects. Front-end portfolio piece — static, no backend.

## Pages

- **Home** (`index.html`) — landing page
- **About** (`about.html`)
- **Projects** (`projects.html`)
- **Reviews** (`reviews.html`)
- **Login** (`login.html`) — static mock UI only (no authentication)

## Demo

https://vrdevil44.github.io/.Webly/

## Develop & build

```bash
npm install
npm run dev     # http://localhost:9000, served from memory with hot reload; never writes to docs/
npm run build   # safe production build into docs/ (GitHub Pages serves this folder)
```

`npm run build` compiles into a temporary `docs-build/`, verifies it (all five pages, a non-empty hashed bundle,
zero webpack errors) and only then swaps it into `docs/`. If anything fails, `docs/` is left exactly as it was.
Hand-placed files in `docs/` (`CNAME`, `.nojekyll`, `404.html`, `robots.txt`) are carried over on every swap.
Asset URLs are relative, so the site works under the `/.Webly/` project path, on a custom domain, or locally.

Pages are webpack + html-webpack-plugin templates in `src/`; shared chrome lives in `src/partials/` (`head.html` renders the per-page title, description, OG/Twitter tags and inline favicon from one `head({...})` call; the favicon is authored once in `src/assets/favicon.svg`; the social card is `src/assets/og.png`, 1200x630).
Tilt cards are marked `data-tilt-card` (not `data-tilt`, which vanilla-tilt would auto-init past the reduced-motion guard).
`docs/` is committed so GitHub Pages can serve it from the `/docs` folder.

## Adding images

Project cards and the About visual are image slots. By default they show generative CSS art. To use a photo or
AI image instead, drop WebP files at `src/assets/images/<name>-480.webp`, `-800.webp` and `-1200.webp`, then pass
`img: { name, alt, w, h }` to `visual()` in the page. `alt` is required (the build fails without it). If the files
are missing or fail to load, the art shows through. Full contract: `src/partials/visual.html`.

## Effects

- **Scroll reveals:** add `class="reveal"` (plus `style="--reveal-delay:.1s"` to stagger). Only below-the-fold content; never hero/LCP. Elements that carry their own transform (tilt cards) get a wrapper `div.reveal`. Everything stays visible without JS.
- **Cursor glow:** add `glass-card` to a frosted surface. Fine-pointer only, off under reduced motion; tilt cards are skipped (they have glare).
- **Gradient text:** `class="gradient-text"` on h1/h2 or a span inside one, always on a glass pane. Stops are pastel and contrast-checked (>=3:1 worst case, see `--wly-text-grad` in `base.css`); keep it on a different element than any `background:` shorthand.
- **Page transitions:** cross-document view transitions (`@view-transition` in `base.css`); the nav/footer chrome persists, content cross-fades. Unsupported browsers just navigate.

All testimonials, clients, stats, FAQ answers and projects are fictional sample content, and the Home trust sections are labelled as such.
