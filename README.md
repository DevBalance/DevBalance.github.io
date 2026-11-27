# DevBalance

React + Vite + Tailwind migration on `dev`. No deployment has been performed.

Run `npm ci`, `npm run dev` (Node 22). Build with `npm run build`; preview with `npm run preview`. With preview running, run `npm test` for desktop/mobile Playwright and axe accessibility checks (installed Chrome required).

Original homepage content is preserved in `src/content.json`, extracted from `src/original-home.html`. Existing product and guide pages remain at their original URLs through `public/`. The new homepage does not load Bootstrap or the old JavaScript.

## GitHub Pages

Production currently publishes the root of `main`. Before merging this migration, switch Pages to GitHub Actions and configure the official Pages workflow to build with `npm ci` and `npm run build`, then upload and deploy `dist/`. Node 22 and base `/` support the custom domain and organization github.io URL. `public/CNAME` preserves the domain. No deployment workflow is enabled by this change.

Legacy template attribution remains on the preserved product/guide pages. No analytics or new cookies are introduced. Legal policy copy was not supplied and has not been invented.
