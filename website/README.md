# Style Scratcher introduction site

Korean-first, dependency-free HTML/CSS/JavaScript. The page introduces the extension, demonstrates scoped CSS inspection, describes the project philosophy, and gives accurate source-installation instructions.

## Run and publish

From the repository root, use `node serve.js`, then open `/` or `/website/`. The server also exposes the extension test bed at `/demo/`.

The repository's site build copies this directory to the static site root and copies `icons/` alongside it. Relative script, stylesheet, and icon paths work under either the repository's `/website/` URL or that built root. There are no CDN scripts, external fonts, analytics calls, framework dependencies, or application servers.

`index.html` owns the content and semantic structure, `styles.css` the responsive visual system, and `app.js` the preview interactions. The brand artwork is generated from `../scripts/generate-icons.js`; see `../docs/BRAND.md` and `../docs/PHILOSOPHY.md`.

## Preview contract

The inspector reads actual computed styles from three example elements inside the page. It supports pointer and keyboard selection, native color input and presets, border-radius and font-size sliders, a CSS tab, CSS copying, and reset. Its dimensions come from the selected element's real bounding box. It is a demonstration, not the installed extension, and never inspects another website.

Color changes adjust the button/card's foreground color for legibility; generated CSS includes that color. CSS values update immediately, without interpolated animation values. Reset restores the original styles, including responsive defaults. Copy success is displayed only after the Clipboard API resolves. If access is denied or unavailable, the CSS view is exposed or the command is selected for manual copying.

Tabs support Left/Right/Home/End keys. The mobile menu is a native disclosure and closes on navigation or Escape. Reduced-motion, forced-color, and unsupported-backdrop-filter styles preserve the controls. Without JavaScript, introduction, installation, navigation, and FAQ content remain usable, and the preview controls are disabled with an explanatory message.

## Release links

The current copy labels `v4.1.0.` as an **unreleased development preview**. Repository, documentation, and source ZIP URLs point to the existing `chatgpt/refresh/integration` branch. When that work lands on the default branch or is released, update these links as one explicit content change. Do not advertise a Chrome Web Store listing or a release asset unless it exists.

## Verification

Before publishing, check Chrome/Chromium at 320, 390, 768, 1024, and 1440 px. Exercise all three selectable elements, custom colors, both range controls, keyboard tab navigation, both copy buttons, denied clipboard access, reset, the mobile menu, and FAQ disclosures. Confirm no horizontal page overflow, console errors, external runtime requests, or hidden-panel leakage at mobile breakpoints. Inspect full-page screenshots with a Korean-capable system font.

The 2026-10-23 refresh was exercised in Chromium 148 at all listed widths, including actual Clipboard API writes and a denied-write path. PNG/SVG artwork was regenerated twice and compared byte for byte. The root `docs/VERIFICATION.md` records the integrated project's verification and any remaining limitations.
