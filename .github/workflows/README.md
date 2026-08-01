# GitHub Actions policy

Hardware Studio uses workflows to verify ordinary reviewable source commits.

## Required rules

- Verification workflows use least-privilege read permissions.
- CI must never reconstruct product source from encoded/chunked payloads.
- CI must never commit or push changes to the branch it is verifying.
- Product changes must appear as normal Git diffs in a pull request.
- The canonical application gate installs dependencies, lints, typechecks, tests, and builds from a clean checkout.
- Temporary diagnostics belong in local tooling or a short-lived branch and must not be merged into the default branch.

The canonical workflow includes a guard that rejects the retired UX payload workflow paths and common self-modifying workflow commands.
