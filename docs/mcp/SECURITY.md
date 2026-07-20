# Hardware Studio MCP Security & Boundary Model

## Security Principles
1. **Loopback Binding Only**: Local bridges and MCP handlers bind exclusively to `127.0.0.1`.
2. **Reversible Proposals**: Draft tools cannot silently mutate active engineering assets.
3. **Approval Boundaries**: High-impact tool calls throw authorization errors unless `userApproved = true` is supplied.
4. **Audit Trail**: All tool invocations append immutable records to `MCPAuditRecord[]`.
