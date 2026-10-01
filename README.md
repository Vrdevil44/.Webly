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

## Build

```bash
npm install
npm run build   # outputs to docs/ (GitHub Pages serves this folder)
```

The site is bundled with webpack (vanilla-tilt, html-webpack-plugin, copy-webpack-plugin).
`docs/` is committed so GitHub Pages can serve it from the `main` branch `/docs` folder.
