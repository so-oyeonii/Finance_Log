# Dragon Money Agent Team

This project was planned with a Claude agent team stored outside the repo:

`C:\Users\sooyun\Documents\vibecoding\claude_team\teams\dragonmoney`

Use those role files as product guidance when upgrading this app:

- `planner-ux`: fast ledger entry, onboarding, empty states, mobile flows
- `finance-domain-expert`: money accuracy, savings, portfolio, tax assumptions
- `fullstack-dev`: Next.js, Dexie, Supabase sync, PWA, state management
- `ai-engineer`: receipt/image parsing, smart input, AI routes
- `viz-designer`: dashboard hierarchy, chart choices, mode visual language

Codex can reuse these roles by spawning parallel sub-agents for read-only audit or scoped implementation work. For implementation, prefer the current repo patterns and keep changes small enough to verify.

Current upgrade priorities:

1. Protect financial data integrity before adding features.
2. Make manual and AI-assisted transaction entry fast from anywhere in the app.
3. Keep AI optional: useful for receipt/screenshots, not required for daily ledger use.
4. Improve dashboard hierarchy and chart clarity after the ledger flow is reliable.
