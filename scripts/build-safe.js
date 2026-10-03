// Safe production build: webpack -> docs-build/, verify, then swap into docs/.
// docs/ is what GitHub Pages serves, so a failed build must never touch it.
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const config = require('../webpack.config.js');

const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');
const staging = config.output.path; // docs-build
const previous = path.join(root, 'docs-prev');

const PAGES = ['index', 'about', 'projects', 'reviews', 'login'];
// Hand-placed files that live only in docs/ and must survive every swap
const PRESERVE = ['CNAME', '.nojekyll', '404.html', 'robots.txt'];

const fail = (msg) => {
  console.error(`\nBuild FAILED: ${msg}\ndocs/ was left untouched.`);
  fs.rmSync(staging, { recursive: true, force: true });
  process.exit(1);
};

const verify = () => {
  const missing = PAGES.map((p) => `${p}.html`).filter((f) => !fs.existsSync(path.join(staging, f)));
  if (missing.length) fail(`missing output: ${missing.join(', ')}`);

  const jsDir = path.join(staging, 'js');
  const bundles = fs.existsSync(jsDir) ? fs.readdirSync(jsDir).filter((f) => f.endsWith('.js')) : [];
  if (!bundles.length) fail('no JS bundle emitted');
  const empty = bundles.filter((f) => fs.statSync(path.join(jsDir, f)).size === 0);
  if (empty.length) fail(`empty bundle: ${empty.join(', ')}`);

  // Every page must reference a bundle that actually exists
  for (const p of PAGES) {
    const html = fs.readFileSync(path.join(staging, `${p}.html`), 'utf8');
    const m = html.match(/src=["']?([^"'\s>]*js\/[^"'\s>]+\.js)/);
    if (!m || !fs.existsSync(path.join(staging, m[1].replace(/^\.?\//, '')))) {
      fail(`${p}.html does not reference an emitted bundle`);
    }
  }
};

const swap = () => {
  // Carry hand-placed files into the staged build
  for (const name of PRESERVE) {
    const src = path.join(docs, name);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(staging, name), { recursive: true });
  }

  fs.rmSync(previous, { recursive: true, force: true });
  const hadDocs = fs.existsSync(docs);
  if (hadDocs) fs.renameSync(docs, previous);
  try {
    fs.renameSync(staging, docs);
  } catch (err) {
    if (hadDocs) fs.renameSync(previous, docs); // roll back
    fail(`could not swap build into docs/ (${err.message})`);
  }
  fs.rmSync(previous, { recursive: true, force: true });
};

fs.rmSync(staging, { recursive: true, force: true });
const compiler = webpack({ ...config, mode: 'production' });

compiler.run((err, stats) => {
  compiler.close(() => {});
  if (err) return fail(err.stack || String(err));
  console.log(stats.toString({ colors: process.stdout.isTTY, modules: false, children: false }));
  if (stats.hasErrors()) return fail('webpack reported errors');
  verify();
  swap();
  console.log('\nBuild OK: docs/ updated.');
});
