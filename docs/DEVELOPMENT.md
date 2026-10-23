# Development and distribution

## Requirements

- Node.js 20 or newer for project tooling.
- Desktop Chrome/Chromium for installing the extension.
- Playwright's Chromium or Chrome for Testing for automated browser checks.
- No runtime package installation is needed to use the unpacked extension.

## Common commands

| Command | Output / purpose |
| --- | --- |
| `npm start` | Local introduction at `http://127.0.0.1:3000/` |
| `PORT=3001 npm start` | Alternate port (POSIX shells; use your shell's environment syntax on Windows) |
| `npm run check` | Parse JavaScript; verify manifest paths and version agreement |
| `npm test` | Isolated engine and behavior test processes |
| `npm run test:legacy` | Original engine regression suite, maintained for current contracts |
| `npm run build` | Extension folder, ZIP, checksum and static site in `dist/` |
| `npm run benchmark` | 동일 fixture의 활성 전 상태와 240-event 오버레이 그리기 횟수 |
| `npm run icons` | Regenerate vector and antialiased PNG identity assets |
| `npm run test:browser` | Real Chromium Manifest V3 smoke checks; evidence in `test-results/browser/` |

Use `npm ci` to install the pinned browser-test dependency, then `npx playwright install chromium`. If your environment provides a compatible full browser, set `CHROMIUM_EXECUTABLE` to its executable. Extension tests need a full Chromium/Chrome for Testing build, not the old headless shell. The test creates and removes its own temporary profile.

`EXTENSION_UNDER_TEST` selects another unpacked extension folder, which lets the same tests verify the generated `dist/style-scratcher/` package. The local fixtures still come from this repository. `TEST_OUTPUT_DIR` selects the directory for JSON results and screenshots.

## Local pages

The preview server binds to `127.0.0.1`. The following routes are public:

- `/` and `/website/`: product introduction.
- `/demo/`: a fixture that contains ordinary buttons, text, colors and motion. It does not self-inject the extension.
- `/popup/popup.html`: layout preview; without an extension context the popup explains that it cannot control a tab.
- `/icons/`, `/content/`, `/docs/`: public development assets.

The server accepts GET/HEAD only, checks decoded paths, rejects hidden and traversal segments, and excludes repository metadata and dependencies. Do not deploy it as a public application server.

## Package layout

`npm run build` creates:

- `dist/style-scratcher/` — unpacked extension, with `manifest.json` at its root.
- `dist/style-scratcher-<version>.zip` — distributable archive.
- `dist/style-scratcher-<version>.zip.sha256` — integrity digest.
- `dist/site/` — static introduction page with local assets.

Load the unpacked directory directly, or extract the ZIP first. Chrome's unpacked loader does not accept a ZIP file.

The package includes only `background/`, `content/`, `popup/`, `icons/`, `manifest.json` and `LICENSE`. Build output is ignored by Git. Rebuild from the published commit to reproduce the archive.

## Static hosting

Publish the **contents** of `dist/site/` to a static host. The page has relative asset URLs and no server API. Do not publish the whole repository, and do not mistake the local preview URL for a deployed website. This refresh provides buildable site files; a new public host is not configured as part of the branch.

When creating a release later, update `manifest.json` and `package.json` together, run all checks, build, independently verify the ZIP, and attach the archive and checksum to the release. Replace preview-branch links in the introduction only after the actual release exists.

## Branches and commit discipline

This work starts from a shallow checkout and an integration branch. Runtime, interface, identity and tooling branches descend from that branch. Each small commit uses an English prefix and Korean description and is published immediately. Child branches are merged with two-parent merge commits; the resulting integration branch is proposed to `main` with a pull request.

The work uses GitHub's authenticated Git data API when the execution environment has no shell credential helper. Creating a commit and immediately moving its branch reference publishes it; fetching that reference keeps the local checkout aligned. No credential is stored in this repository.

## Continuous integration

`.github/workflows/verify.yml` runs syntax, behavior, packaging, and installed-extension browser checks on pushes and pull requests. Actions are pinned to commit SHAs, checkout uses depth 1, and credentials are not persisted. See [Verification](VERIFICATION.md#hosted-ci-limitation) for the observed account-level blocker before treating a hosted run as validated.
