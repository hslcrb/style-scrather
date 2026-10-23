# Changelog

Changes are grouped by release. GitHub installation archives and Chrome Web Store distribution are separate publication channels.

## [v4.1.0. — Liquid Studio](https://github.com/hslcrb/style-scrather/releases/tag/v4.1.0) · 2026-10-23

### Experience and identity

- Rebuild the popup and floating studio with pearl glass surfaces, Studio Crimson accents, a refined selection-frame mark, and readable fallback surfaces.
- Organize four primary tabs and six additional panels behind a keyboard-accessible tools menu. Preserve input focus and disclosure state during editing.
- Keep the studio inside narrow windows down to 320 pixels; support keyboard movement, reduced motion, and clear focus indicators.
- Add an interactive Korean introduction, a standalone extension playground, brand guidelines, and a product philosophy.
- Generate SVG marks, wordmark, sharing artwork, and antialiased PNG icons without production dependencies.

### Correctness and recovery

- Initialize inspection only after an explicit request. Opening a page or reading its state leaves it usable.
- Derive injection order from the manifest and make repeated script injection safe.
- Require confirmed popup responses and show actionable pending, connection, clipboard, resource, and update failures.
- Restore zoom styles and priorities, inline handlers, animation states, editable attributes, and temporary modes on close.
- Clear grid/baseline state on close and detach inactive studio listeners and timers.
- Fix missing HUD actions, asynchronous asset-download feedback, tab-order calls, and root-relative font URLs.
- Serialize JSX strings and SVG outline metadata safely. Reject failed HTTP asset responses instead of saving error pages.
- Connect the code panel to the actual single-asset download API.
- Distinguish character-width measurements from font-specific glyph coverage. Export measurements as JSON; require genuine supplied paths for SVG-font serialization.
- Keep measurements aligned with the current font and tolerate tab changes during progress.

### Performance

- Coalesce overlay invalidations with `requestAnimationFrame`; skip painting when inactive.
- Bound palette, tab-order, font, and outline work; cache stable scans and shared update checks.
- Replace the conflicting 1,848-line shadow stylesheet with one organized token-based stylesheet.
- Add a reproducible paint-count comparison. See [Verification](docs/VERIFICATION.md) for the workload and limits of the measured result.

### Repository and distribution

- Add repeatable development commands, dependency locking, deterministic extension ZIP/checksum generation, and static-site output.
- Validate manifest JavaScript, CSS, icons, and web-accessible wildcard resources before packaging.
- Restrict the local preview server to public directories, including resolved symlink targets.
- Move historical release notes into `docs/releases/` and add contribution, community, security, privacy, architecture, and verification documentation.
- Add issue/PR templates and preserve a pinned, depth-one verification workflow. At the owner's request, every workflow line is commented with `#` and the file is archived as `.yml.disabled`; no workflow is currently active.
- Expand behavioral and real-browser regression coverage, run the final gate locally, and publish the locally built ZIP and checksum as GitHub Release assets. The earlier hosted runner could not start; local results and public-download integrity are recorded separately.
- Merge all implementation and nested work with two-parent commits, and publish a detailed process record and per-commit file ledger.

### Compatibility notes

- Existing Chrome/Chromium installation paths and the root manifest remain intact.
- `ReactExporter.downloadAsset()` now returns `Promise<metadata|null>` and rejects failed downloads.
- Character measurement results deliberately contain no font-coverage percentage. Canvas outlines approximate rendered text rather than recover original font vectors or document layout.
- The new introduction is buildable static content in `dist/site/`. The extension GitHub release is published; public website hosting remains a separate setup step.

## Earlier releases

- [v4.0.3.](docs/releases/release-notes-v4.0.3.md)
- [v4.0.2.](docs/releases/release-notes-v4.0.2.md)
- [Historical release notes](docs/releases/)
