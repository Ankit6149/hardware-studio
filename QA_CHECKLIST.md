# Hardware Studio Verification Checklist

This checklist describes the evidence currently required before a change may be merged. It is a repository verification checklist—not a product qualification certificate.

## Automated merge gates

The canonical GitHub Actions workflow must pass all of the following from a clean checkout:

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] repository workflow-hygiene guard

A passing root workflow proves only that the checked source satisfies these automated gates. It does not prove that every product workflow is reachable, usable, safe, or professionally qualified.

## Required change evidence

For each implementation pull request:

- [ ] the linked issue has bounded acceptance criteria;
- [ ] the source diff is directly reviewable and contains no reconstructed payload;
- [ ] changed behavior has focused automated tests where practical;
- [ ] user-visible states include loading, empty, error, recovery, and destructive-action behavior where relevant;
- [ ] engineering outputs are classified as authoritative, derived, draft, estimated, placeholder, or unavailable;
- [ ] documentation is updated when product status, architecture, or limitations change;
- [ ] no issue is closed while acceptance criteria remain partial.

## Missing verification layers

The repository does not yet have complete automated coverage for:

- browser component behavior;
- end-to-end user journeys;
- accessibility scanning and keyboard navigation;
- visual regression and responsive layouts;
- persistence corruption, quota, and multi-project recovery;
- complete local bridge and MCP lifecycle integration;
- external CAD/EDA parser validation;
- independent electrical, mechanical, firmware, safety, DFM, or manufacturing qualification.

These gaps must be stated in pull requests and status documents. They must not be replaced by manually checked boxes or an agent assertion.

## Engineering output guard

Generated Gerber, drill, placement, BOM, blueprint, firmware, 3D, validation, and release artifacts remain draft or derived unless a domain-specific issue defines and proves a stronger qualification gate. Independent toolchain and engineering review remain mandatory.

## Authoritative status

See [`docs/CURRENT_STATUS.md`](docs/CURRENT_STATUS.md). Historical V1/V5 checklists are not active verification evidence.
