# Word Chai Challenge

A child-friendly, responsive Word Chain game built with Next.js. Play against
WordBot or take turns with a friend on the same device.

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

## Services

The game uses [Free Dictionary API](https://dictionaryapi.dev/) to validate
words and [Datamuse](https://www.datamuse.com/api/) to find WordBot responses.
Both integrations are called through server-side Next.js route handlers.
