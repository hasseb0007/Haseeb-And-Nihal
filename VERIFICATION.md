# Verification

Checked locally on 27 September 2026.

- Browser views: 320px and 390px mobile, 1440px desktop. No document-level horizontal overflow.
- Visually inspected English hero and Walima, Urdu hero and Barat timetable.
- English/Urdu switch updates content, direction, title and control labels; language survives reload.
- Music is paused by default; play and pause worked in browser. Playback error status is accessible.
- Exact supplied map URLs and international-format tap-to-call destinations checked in rendered DOM.
- No-JavaScript check performed by serving the page with `Content-Security-Policy: script-src 'none'`: all English invitation content, maps and call links remain available; JavaScript-only controls are hidden.
- Reduced-motion handling reviewed in CSS and JavaScript; OS-level reduced-motion emulation was not available in the preview browser.
- Automated content check passes: translation completeness, dates/weekdays, times, venues, contacts, links, anchors, referenced assets and audio defaults.
- JavaScript syntax check passes. No console errors in the normal preview.
- GitHub Pages workflow prepared; public deployment is pending a destination GitHub account/repository and authentication. No public URL has been verified yet.

The Google Maps destination URLs are preserved exactly as supplied. Their resolved place records were not independently verified.
