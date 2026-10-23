# Workflows temporarily disabled

The repository owner requested local verification and release publication on 2026-10-23. Every line of the previous workflow is commented with `#` in [`verify.yml.disabled`](verify.yml.disabled). The additional `.disabled` suffix keeps GitHub Actions from treating a comment-only document as an invalid workflow.

There are currently no active `.yml` or `.yaml` workflows in this directory. Previous run records remain available; they are not evidence that the current local build failed. The previously observed hosted run never started because GitHub reported an account billing lock; see [the recorded evidence](../../docs/verification/ci-status.json).

## Local release gate

Run `npm ci --ignore-scripts`, `npm run check`, `npm test`, and `npm run build`, then run the real Chromium extension suite against both the source checkout and `dist/style-scratcher/`. Verify the ZIP and checksum before attaching them to a GitHub release. Full commands and environment details are in [Development](../../docs/DEVELOPMENT.md) and [Verification](../../docs/VERIFICATION.md).

## Restore later

When the owner chooses to re-enable automation and the account can run jobs:

1. Remove the four explanatory comment lines at the top of `verify.yml.disabled`.
2. Remove the first `# ` from every preserved nonempty line, and turn a line containing only `#` back into an empty line.
3. Rename the result to `verify.yml`.
4. Review the restored diff, commit and publish it, then verify an actual hosted run.

The original pinned actions, depth-one checkout and disabled credential persistence are preserved. Re-enabling automation is a separate repository change; this release does not claim a successful hosted run.
