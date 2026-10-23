# Security policy

## Reporting a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/hslcrb/style-scrather/security/advisories/new) when available. If the repository has not enabled it, contact the maintainer through the contact method on [their GitHub profile](https://github.com/hslcrb) and request a private channel before sharing exploit details. Do not post credentials, personal page contents, or a working exploit in a public issue.

Include the affected commit/version, browser version, minimal reproduction, expected behavior, impact, and a proposed fix if available. Response times are not guaranteed; this is a community-maintained project.

## Trust boundaries

- Inspected page markup, selectors, font names, URLs and stylesheet text are untrusted input. Render text as text, not executable HTML.
- Content scripts run in Chrome's isolated world; a Shadow DOM isolates the studio's styles. Neither grants access to closed roots or private browser internals.
- The font downloader permits HTTP(S), applies a size limit and a timeout, and runs in the service worker.
- Inspection and editing happen locally. The extension makes explicit network requests for update information and assets selected by the user; see [Privacy](docs/PRIVACY.md).
- The local preview server binds to `127.0.0.1` and exposes public project assets. It is a development server, not a production hosting service.

Security fixes target the current development branch and subsequent release. Older releases do not have a promised maintenance window.
