# Haseeb & Nihal — an invitation under the stars

A bilingual, static wedding experience for Barat and Walima on 17–18 October 2026. No framework, package installation, database, analytics, or external runtime services.

## Preview and edit

Open index.html directly, or run `python3 -m http.server 4173` in this folder and visit http://localhost:4173.

Edit **content.js** for English/Urdu copy, dates, times, maps, and contacts. Regenerate the complete English HTML fallback with:

```
node scripts/build.mjs
node scripts/check.mjs
```

Presentation lives in style.css; motion, language, sound and interactions live in app.js. The generated index.html is intentionally checked in so a simple static host or local file can serve the site.

## The experience

- One persistent garden image with a scroll-driven camera, pointer depth, animated light particles, and a warmer atmosphere on the second evening.
- Kinetic opening typography, a scroll-driven 17-to-18 date transition, and staged event timelines on sufficiently large screens.
- Desktop event stages can be selected directly; smaller screens show the complete schedule in natural document flow.
- A keyboard-accessible details dialog provides all times, directions and RSVP contacts without following the entire story. Escape closes it and restores focus.
- A guest-triggered sparkle interaction. It does not send, store or collect anything.
- Optional original major-pentatonic chimes synthesized with Web Audio. Sound is off until a guest requests it, and switches off when the page is hidden. No audio download or recorded music.
- English/Urdu switching with local preference storage, right-to-left layout, locally hosted Nastaliq font, and isolated phone numbers.
- Motion-off control with saved preference. Operating-system reduced-motion preference disables decorative motion, particles and pinned stages. The entire event schedule becomes a normal static document.
- Complete English fallback when JavaScript is blocked. Controls needing JavaScript are hidden.
- Native scrolling. No wheel interception, scroll hijacking, intro gate or loading animation.

## Publish with GitHub Pages

1. Create a public repository, for example `haseeb-nihal-wedding`.
2. Put this folder's contents at its root, including `.github/workflows/pages.yml`.
3. In Settings → Pages → Build and deployment, select **GitHub Actions**.
4. Push to `main`, or run the “Publish wedding invitation” workflow manually.
5. The workflow reports the final URL, normally `https://YOUR-USERNAME.github.io/haseeb-nihal-wedding/`.

The workflow rebuilds the fallback, validates content, and publishes only the HTML, CSS, JavaScript and assets. Relative paths work under a repository URL. The public site and source include the contact numbers and house address provided for this invitation.

## Artwork and fonts

The original garden artwork was created for this invitation with built-in ImageGen: cinematic midnight-blue moonlit garden, silver moon, jasmine and botanicals at the edges, reflecting pool and distant arches, no people or lettering. The image is optimized to WebP; animation is applied in the browser, not baked into a video.

Cormorant Garamond and Noto Nastaliq Urdu are distributed under the SIL Open Font License. Their license files are included in assets.

The current sound is an original short generative chime sequence implemented in app.js. The previous recorded soundtrack was removed.

## Version history

The original card-like website was committed before the redesign as `8a3ad15` (“Save initial bilingual wedding invitation”). This preserves the original layout and soundtrack for comparison or recovery. The immersive redesign is preserved in commit `9892828`. Subsequent animation corrections remain visible as working-tree changes.
