# Claude repository guidance

Read and obey [`AGENTS.md`](AGENTS.md) before changing Hardware Studio.

`AGENTS.md` is the primary repository operating contract for AI coding agents. It defines the current source-of-truth order, Studio shell grammar, truthfulness rules, parent engineering boundaries, exact-head CI discipline, landing-page freeze, URL rules, and documentation requirements.

## Current execution pointer

**Documentation sync:** 2026-09-02  
**Master at sync:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Active Studio phase:** U8 — Release convergence  
**Structurally converged Studio phases:** U0–U7

Do not infer that U0–U7 engineering domains are complete. In particular, #15–#21 remain deep engineering authorities for PCB, Mechanical, Firmware, Validation, versions/releases, and qualified outputs.

Before broad implementation work, also read:

- `docs/CURRENT_STATUS.md`
- `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`
- `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/SAFETY_AND_LIMITATIONS.md`

Research material under `docs/research/` is reference material, not proof that a capability exists in production.

For every production PR, use the exact-head gate described in `AGENTS.md` and update the appropriate status/domain documentation after merge.
