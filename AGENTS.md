# AGENTS.md — how to work on this repo

Read SPEC.md first. It is the source of truth. If something here conflicts with SPEC.md, SPEC.md wins.

## Non-negotiables
- The model never outputs a date, a deadline, or a computed amount. Code does. If you find yourself asking the model for a date, stop and move it to `/lib/deadlines.ts`.
- Nothing is marked as sent without a user click. Do not add auto-send, even behind a flag.
- Never ask the user for OTP, PIN, CVV, card number, or passwords. Strip OTP-like codes from input.
- Every rule used in a draft must exist in `/rules/rules.md` with `verified: true`.
- Drafts are under 150 words, factual, no threats, no exclamation marks, no "legal action".
- Every action screen shows "This is not legal advice."

## Working style
- Follow the build order in SPEC.md section 13. Do not start screens before the eval harness has a first score.
- Small steps. After each step, run the tests and the eval, and report the numbers.
- When the eval fails, fix in this order: rule sheet clarity, then prompt wording, then UI (ask the user). Explain which one you changed and why.
- Keep the API key server side only.
- Mobile first. Max width 430px. Test at 390px.
- Plain English in all UI text. Short sentences. No legal jargon on screen.
- Do not add features not in SPEC.md. If you think one is needed, list it in `/notes/ideas.md` and continue.

## Files
- `/app` Next.js app router
- `/app/api/agent/route.ts` the only model call
- `/lib/deadlines.ts` all date and money maths, with tests
- `/lib/state.ts` state machine
- `/prompts/system.md`, `/prompts/reply.md`
- `/rules/rules.md`
- `/eval/cases.json`, `/eval/run.ts`, `/eval/report.md`, `/eval/history/`
- `/data/cases.json` local storage in dev

## Definition of done for the prototype
See SPEC.md section 12. All boxes ticked, eval report attached, 5 real cases logged.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
