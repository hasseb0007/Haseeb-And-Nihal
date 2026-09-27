# Redesign verification

Checked locally on 27 September 2026. Original version preserved in commit `8a3ad15` before editing.

## Browser checks

- Desktop: 1440 × 1000. Inspected opening, staged Barat timeline, 17-to-18 transition and details dialog.
- Mobile: 390 × 844 and 320 × 740. English and Urdu render without document-level horizontal overflow. The Urdu details dialog has no horizontal overflow.
- Desktop stage selection: choosing “Departure” updates the active timeline stage and moves to its scroll position. All three stages remain in the source and are available in the details dialog.
- Smaller screens: all schedule stages are visible in normal flow, without pinning.
- Language switch updates copy, direction and controls; saved preference works across reloads.
- Details dialog: opens, scrolls, closes with Escape and restores focus to its opening button.
- Sound: off by default. Explicit activation and deactivation work without errors. The original recorded soundtrack is removed; the replacement is synthesized locally.
- Guest celebration: the sparkle button updates the accessible status and launches the particle effect.
- Motion-off control: disables particles and transitions, removes pinned stages, and exposes the schedule as ordinary content. Resume works. OS reduced-motion is handled by the same JavaScript state plus CSS; an actual OS setting change was not exercised.
- JavaScript blocked by a test-only Content-Security-Policy: all five event times, venues, map links, contact numbers and core invitation content remain available. JavaScript-only buttons are hidden.
- No normal-preview browser warnings or errors observed.

## Static checks

`node scripts/check.mjs` passes: translation-key parity, nonempty translations, dates/weekdays, all times and venues, contact numbers, map URLs, fragment targets, referenced local assets, no autoplay and expected interaction controls.

`node --check app.js` and `node --check content.js` pass.

The animation loop is capped at approximately 30 frames per second with bounded particle counts and device pixel ratio. It stops when the page is hidden or decorative motion is disabled. This is an implementation check, not a hardware performance benchmark.

## External state

Google Maps URLs match those supplied by the user; resolved place records have not been independently verified. GitHub Pages publishing still requires a destination account/repository and authentication. No public deployment is claimed.
