# Fake NYT Cooking Recipe Generator

Static Vite/React single-page app that recreates the January 2026 NYT Cooking
recipe page structure as a near-literal parody. The page opens in inline edit
mode by default and switches to a clean share mode when a compressed recipe
payload is present in the URL hash.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test`

## URL Behavior

- Empty hash: edit mode with seeded sample recipe content.
- Valid `#r=...` hash: share mode with all editing controls disabled.
- Invalid hash: edit mode with a load error banner.

The app uses relative Vite assets and hash-based share state so the build works
from a GitHub Pages project subpath without server rewrites.
