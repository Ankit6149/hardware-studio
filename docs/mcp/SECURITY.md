# Hardware Studio MCP Security & Boundary Model

Hardware Studio treats MCP/AI as a collaborator that can inspect engineering evidence and propose changes. It is not an authority that can silently approve or bypass engineering decisions.

## Security principles

1. **Local boundary first** — the supported bridge/server model is local. Remote exposure is not part of the current trusted V1 boundary.
2. **Read does not imply truth fabrication** — MCP read tools return the canonical project state. Missing boards, placements, firmware evidence, validation runs, and release evidence remain missing; the server does not manufacture defaults to make a response look complete.
3. **Propose before mutate** — AI-facing write flows create `MCPProposal` records first. A proposal is reversible and does not mutate canonical engineering data merely because an agent requested it.
4. **Agents cannot self-approve** — approval is deliberately outside `callTool()`. The embedding Hardware Studio host must call `approveProposal(proposalId, reviewer)` after a real human approval interaction. Supplying `userApproved: true` or similar tool arguments does not grant authority.
5. **Approval is intentionally ephemeral** — host approvals are held in memory and are cleared when the MCP core is replaced/restarted. A pending proposal therefore needs fresh human approval after restart instead of silently restoring old authority.
6. **Canonical mutations only** — an approved `draft_requirement` becomes a real `ProductRequirement` with proposal provenance. Generic proposals are limited to safe project metadata. Structural arrays such as components, boards, validation evidence, candidates, or releases cannot be overwritten through a generic patch.
7. **Direct destructive mutation is disabled** — component deletion is not exposed as a normal stdio MCP tool and the legacy `delete_component` call is rejected even if the caller supplies an approval boolean. Destructive domain changes must go through the product host's canonical action and review flow.
8. **Audit reflects what actually happened** — received calls, proposal creation, blocked approval attempts, host approval, apply/reject results, and destructive-operation blocks are recorded. Records that require approval are not stamped `approved: true` unless host approval actually exists.
9. **Release authority stays outside MCP** — the current MCP surface can read revision/release state but does not publish releases or invent artifact evidence. Release Candidate integrity and reviewer sign-off remain governed by Hardware Studio's release workflow.

## Host approval sequence

1. Agent calls `draft_requirement` (or another supported proposal tool).
2. Hardware Studio shows the proposal/diff to the user.
3. The local host records approval with `approveProposal(proposalId, reviewerIdentity)`.
4. Only then can `apply_draft` consume that approval and mutate canonical state.
5. The approval is consumed after a successful apply; replaying the same proposal is rejected.

This boundary is intentionally stricter than trusting an `approved` field supplied by an MCP client. The party asking for a change must not also be able to forge the authorization for that change.
