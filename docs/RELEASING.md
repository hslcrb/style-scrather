# Manual release procedure

This repository currently uses local builds and manual GitHub release publication. The owner requested this workflow on 2026-10-23 while GitHub Actions could not start. The commented workflow is retained in `.github/workflows/verify.yml.disabled`; no active workflow is needed for these steps.

## 1. Prepare an auditable branch

- Start from a shallow checkout and create a `chatgpt/<topic>/<area>` branch. Use separate worktrees when parallel work would overlap.
- Keep the manifest and package version equal (`4.1.0` for this release). Display the version as `v4.1.0.`; use `v4.1.0` for the Git tag.
- Commit one meaningful change at a time with an English prefix and Korean description. Publish every commit immediately. Preserve published history.
- Review the changelog, installation instructions, actual download links, privacy statement and known limitations.

## 2. Build and verify locally

Use Node.js 20 or newer and a full Chromium/Chrome for Testing executable. Run from the repository root:

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run build
npm run test:browser
EXTENSION_UNDER_TEST=dist/style-scratcher \
  TEST_OUTPUT_DIR=test-results/packaged node test/browser.js
```

Set `CHROMIUM_EXECUTABLE` if the browser was installed outside Playwright's normal cache. `FONTCONFIG_FILE` can select a local test font configuration for readable screenshots on minimal Linux environments; the product does not depend on it. Environment assignments above use POSIX shell syntax.

The build creates an unpacked extension, ZIP, SHA-256 file and `dist/site/`. Independently inspect the ZIP for CRC errors, an expected root manifest, the allowed files, and byte equality with the unpacked extension. Build twice and compare digests. Keep the digest, byte size, browser version, command outcomes and source commit in the verification record. Do not treat a mocked API test as proof of an installed browser behavior.

The static site is an additional build output. Publishing a GitHub release does not automatically deploy that site or submit the extension to the Chrome Web Store.

## 3. Integrate without flattening history

Merge all feature and child branches into the integration branch using two-parent merge commits. After reviewing the final diff and local verification:

```sh
git switch main
git merge --no-ff chatgpt/refresh/integration
git push origin main
```

When using GitHub's authenticated API, the equivalent pull-request operation is `merge_method: "merge"` with the exact expected head SHA. Verify that the resulting commit has two parents, its first parent is the previous `main`, and its second parent is the reviewed branch. Do not select squash or rebase. If the base changes during the work, integrate and verify the new base first.

Check that every published work-branch head is an ancestor of `main`. A tag must identify the merged, reviewed commit rather than the old base. Keep the working tree clean and retain any worktrees that another collaborator still owns.

## 4. Publish the release

Create the `v4.1.0` tag at the verified main merge commit. Title: **Style Scratcher v4.1.0. — Liquid Studio**. Attach these locally built files:

- `style-scratcher-4.1.0.zip`
- `style-scratcher-4.1.0.zip.sha256`

Include the installation steps, changes, exact checksum and known verification boundaries in the release description. GitHub's automatic source archives are different from the curated extension ZIP; point users to the latter for installation.

If a connector supports commits and merging but not releases or binary uploads, use the authorized GitHub release form and its file chooser. Do not extract connector or browser credentials, add tokens to the repository, or turn automation back on to work around the manual-release decision.

Verify the published release, tag target, asset names and sizes. Download the published ZIP and checksum and compare them to the local build before marking publication complete.

## 5. Record the outcome

Record the release URL, tag target, merge parents, artifact digest, publication checks and branch-ancestor audit. Update installation links after the release is available. Commit and publish that closeout record on a `chatgpt/` branch, then merge it into `main` with another two-parent merge if needed. A documentation-only closeout may follow the release tag; it must not silently change the released runtime.

The detailed 2026-10-23 work record is maintained in [`process/2026-10-23-liquid-studio.md`](process/2026-10-23-liquid-studio.md). Evidence is in [`verification/`](verification/).
