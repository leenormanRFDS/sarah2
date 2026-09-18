# SARAH™ — 30th Birthday Experience

Vercel-ready Next.js/React/TypeScript prototype based on the supplied birthday build documents.

## Run

```bash
npm install
npm run dev
```

## Forecast photos

Add the four files below when you have them:

- `public/images/sarah-30.jpg`
- `public/images/sarah-40.jpg`
- `public/images/sarah-50.jpg`
- `public/images/sarah-69.jpg`

The experience shows a clearly marked forecast plate placeholder until the image is present.

## Notes

- No backend, database, analytics or AI API.
- Answers persist to `localStorage` under `sarah-30th-v1`.
- Q30 is feedback only.
- Dataset B is kept out of visible UI components, but as client-side code it is inspectable; that is acceptable for this birthday prototype.
- The supplied docs do not specify option vectors for the 3 unseen model-test questions, so those vectors are hand-authored in `lib/model.ts` and kept deterministic.
