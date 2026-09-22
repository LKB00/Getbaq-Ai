# SPEC.md — Refund Agent prototype

## 0. One paragraph

A web prototype of an AI agent that helps a young Indian get a stuck refund back. The person shares a screenshot or pastes the chat. The agent reads it, finds the rule, drafts a short factual complaint, and asks for one tap before sending anything. Code, not the model, calculates every deadline and rupee. The prototype makes real LLM calls and ships with an eval harness of 30 real cases.

## 1. Goals and non-goals

Goals
- Prove the hero flow end to end with a real model call.
- Show all AI states: reading, missing info, low confidence, draft ready, waiting, reply read, ignored, blocked, resolved, out of scope.
- Run 30 real cases through the model and produce an eval report with pass/fail per check.
- Be usable on a phone for 5 real refund cases by copy-paste.

Non-goals
- No real WhatsApp integration. The UI looks and behaves like a chat. Sending is simulated: the app produces the message and a mailto: link or copy button.
- No accounts, no payments, no legal notices, no court filing.
- No legal advice. The agent explains rules and drafts complaints only.

## 2. Tech

- Next.js (App Router) + React + Tailwind. Mobile-first, max width 430px.
- Anthropic Messages API, server side only (`/app/api/agent/route.ts`). Never expose the key to the browser.
- Model: `claude-sonnet-4-6`. Use structured JSON output. Temperature 0.
- Storage: local JSON file in dev (`/data/cases.json`). One case = one object. No database.
- Dates: `date-fns`. All deadline maths in `/lib/deadlines.ts`. The model never outputs a date; it outputs the rule id and the event dates it read, code computes the deadline.
- Screenshots: the model receives images directly (vision). Also accept pasted text.
- Eval: `/eval/cases.json`, `/eval/run.ts`, output `/eval/report.md`.

## 3. Architecture

```
Browser (chat UI)
   -> POST /api/agent  { caseId, step, input }
        -> loads case from /data
        -> builds prompt from /prompts/system.md + /rules/rules.md
        -> calls Claude, expects JSON (schema in section 6)
        -> validates JSON with zod
        -> runs deadlines.ts on the extracted facts
        -> decides next screen from state machine (section 5)
        -> saves case, returns { state, view }
```

Rule: the model returns facts and judgments. Code returns dates, amounts, and the next state.

## 4. Data model

```ts
type Case = {
  id: string
  createdAt: string
  channelHint: "ecommerce" | "travel" | "upi_failed" | "edtech_subscription" | "other" | null
  facts: {
    company: string | null
    amount: number | null           // INR, integer
    orderId: string | null
    eventDate: string | null        // ISO date of cancel / debit / return pickup
    firstComplaintDate: string | null
    problem: string | null          // one line
  }
  missingFacts: string[]
  ruleId: string | null             // from rules.md ids
  confidence: "high" | "medium" | "low" | null
  confidenceReason: string | null
  deadline: { date: string; label: string; missed: boolean } | null   // computed by code
  draft: { summary: string; fullText: string; wordCount: number } | null
  actions: Array<{
    at: string
    type: "sent_company" | "sent_1915" | "manual_send" | "reply_logged" | "resolved"
    channel: string
    approvedByUser: true            // always true, enforced
    text?: string
  }>
  replies: Array<{ at: string; text: string; reading?: string; verdict?: "resolved" | "not_resolved" | "needs_info" }>
  state: State
  outcome: { refunded: boolean; amount: number | null; days: number | null } | null
}
```

## 5. State machine

```
INTAKE -> READING -> (MISSING_INFO | NOT_SURE | OUT_OF_SCOPE | CHECK_FACTS)
CHECK_FACTS -> RULE_CARD -> DRAFT_READY -> APPROVE
APPROVE -> (SENT | BLOCKED)
SENT -> WAITING
WAITING -> (REPLY_READ | IGNORED)         // IGNORED when deadline passed with no reply
REPLY_READ -> (RESOLVED | DRAFT_READY)    // DRAFT_READY again means escalate: next channel
IGNORED -> DRAFT_READY                    // escalation draft to 1915
BLOCKED -> WAITING                        // user sent it manually, agent keeps tracking
```

Transitions that need a user tap: CHECK_FACTS confirm, APPROVE send, BLOCKED "I sent it", REPLY_READ paste reply, RESOLVED confirm.
Transitions decided by model: READING result, REPLY_READ verdict.
Transitions decided by code: IGNORED (deadline), OUT_OF_SCOPE routing when model flags it, escalation channel choice.

Escalation ladder (code): company grievance officer email -> National Consumer Helpline (1915 / WhatsApp 8800001915 / consumerhelpline.gov.in) -> stop and show e-Jagriti info (no filing).
UPI failed cases: bank/PSP complaint -> RBI Integrated Ombudsman (cms.rbi.org.in) info after 30 days.
Cyber fraud: OUT_OF_SCOPE, show 1930.

## 6. Model output schema (zod)

```ts
{
  caseType: "ecommerce" | "travel" | "upi_failed" | "edtech_subscription" | "other" | "out_of_scope",
  outOfScopeReason: string | null,
  facts: { company, amount, orderId, eventDate, firstComplaintDate, problem },   // nulls allowed
  missingFacts: string[],                     // human readable, max 3
  ruleId: string | null,                      // must exist in rules.md
  confidence: "high" | "medium" | "low",
  confidenceReason: string,                   // one line
  draft: { summary: string; fullText: string } | null,   // fullText <= 150 words
  suggestedChannel: "company" | "nch_1915" | "bank" | "none"
}
```

Validation in code:
- If `ruleId` not in rules list -> treat as `confidence: low`, state NOT_SURE, log as eval failure "invented rule".
- If `draft.fullText` > 150 words -> reject and re-ask model once with "shorten".
- If draft contains any of: "sue", "legal action", "lawyer", "court" (unless caseType needs 1915 info), "!" -> flag "tone" and re-ask once.
- If `confidence: low` -> never show APPROVE; show NOT_SURE with `missingFacts[0]` or the confidence reason as a yes/no question.

## 7. Prompt (`/prompts/system.md`)

```
You help a person in India write and manage a refund complaint.
You are not a lawyer. You never give legal advice. You never predict outcomes.
You only use the rules in the RULES section. Never invent a rule, section number, or timeline.
You never ask for OTP, PIN, CVV, card number, or bank password.
Amounts must be copied exactly from the input. If not visible, set null and add to missingFacts.
Dates must be copied exactly. Never calculate a deadline. Code does that.

Tone for drafts: short, factual, polite, no emotion, no threats, no exclamation marks.
Under 150 words. Structure: what was bought, what went wrong with dates, what the rule requires, what you ask for and by when (use the placeholder {{deadline}} which code fills in).

Return only JSON matching the schema below. No prose.

SCHEMA: ...
RULES: ...
```

User turn = images + text + `caseType hint` + any previous facts.

Reply-reading prompt (`/prompts/reply.md`): given the company reply, return `{ reading: one line in plain words, verdict: resolved | not_resolved | needs_info, reason }`. "5 to 7 working days" with no date and no refund reference = not_resolved.

## 8. Rule sheet (`/rules/rules.md`)

Each rule has an id, plain English, timeline fields code can read, and a source link. Code reads the YAML block.

```yaml
- id: ECOM_ACK_48H
  law: Consumer Protection (E-Commerce) Rules 2020, grievance officer
  says: The platform must acknowledge a complaint within 48 hours and give a ticket number.
  from: firstComplaintDate
  hours: 48
  source: https://www.indiacode.nic.in/  (verify exact rule text)

- id: ECOM_RESOLVE_30D
  law: Consumer Protection (E-Commerce) Rules 2020
  says: The platform must resolve the complaint within one month.
  from: firstComplaintDate
  days: 30
  source: (same)

- id: RBI_FAILED_TXN_T5
  law: RBI circular 20 Sep 2019, harmonisation of TAT for failed transactions
  says: A failed digital payment must be auto reversed within T+5 days. After that the bank pays ₹100 per day.
  from: eventDate
  days: 5
  penaltyPerDay: 100
  source: https://www.rbi.org.in/

- id: RBI_OMBUDSMAN_30D
  law: RBI Integrated Ombudsman Scheme 2021
  says: If the bank does not resolve in 30 days, you can complain to the RBI Ombudsman for free.
  from: firstComplaintDate
  days: 30
  source: https://cms.rbi.org.in/

- id: DGCA_AIRLINE_CANCEL_7D
  law: DGCA CAR on refunds
  says: If the airline cancels, full refund within 7 days for card payments; for agent bookings the airline is responsible, within 14 working days.
  from: eventDate
  days: 7
  source: https://www.dgca.gov.in/  (verify 2026 CAR text and dates)

- id: NCH_CONVERGENCE_30D
  law: National Consumer Helpline convergence programme
  says: A convergence partner company is expected to respond within 30 days of the NCH complaint.
  from: nchComplaintDate
  days: 30
  source: https://consumerhelpline.gov.in/

- id: IT_RULES_INTERMEDIARY_15D
  law: IT Rules 2021, Rule 3(2)
  says: An intermediary (like a bus ticket app) must acknowledge in 24 hours and dispose of the complaint in 15 days.
  from: firstComplaintDate
  days: 15
  source: https://www.meity.gov.in/
```

Add a short "not covered" list: cyber fraud (1930), coaching institute contracts beyond simple refund, anything needing a court. The model must pick `out_of_scope` for these.

Verify every source and date before the demo. Mark unverified rows with `verified: false` and do not use them in drafts.

## 9. Screens (mobile, chat style)

| Screen | Key elements | Rules |
|---|---|---|
| Intake | Empty state with one line: "Share the screenshot of their reply, or paste the chat." Suggestion chips: "Order cancelled, no refund", "UPI failed, money gone", "Flight cancelled". | Chips only fill the hint. No form. |
| Reading | Facts appear one per line as they are parsed. | Stream by content. No spinner alone. |
| Missing info | Asks exactly one thing. | Never two questions. |
| Not sure | "I think this is a [type] case, but I am not sure. Is that right?" Yes / No. Reason shown. | No approve button here. |
| Check facts | Company, amount, order id, date, problem as editable rows. Confirm. | Amount field is numeric only. |
| Rule card | Rule in one line, deadline date, missed or not, confidence label with reason. | Deadline comes from code. |
| Approve | Summary, rule and deadline cards, confidence, "Send it", Edit, Not now, collapsed full text with word count, footer: sent from your email, nothing goes out without your tap, not legal advice. | Only one strong button. |
| Sent / Blocked | Sent: mailto link opened, copy button, "Sent on [date]". Blocked: "I cannot send this one. Copy and send it. I will keep tracking." with an "I sent it" button. | Blocked is default if no grievance email is known. |
| Waiting | "They must reply by [date]. I follow up on [date+1]. You can stop checking." Paste reply button. | Timer from code. |
| Reply read | One line reading, verdict, next step with approve. | Model reads, code routes. |
| Ignored | "No reply by [date]. I prepared the 1915 complaint." Approve flow again. | Only after deadline. |
| Resolved | Amount, days, messages sent, escalations. Share card. | The case study number. |
| Out of scope | Correct place to go (1930, e-Jagriti, RBI ombudsman) in one line. | Never pretend to help. |

Every screen shows a small status line at top: `Case · Flipkart · ₹2,340 · Waiting`.

## 10. Eval harness

- `/eval/cases.json`: 30 cases. Fields: id, source URL, inputText (anonymised), expected: { caseType, ruleId, amount, channel }, notes.
- `/eval/run.ts`: runs each case through the same server function, no UI. Writes `/eval/report.md` with a table: case id, caseType ok, ruleId ok, amount ok (exact), no invented facts (manual column), tone ok (regex + manual column), confidence, notes.
- Score = percent of cases passing all automatic checks. Print before/after when prompt or rules change. Keep old reports in `/eval/history/`.
- Run three times per case (temperature 0 still varies with images). A case passes only if all three runs pass.

## 11. Guardrails (must)

- Approval is enforced in code: no `actions[]` entry can be written without `approvedByUser: true` coming from a user click event.
- Refuse and log if input contains OTP-like 6 digit codes next to words like OTP or PIN. Show: "Do not share OTPs. I removed it."
- Footer on every action screen: "This is not legal advice."
- No dark patterns: "Not now" is as visible as "Edit".

## 12. Acceptance checklist

- [ ] Hero flow works on a phone with a real Flipkart-style screenshot in under 60 seconds to Approve.
- [ ] Low confidence case shows Not sure and never shows Approve.
- [ ] Deadline shown is computed by code and matches a hand calculation.
- [ ] Draft is under 150 words, factual, cites one rule from the sheet.
- [ ] Eval report exists with 30 cases and a pass rate.
- [ ] Blocked state works when no grievance email is known.
- [ ] Nothing can be marked sent without a tap.
- [ ] Every rule used in a draft has `verified: true`.

## 13. Build order

1. Data model, state machine, deadlines.ts with unit tests.
2. Rule sheet with verified rows only.
3. Prompt + API route + zod validation. Test with 3 cases in the terminal.
4. Eval harness. Get a first score. Do error analysis by hand. Fix rules, then prompt.
5. Screens, in hero flow order. Failure screens last.
6. Run 5 real cases. Log outcomes for the case study.
