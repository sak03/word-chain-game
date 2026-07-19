# Word Chain Challenge

A child-friendly, responsive Word Chain game built with Next.js. Play against
WordBot or take turns with a friend on the same device.

**Live:** [wordchain.sartajalam.in](https://wordchain.sartajalam.in)

## Features

- Two modes: player vs. WordBot and local two-player
- Dictionary-backed English word validation
- Automatic machine words from the required last letter
- Duplicate-word protection, scoring, passes, and turn locking
- Names, scores, mode, and word history saved in browser local storage
- Light/dark themes and responsive layouts
- Terms of Use and Privacy Policy pages

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Production deploy

Production deploys from the **`prod`** branch to **Cloudflare Workers** via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### One-time setup

1. Create a Cloudflare API token with **Edit Cloudflare Workers** permission
   (Account → Workers Scripts: Edit; Zone → Workers Routes: Edit if you attach a domain).
2. In the GitHub repo → **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID` (Cloudflare dashboard → Workers & Pages → Account ID)
3. Merge or push to `prod` to ship. First deploy lands on `*.workers.dev`.
4. Attach the custom domain in Cloudflare:
   - Workers & Pages → `word-chain-challenge` → **Settings → Domains & Routes**
   - Add `wordchain.sartajalam.in`
   - Ensure `sartajalam.in` is on the same Cloudflare account (DNS).

```bash
git checkout prod
git merge development
git push origin prod
```

Manual deploy locally (optional):

```bash
export NEXT_PUBLIC_SITE_URL=https://wordchain.sartajalam.in
npm run cf:build
npx wrangler deploy
```

## Services

The game uses [Free Dictionary API](https://dictionaryapi.dev/) to validate
words and [Datamuse](https://www.datamuse.com/api/) to find WordBot responses.
Both integrations are called through server-side Next.js route handlers.
