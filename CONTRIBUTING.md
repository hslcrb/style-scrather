# Contributing to Style Scratcher

Thanks for making the web easier to understand. Small, reproducible improvements are welcome.

## Start here

Use Node.js 20 or newer. The extension itself has **no runtime dependencies**.

```sh
git clone --depth 1 --branch chatgpt/refresh/integration https://github.com/hslcrb/style-scrather.git
cd style-scrather
npm ci
npm run check
npm test
npm start
```

Open `http://127.0.0.1:3000/` for the introduction and `/demo/` for the extension testing page. Load the repository root as an unpacked extension at `chrome://extensions`, then use **Alt+S** on the testing page. Reload the extension after editing its files.

## Make a focused change

1. Open an issue with the problem, a minimal reproduction, and expected behavior. For a small, clear fix, a pull request is enough.
2. Branch from the current base. This refresh uses `chatgpt/refresh/<area>` branches from `chatgpt/refresh/integration`; future work can use `chatgpt/<topic>/<area>`.
3. Change one behavior at a time. For a bug, add a failing regression case before the fix.
4. Use **English commit prefix + Korean description**, for example `fix: 검사 종료 시 페이지 변환 복원` or `docs: 압축 해제 설치 안내 보완`.
5. Make small commits and push **every commit immediately**. Do not force-push shared history. Merge child branches into the integration branch with merge commits.
6. Run the relevant tests and the complete checks before requesting review. State what you could not test.

## Verification

```sh
npm run check        # Syntax, manifest references, version agreement
npm test             # Legacy engine suite + behavioral regression suites
npm run build        # Extension ZIP, unpacked directory, checksum, static site
npx playwright install chromium
npm run test:browser # Real Manifest V3 browser smoke tests
```

`CHROMIUM_EXECUTABLE` may point to an installed **Chrome for Testing/Chromium** binary. Browser tests use an isolated temporary profile and local fixture pages. Do not use a personal browser profile. On minimal Linux machines, install the Playwright browser system dependencies as documented by [Playwright](https://playwright.dev/docs/browsers).

## Design and code conventions

- Read [Brand](docs/BRAND.md), [Philosophy](docs/PHILOSOPHY.md), and [Architecture](docs/ARCHITECTURE.md).
- Keep the manifest at the root. Runtime assets must stay inside the package allowlist in `scripts/build.js`.
- Prefer browser APIs and small modules to new runtime dependencies. Any dependency needs a concrete reason.
- Keep user-visible copy in Korean. Product names and brief technical labels can remain English.
- Retain Studio Crimson `#E11D48`; use it for actions and selection. Ensure text remains readable without blur or animation.
- Keyboard operation, clear disabled/error states, and reduced motion are part of the feature.
- Display versions as `vX.Y.Z.`. Use plain `X.Y.Z` in machine-readable manifests.
- Never log inspected page text or send it to a telemetry endpoint.
- Put screenshots, commands, and relevant evidence in the pull request; do not claim benchmark gains beyond the measured workload.

## Scope of support

This is an independent Chrome/Chromium extension. Cross-origin frames, closed shadow roots, browser pages, third-party font servers and page CSP can limit inspection. The code exporter is a starting point, not a lossless application converter. File actionable bugs rather than describing these boundaries as universal support.

Contributions are licensed under the existing [Apache-2.0 license](LICENSE).
