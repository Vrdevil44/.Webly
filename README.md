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

Pages are webpack + html-webpack-plugin templates in `src/`; shared chrome lives in `src/partials/`.
`docs/` is committed so GitHub Pages can serve it from the `/docs` folder.

## Adding images

Project cards and the About visual are image slots. By default they show generative CSS art. To use a photo or
AI image instead, drop WebP files at `src/assets/images/<name>-480.webp`, `-800.webp` and `-1200.webp`, then pass
`img: { name, alt, w, h }` to `visual()` in the page. `alt` is required (the build fails without it). If the files
are missing or fail to load, the art shows through. Full contract: `src/partials/visual.html`.

All testimonials, clients and projects are fictional sample content.
