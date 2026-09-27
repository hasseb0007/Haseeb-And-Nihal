# Haseeb & Nihal — wedding invitation

A complete, dependency-free static invitation for Barat and Walima on 17–18 October 2026. English and Urdu, accessible motion, original artwork, local fonts, and optional music.

## Preview

Open `index.html` directly, or run `python3 -m http.server 4173` in this folder and visit http://localhost:4173. No npm install is needed.

## Edit

Edit **content.js** for invitation copy, names, timings, map URLs and contact numbers. Then run:

```
node scripts/build.mjs
node scripts/check.mjs
```

The builder regenerates the complete English HTML fallback. JavaScript changes the displayed language, preserving readable invitation content when scripting is unavailable. Edits should always be made in content.js rather than in the generated index.html. Layout lives in style.css; browser interactions live in app.js.

## Publish on GitHub Pages

1. Create a public GitHub repository, suggested name `haseeb-nihal-wedding`.
2. Put this folder's contents at the repository root, including `.github/workflows/pages.yml`.
3. In Settings → Pages → Build and deployment, choose **GitHub Actions**.
4. Push to the `main` branch, or run the “Publish wedding invitation” workflow manually.
5. The workflow publishes at `https://YOUR-USERNAME.github.io/haseeb-nihal-wedding/` and reports the actual deployment URL.

All files use relative paths and work under a repository URL. The workflow uploads only public site files. It rebuilds the English fallback and checks content before publishing. The public repository and website contain the supplied invitation's contact numbers and departure address.

## Behavior

- Default language: English. The visitor's language preference is saved locally when available.
- Urdu uses right-to-left layout, with isolated left-to-right phone numbers.
- Music never autoplays or downloads on initial page load. A guest starts it explicitly; it loops at low volume until paused.
- Reduced-motion preference disables ambient animation, smooth scrolling, and entrance effects.
- Map links open the exact supplied Google Maps locations in another tab.
- No backend, analytics, form service, or tracking scripts.

## Credits and licenses

Artwork: created for this invitation with built-in ImageGen. Prompt: cinematic midnight-blue moonlit garden, silver moon upper-right, white jasmine and blue botanicals at the edges, reflecting pool and distant arches, dark negative space for typography, no people or text. Optimized to WebP.

Cormorant Garamond and Noto Nastaliq Urdu: Google Fonts, SIL Open Font License; license files included in assets.

“Dreams Become Real” by Kevin MacLeod (https://incompetech.com/).
Licensed under Creative Commons: By Attribution 4.0.
https://creativecommons.org/licenses/by/4.0/
Original recording, unmodified.

License verified from https://incompetech.com/music/royalty-free/licenses/ and track catalog https://incompetech.com/music/royalty-free/pieces.json (ISRC USUAN1500027). Attribution is also visible in the website's Music credits section.
