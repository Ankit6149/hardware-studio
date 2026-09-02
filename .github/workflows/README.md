# GitHub Actions policy

**Reconciled:** 2026-09-02

Hardware Studio uses GitHub Actions to verify ordinary, reviewable source commits. CI is a verification system; it is not allowed to reconstruct, rewrite, or self-merge product source.

## Canonical workflow

The canonical workflow is `.github/workflows/ci.yml`.

From a clean checkout it must:

1. reject retired source-transport/self-modifying workflow paths;
2. install dependencies with `npm ci`;
3. run `npm run lint`;
4. run `npm run typecheck`;
5. run the full configured `npm test` suite;
6. run `npm run build`.

Every result is meaningful only for the exact commit/merge ref that was checked out.

## Required security and review rules

- Verification workflows use least-privilege permissions.
- CI must never reconstruct product source from encoded/chunked payloads.
- CI must never commit or push changes to the branch it is verifying.
- CI must never request broad `contents: write` merely to make a source change appear green.
- Product changes must appear as ordinary Git diffs in a pull request.
- Temporary diagnostics belong in local tooling or a short-lived review branch and must not become a hidden source-delivery mechanism.
- Retired source-transport workflows remain blocked by the workflow-hygiene guard.

## Exact-head merge policy

Before merge:

- verify the PR head SHA has not moved since the checks ran;
- do not cite green checks from an older head;
- inspect changed-file scope;
- inspect Vercel/deployment status for the same head;
- distinguish repository/application failures from external hosting-plan capacity failures;
- merge with expected-head-SHA protection when available.

A passing CI run proves only the configured repository checks. It does not prove ECAD/CAD correctness, fabrication qualification, physical safety, regulatory compliance, or release approval.

## Deployment status

Vercel is a separate status signal from GitHub Actions.

- A real Vercel application/build failure is a deployment blocker.
- A Vercel plan/build-rate-limit status is an external capacity condition; document it accurately and do not report the deployment as successful.
- Do not repeatedly trigger deployment merely to work around a plan limit.
- Production/browser verification may require a tracked follow-up when external deployment is unavailable.

## Current reference point

At the 2026-09-02 documentation sync, U7.1 had landed with exact-head lint, typecheck, **339/339 tests across 89 test files**, production build, and Vercel status passing. U8 Release convergence is the active Studio phase. Those numbers are historical evidence for that bounded U7 head, not a permanent expected test-count contract.

## Future CI expansion

The recovery plan still requires broader verification over time, including selected end-to-end user journeys, package boundaries, durability/recovery, interoperability, and domain-specific independent checks. Any added workflow must preserve the same read-only source-verification principle unless a deliberately separate, reviewed release/deployment workflow requires narrowly scoped write permissions.
