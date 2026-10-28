# INKLOOM AI — Brand Governance That Explains Itself.
Round 02 · The Build — a Code Busters project. **Demo environment**: frontend-only React + Vite + Tailwind prototype.

## Run
`npm install && npm run dev` · production: `npm run build`. No environment variables or API keys are needed.

## Implemented
Entry screen, app shell, dashboard (state-derived), brand rule CRUD, content editor, deterministic audit engine (`src/services/auditEngine.js`), findings with filters/dismiss/editable suggestions/apply, demo AI assistant (`assistantService.js`, local templates, no LLM), review workflow with simulated roles, revision history with snapshots, insights, settings/reset. State persists in localStorage (`inkloom-v1`).

## Walkthrough
Enter demo, open Content Audit, load a Social Media sample, Run Brand Audit, select the claim finding, edit and apply the suggestion, re-run, Submit for Review, switch role to Reviewer, approve.

## Known limitations
No backend, no real auth, rule-based engine (not AI), demo assistant (no LLM), no external fact verification, browser-local data only, no multi-user collaboration or server audit trail, basic readability heuristics only. Future: secure backend proxy for an organizer-permitted LLM; keys never in browser code.
