// Mock data for the step-5 screen walkthrough. This is eval/cases.json's
// C01, run through the same lib/deadlines.ts functions the real API route
// uses (computeDeadline, fillDeadlinePlaceholder) — hand-picked "now" and
// hand-written draft/narrative text stand in for the real model call,
// which is blocked on billing, but the date/word-count maths are the real
// thing, not guessed numbers.

import type { ReactNode } from "react"
import {
  computeDeadline,
  daysBetween,
  fillDeadlinePlaceholder,
  formatDateLabel,
  type ComputedDeadline,
} from "@/lib/deadlines"
import type { TimelineStep } from "@/components/Timeline"
import { Mono, Money } from "@/components/Numeral"
import type { Facts, State } from "@/lib/types"
import type { DefiniteConfidence } from "@/components/StatusPill"

export type ActiveCase = "main" | "escalation" | "blocked" | "upi" | "myntra" | "dgca"

export const INPUT_TEXT =
  "Flipkart. Bought a mixer grinder for 3499 on 2 Aug. Jar has rust. Asked replacement on 4 Aug, they rejected saying photo validation failed. Called 3 times. Now 14 Aug and nothing."

// "Now 14 Aug and nothing" — the case's own reference point.
export const MOCK_NOW = new Date("2026-08-14T00:00:00.000Z")

export const MOCK_FACTS: Facts = {
  company: "Flipkart",
  amount: 3499,
  orderId: null,
  eventDate: "2026-08-02",
  firstComplaintDate: "2026-08-04",
  problem: "Mixer grinder arrived with a rusted jar; replacement request rejected for \"failed photo validation.\"",
}

export const MOCK_RULE = {
  id: "ECOM_RESOLVE_30D",
  law: "Consumer Protection (E-Commerce) Rules 2020, Rule 4(4)",
  says: "The platform must redress the complaint within one month (30 days) of receiving it.",
}

// Rule card screen: "Comparing against {caseType} rules..." — the same
// case type the model would return in AgentModelOutput.caseType, spoken in
// plain words rather than the schema's "ecommerce" enum value.
export const MOCK_CASE_TYPE_LABEL = "e-commerce"

export const MOCK_DEADLINE = computeDeadline(MOCK_FACTS.firstComplaintDate!, { days: 30 }, MOCK_NOW)

// Typed as the broader DefiniteConfidence, not the "high" literal, so
// page.tsx's low-confidence branch (Rule card -> Not Sure) type-checks as
// real, reachable code rather than dead code the compiler could flag.
export const MOCK_CONFIDENCE: DefiniteConfidence = "high"
export const MOCK_CONFIDENCE_REASON =
  "Ecommerce platform, a clear complaint date, and a rule on the sheet that matches."

const DRAFT_RAW_FULL_TEXT = `I bought a mixer grinder from Flipkart on 2 Aug for ₹3,499. The jar arrived rusted, so I requested a replacement on 4 Aug. The replacement was rejected, citing a failed photo validation, and I have since called three times with no resolution.

Under the Consumer Protection (E-Commerce) Rules 2020, a platform must resolve a complaint within one month of receiving it. My complaint was filed on 4 Aug, so the deadline is {{deadline}}.

Please arrange a replacement or a full refund of ₹3,499, and confirm this in writing, by {{deadline}}.`

export const MOCK_DRAFT_SUMMARY = "Follow-up on an unresolved replacement for a damaged mixer grinder."

// Signature is appended after the word count is taken — same rule the real
// pipeline follows in app/api/agent/route.ts: it's added by code, never part
// of the model's (or here, the mock's) 150-word budget.
const MOCK_DRAFT_RENDERED_TEXT = fillDeadlinePlaceholder(DRAFT_RAW_FULL_TEXT, MOCK_DEADLINE)
export const MOCK_DRAFT_WORD_COUNT = MOCK_DRAFT_RENDERED_TEXT.trim().split(/\s+/).filter(Boolean).length
export const MOCK_DRAFT_FULL_TEXT = `${MOCK_DRAFT_RENDERED_TEXT}\n\nSent via Getbaq.`

// Waiting screen: the day after the deadline, per SPEC.md section 9.
export const MOCK_FOLLOW_UP_DATE = computeDeadline(MOCK_DEADLINE.date, { days: 1 })

// Mock company reply + reply-reading result, standing in for the real
// processReply() call (also blocked on billing).
export const MOCK_REPLY_TEXT =
  "We have processed a refund of Rs. 3,499 to your original payment method. Reference: FKRF-88213."
export const MOCK_REPLY_READING =
  "Flipkart says they've refunded ₹3,499 to your original payment method, with a reference number."
export const MOCK_REPLY_VERDICT = "resolved" as const
export const MOCK_REPLY_REASON =
  "The reply names a specific refunded amount and a reference number, not just a vague timeframe."

export const MOCK_RESOLVED_DAYS = 16 // firstComplaintDate (4 Aug) to resolution (20 Aug)
export const MOCK_MESSAGES_SENT = 1
export const MOCK_ESCALATIONS = 0
export const MOCK_CASE_STUDY_NUMBER = 1

// Waiting screen: a small timeline so there's visibly something in motion,
// not just a wall of text. Reused by both the main flow and the Blocked
// path, since neither the shape nor the wording depends on which case it is.
function buildWaitingSteps(sentLabel: string, deadlineLabel: string, followUpLabel: string): TimelineStep[] {
  return [
    { label: "Sent", sublabel: <Mono>{sentLabel}</Mono>, status: "done" },
    { label: "Waiting for reply", sublabel: <>by <Mono>{deadlineLabel}</Mono></>, status: "active" },
    { label: "Auto follow-up", sublabel: <Mono>{followUpLabel}</Mono>, status: "upcoming" },
    { label: "Escalate to 1915", sublabel: "if still no reply", status: "upcoming" },
  ]
}

export const MOCK_SENT_LABEL = formatDateLabel("2026-08-14") // same day as MOCK_NOW
export const MOCK_WAITING_STEPS = buildWaitingSteps(MOCK_SENT_LABEL, MOCK_DEADLINE.label, MOCK_FOLLOW_UP_DATE.label)

// ---- Failure screens (mock data) ----
// SPEC.md section 9's remaining rows, per the build order's "failure
// screens last." Each borrows from a real eval/cases.json case rather than
// inventing a new scenario from scratch.

// Missing info — C02: an ecommerce order with everything except the
// company name. The screen only ever asks about the single most important
// gap, never every gap at once.
export const MISSING_INFO_QUESTION = "Which company or app was this order placed on?"
export const MISSING_INFO_PLACEHOLDER = "e.g. Flipkart, Amazon, Myntra"

// Not sure — C03: a Flipkart order paid cash-on-delivery, never delivered.
// Low confidence because no payment was actually made.
export const NOT_SURE_CASE_TYPE = "ecommerce"
export const NOT_SURE_REASON =
  "No payment appears to have been made (cash on delivery), so there may be no refund to chase."

// Ignored — continues the main C01/Flipkart case on the branch where they
// never reply by the deadline, and code prepares the 1915 escalation.
export const IGNORED_DEADLINE_LABEL = MOCK_DEADLINE.label

const ESCALATION_RULE = {
  id: "NCH_CONVERGENCE_30D",
  law: "National Consumer Helpline convergence programme",
  says: "A convergence-partner company is expected to respond within 30 days of a complaint filed via NCH (1915).",
}
const ESCALATION_CONFIDENCE = "medium" as const
const ESCALATION_CONFIDENCE_REASON =
  "This is a voluntary programme commitment, not a law with a fixed penalty, so I'm somewhat less sure of it than the original rule."
const ESCALATION_DEADLINE = computeDeadline(MOCK_FOLLOW_UP_DATE.date, { days: 30 })
const ESCALATION_RAW_FULL_TEXT = `I complained to Flipkart on 4 Aug about a mixer grinder (₹3,499) with a rusted jar; my replacement request was rejected and I have had no resolution. Their deadline to resolve this under the Consumer Protection (E-Commerce) Rules 2020 has passed with no reply.

I am asking the National Consumer Helpline to take up this complaint. Flipkart is expected to respond within this convergence programme by {{deadline}}.`

const ESCALATION_RENDERED_TEXT = fillDeadlinePlaceholder(ESCALATION_RAW_FULL_TEXT, ESCALATION_DEADLINE)
export const MOCK_ESCALATION_WORD_COUNT = ESCALATION_RENDERED_TEXT.trim().split(/\s+/).filter(Boolean).length
export const MOCK_ESCALATION_DRAFT = {
  amount: MOCK_FACTS.amount!,
  summary: "Escalating an unresolved Flipkart refund complaint to the National Consumer Helpline.",
  ruleSays: ESCALATION_RULE.says,
  confidence: ESCALATION_CONFIDENCE,
  confidenceReason: ESCALATION_CONFIDENCE_REASON,
  deadline: ESCALATION_DEADLINE,
  fullText: `${ESCALATION_RENDERED_TEXT}\n\nSent via Getbaq.`,
}

// Blocked — C10: Mirraw, a smaller merchant with no known grievance email
// on file, so the tool can't send on the user's behalf.
const BLOCKED_NOW = new Date("2026-08-23T00:00:00.000Z")
export const BLOCKED_FACTS: Facts = {
  company: "Mirraw",
  amount: 5600,
  orderId: null,
  eventDate: "2026-08-20",
  firstComplaintDate: "2026-08-22",
  problem: "Wrong-size lehenga arrived, looked used; return rejected citing a no-returns-on-sale-items policy.",
}
export const BLOCKED_RULE = MOCK_RULE // same ECOM_RESOLVE_30D
export const BLOCKED_DEADLINE = computeDeadline(BLOCKED_FACTS.firstComplaintDate!, { days: 30 }, BLOCKED_NOW)
export const BLOCKED_FOLLOW_UP_DATE = computeDeadline(BLOCKED_DEADLINE.date, { days: 1 })
export const BLOCKED_CONFIDENCE = "medium" as const
export const BLOCKED_CONFIDENCE_REASON =
  "The rule requires them to resolve the complaint, but doesn't force them to accept an exchange on a sale item, so I've kept the ask to what the rule actually covers."
const BLOCKED_RAW_FULL_TEXT = `I bought a lehenga from Mirraw on 20 Aug for ₹5,600. It arrived the wrong size and looked used. I complained on 22 Aug and was told there are no returns on sale items.

Under the Consumer Protection (E-Commerce) Rules 2020, a platform must resolve a complaint within one month of receiving it, regardless of its own sale policy. Please arrange an exchange or a full refund of ₹5,600, and confirm this in writing, by {{deadline}}.`
export const BLOCKED_DRAFT_FULL_TEXT = fillDeadlinePlaceholder(BLOCKED_RAW_FULL_TEXT, BLOCKED_DEADLINE)
export const BLOCKED_DRAFT_WORD_COUNT = BLOCKED_DRAFT_FULL_TEXT.trim().split(/\s+/).filter(Boolean).length
export const BLOCKED_WAITING_STEPS = buildWaitingSteps(
  formatDateLabel("2026-08-23"),
  BLOCKED_DEADLINE.label,
  BLOCKED_FOLLOW_UP_DATE.label
)

// UPI failure — C18: a Spotify renewal debited by UPI that never activated.
// Grounds the Home case list's "waiting on the bank" example (RBI_FAILED_UPI_T1,
// corrected to T+1 during the rule-sheet pass).
const UPI_NOW = new Date("2026-09-05T00:00:00.000Z")
export const UPI_FACTS: Facts = {
  company: "Spotify",
  amount: 1189,
  orderId: null,
  eventDate: "2026-09-01",
  firstComplaintDate: "2026-09-01",
  problem: "UPI payment debited for a Spotify renewal the app reported as cancelled; no premium activated.",
}
// Rule text sharpened to name the distinction it's actually catching, not
// just the number that applies here — the same circular sets a slower T+5
// TAT for ATM/card rails, and a generic-sounding "T+1" would read like it
// might just be a guess rather than a case-study-worthy piece of reasoning.
export const UPI_RULE = {
  id: "RBI_FAILED_UPI_T1",
  law: "RBI Circular RBI/2019-20/67, 20 Sep 2019 — TAT for failed transactions",
  says: "UPI failures get a T+1 reversal window — not the T+5 window that applies to ATM or card transactions.",
}
export const UPI_CASE_TYPE_LABEL = "UPI payment"
export const UPI_CONFIDENCE: DefiniteConfidence = "high"
export const UPI_CONFIDENCE_REASON =
  "A clear debit with no credit on the other side, and a bank covered by this circular."
export const UPI_DEADLINE = computeDeadline(UPI_FACTS.firstComplaintDate!, { days: 1 }, UPI_NOW)
export const UPI_SENT_LABEL = formatDateLabel("2026-09-02")
export const UPI_FOLLOW_UP_DATE = computeDeadline(UPI_DEADLINE.date, { days: 1 })
export const UPI_WAITING_STEPS = buildWaitingSteps(UPI_SENT_LABEL, UPI_DEADLINE.label, UPI_FOLLOW_UP_DATE.label)
export const UPI_DAYS_WAITING = 3 // sent 2 Sep, Home's reference "now" is 5 Sep

export const UPI_INPUT_TEXT =
  "Paid Spotify's renewal by UPI on 1 Sep, ₹1,189. App still shows it as cancelled and premium never started, but the money's gone from my account."

const UPI_DRAFT_RAW_FULL_TEXT = `On 1 Sep I paid Spotify ₹1,189 by UPI for a renewal. The app still shows it as cancelled and no premium started, but the amount was debited from my account.

Under RBI's circular on TAT for failed transactions (20 Sep 2019), a failed UPI transfer must be auto-reversed within 1 working day (T+1) — not the 5-day window (T+5) that applies to ATM or card transactions. That deadline was {{deadline}}.

Please reverse this UPI debit of ₹1,189 and confirm in writing, by {{deadline}}.`
export const UPI_DRAFT_SUMMARY = "Chasing a UPI debit to Spotify that was never reversed."
const UPI_DRAFT_RENDERED_TEXT = fillDeadlinePlaceholder(UPI_DRAFT_RAW_FULL_TEXT, UPI_DEADLINE)
export const UPI_DRAFT_WORD_COUNT = UPI_DRAFT_RENDERED_TEXT.trim().split(/\s+/).filter(Boolean).length
export const UPI_DRAFT_FULL_TEXT = `${UPI_DRAFT_RENDERED_TEXT}\n\nSent via Getbaq.`

// Flight, agent-booked — grounds the DGCA split: a ticket bought through a
// travel agent/portal puts the refund duty on the airline within 14 working
// days, not the shorter 7-day window a direct card refund gets. Like the UPI
// case above, this exists so a case-study screenshot shows the agent
// catching a distinction a person could easily get wrong, not just "found
// the company, found the amount."
const DGCA_NOW = new Date("2026-09-10T00:00:00.000Z")
export const DGCA_FACTS: Facts = {
  company: "IndiGo",
  amount: 6450,
  orderId: null,
  eventDate: "2026-09-03",
  firstComplaintDate: "2026-09-03",
  problem: "Flight cancelled by the airline; ticket booked through MakeMyTrip, not directly with the airline.",
}
export const DGCA_RULE = {
  id: "DGCA_AIRLINE_CANCEL_AGENT_14D",
  law: "DGCA Civil Aviation Requirements, Section 3, Series 'M', Part II, para 3(c)",
  says: "Booked through a travel agent, so the airline owes the refund within 14 working days — not the 7-day window that applies to a direct card refund.",
}
export const DGCA_CASE_TYPE_LABEL = "flight cancellation"
export const DGCA_CONFIDENCE: DefiniteConfidence = "high"
export const DGCA_CONFIDENCE_REASON =
  "Booked through a travel agent, so the longer agent-booking window applies, not the shorter one for a direct refund."
export const DGCA_DEADLINE = computeDeadline(DGCA_FACTS.firstComplaintDate!, { days: 14 }, DGCA_NOW)
export const DGCA_SENT_LABEL = formatDateLabel("2026-09-03")
export const DGCA_FOLLOW_UP_DATE = computeDeadline(DGCA_DEADLINE.date, { days: 1 })
export const DGCA_WAITING_STEPS = buildWaitingSteps(DGCA_SENT_LABEL, DGCA_DEADLINE.label, DGCA_FOLLOW_UP_DATE.label)

export const DGCA_INPUT_TEXT =
  "My IndiGo flight on 3 Sep got cancelled by the airline. I'd booked it through MakeMyTrip, not directly, and still haven't got a refund."

const DGCA_DRAFT_RAW_FULL_TEXT = `My IndiGo flight on 3 Sep was cancelled by the airline. I booked through MakeMyTrip, not directly with IndiGo, and have not received a refund.

Booked through a travel agent, so under DGCA's Civil Aviation Requirements, the airline owes the refund within 14 working days — not the 7-day window that applies to a direct card refund. That deadline is {{deadline}}.

Please refund ₹6,450 to my original payment method and confirm this in writing, by {{deadline}}.`
export const DGCA_DRAFT_SUMMARY = "Chasing an airline refund for a flight cancelled on a travel-agent booking."
const DGCA_DRAFT_RENDERED_TEXT = fillDeadlinePlaceholder(DGCA_DRAFT_RAW_FULL_TEXT, DGCA_DEADLINE)
export const DGCA_DRAFT_WORD_COUNT = DGCA_DRAFT_RENDERED_TEXT.trim().split(/\s+/).filter(Boolean).length
export const DGCA_DRAFT_FULL_TEXT = `${DGCA_DRAFT_RENDERED_TEXT}\n\nSent via Getbaq.`

// ---- Case-study screenshot content (Reading / Rule card / Approve) ----
// These three screens don't branch on activeCase individually the way
// Waiting/Resolved do — they all just render whichever scenario's "content"
// this is, looked up once per card. `main` (Flipkart) is the hero-flow
// default; `upi` and `dgca` exist so a fresh case can be walked start to
// finish showing a sharp, checkable piece of rule reasoning instead of a
// generic "found the company, found the amount" result.
export type ContentCase = "main" | "upi" | "dgca"

type CaseContent = {
  inputText: string
  facts: Facts
  rule: { id: string; law: string; says: string }
  deadline: ComputedDeadline
  confidence: DefiniteConfidence
  confidenceReason: string
  caseTypeLabel: string
  draftSummary: string
  draftFullText: string
  draftWordCount: number
}

export const CASE_CONTENT: Record<ContentCase, CaseContent> = {
  main: {
    inputText: INPUT_TEXT,
    facts: MOCK_FACTS,
    rule: MOCK_RULE,
    deadline: MOCK_DEADLINE,
    confidence: MOCK_CONFIDENCE,
    confidenceReason: MOCK_CONFIDENCE_REASON,
    caseTypeLabel: MOCK_CASE_TYPE_LABEL,
    draftSummary: MOCK_DRAFT_SUMMARY,
    draftFullText: MOCK_DRAFT_FULL_TEXT,
    draftWordCount: MOCK_DRAFT_WORD_COUNT,
  },
  upi: {
    inputText: UPI_INPUT_TEXT,
    facts: UPI_FACTS,
    rule: UPI_RULE,
    deadline: UPI_DEADLINE,
    confidence: UPI_CONFIDENCE,
    confidenceReason: UPI_CONFIDENCE_REASON,
    caseTypeLabel: UPI_CASE_TYPE_LABEL,
    draftSummary: UPI_DRAFT_SUMMARY,
    draftFullText: UPI_DRAFT_FULL_TEXT,
    draftWordCount: UPI_DRAFT_WORD_COUNT,
  },
  dgca: {
    inputText: DGCA_INPUT_TEXT,
    facts: DGCA_FACTS,
    rule: DGCA_RULE,
    deadline: DGCA_DEADLINE,
    confidence: DGCA_CONFIDENCE,
    confidenceReason: DGCA_CONFIDENCE_REASON,
    caseTypeLabel: DGCA_CASE_TYPE_LABEL,
    draftSummary: DGCA_DRAFT_SUMMARY,
    draftFullText: DGCA_DRAFT_FULL_TEXT,
    draftWordCount: DGCA_DRAFT_WORD_COUNT,
  },
}

export function contentCaseFor(activeCase: ActiveCase): ContentCase {
  return activeCase === "upi" || activeCase === "dgca" ? activeCase : "main"
}

// Myntra — C05: a return refund that came through cleanly, standing in for
// the Home case list's "already resolved" example (a different company from
// the main Flipkart case, so Home doesn't show the same company twice).
export const MYNTRA_FACTS: Facts = {
  company: "Myntra",
  amount: 2689,
  orderId: null,
  eventDate: "2026-09-01",
  firstComplaintDate: "2026-09-03",
  problem: "Return picked up and refund initiated in-app, but nothing landed in the bank.",
}
export const MYNTRA_RESOLVED_DAYS = 12 // firstComplaintDate (3 Sep) to resolution (15 Sep)
export const MYNTRA_MESSAGES_SENT = 1
export const MYNTRA_ESCALATIONS = 0
export const MYNTRA_CASE_STUDY_NUMBER = 2

// Out of scope — C26: Byju's took out a loan in the user's name. A credit
// dispute, not a refund complaint this tool can draft.
export const OUT_OF_SCOPE_REASON =
  "Byju's took out a loan in your name to pay for the course — that's a loan and credit issue, not a refund complaint I can draft."
export const OUT_OF_SCOPE_WHERE_TO_GO =
  "This needs a lawyer or India's e-Jagriti consumer portal (e-jagriti.gov.in), not a refund complaint."

// ---- Agent-voice status line ----
// Replaces a "Case · Flipkart · ₹3,499 · Waiting" breadcrumb with one
// sentence per state, authored the way the agent would actually say it —
// see components/AgentLine.tsx. Numbers still render in mono wherever they
// appear, same as everywhere else in the app.
export function agentLineFor(state: State, activeCase: ActiveCase): ReactNode {
  switch (state) {
    case "INTAKE":
      return "Let's get your refund moving."
    case "READING":
      return "Making sense of what you sent."
    case "CHECK_FACTS": {
      const { company } = CASE_CONTENT[contentCaseFor(activeCase)].facts
      return <>Let&apos;s make sure I&apos;ve got {company} right.</>
    }
    case "RULE_CARD": {
      const { company } = CASE_CONTENT[contentCaseFor(activeCase)].facts
      return <>Found the rule that covers {company}&apos;s window.</>
    }
    case "APPROVE": {
      if (activeCase === "escalation") return "Ready to escalate to the National Consumer Helpline."
      const { company, amount } = CASE_CONTENT[contentCaseFor(activeCase)].facts
      return (
        <>
          Ready to send to {company} — <Money amount={amount!} /> on the line.
        </>
      )
    }
    case "WAITING":
      if (activeCase === "escalation") return "Watching for the National Consumer Helpline's reply."
      if (activeCase === "blocked")
        return (
          <>
            Watching for {BLOCKED_FACTS.company} to reply by <Mono>{BLOCKED_DEADLINE.label}</Mono>.
          </>
        )
      if (activeCase === "upi")
        return (
          <>
            Watching for your bank to reply by <Mono>{UPI_DEADLINE.label}</Mono>.
          </>
        )
      if (activeCase === "dgca")
        return (
          <>
            Watching for {DGCA_FACTS.company} to reply by <Mono>{DGCA_DEADLINE.label}</Mono>.
          </>
        )
      return (
        <>
          Watching for {MOCK_FACTS.company} to reply by <Mono>{MOCK_DEADLINE.label}</Mono>.
        </>
      )
    case "REPLY_READ":
      return <>{MOCK_FACTS.company} replied — here&apos;s what it means.</>
    case "RESOLVED":
      if (activeCase === "myntra")
        return (
          <>
            <Money amount={MYNTRA_FACTS.amount!} /> is back in your account.
          </>
        )
      return (
        <>
          <Money amount={MOCK_FACTS.amount!} /> is back in your account.
        </>
      )
    case "MISSING_INFO":
      return "One thing I need before I can go further."
    case "NOT_SURE":
      return "I'm not fully sure about this one."
    case "IGNORED":
      return "Flipkart went quiet. Moving this to 1915."
    case "BLOCKED":
      return "I can't send this one myself."
    case "OUT_OF_SCOPE":
      return "This one's outside what I can help with."
    default:
      return ""
  }
}

// ---- Pinned case header ----
// agentLineFor's narrated sentence replaced a static "Case · Flipkart ·
// ₹3,499 · Waiting" breadcrumb (see the comment above it) with something
// that reads like the agent talking, not a label. But a narrated line
// scrolls away with the rest of the thread — once you're a few cards down,
// there's nothing pinned on screen saying which case, company, or amount
// you're even looking at, the way a contact name stays pinned at the top of
// a real messaging app regardless of how far you've scrolled. This is that
// pinned identity, used only in ScreenShell's header — not a replacement
// for agentLineFor's in-thread narration, which keeps doing its own job.
export function caseIdentityFor(
  activeCase: ActiveCase,
  state: State
): { company: string | null; amount: number | null } {
  if (activeCase === "main" && state === "MISSING_INFO") {
    return { company: null, amount: MISSING_INFO_AMOUNT }
  }
  switch (activeCase) {
    case "blocked":
      return { company: BLOCKED_FACTS.company, amount: BLOCKED_FACTS.amount }
    case "upi":
      return { company: UPI_FACTS.company, amount: UPI_FACTS.amount }
    case "dgca":
      return { company: DGCA_FACTS.company, amount: DGCA_FACTS.amount }
    case "myntra":
      return { company: MYNTRA_FACTS.company, amount: MYNTRA_FACTS.amount }
    case "escalation":
      return { company: "National Consumer Helpline", amount: MOCK_ESCALATION_DRAFT.amount }
    case "main":
      return { company: MOCK_FACTS.company, amount: MOCK_FACTS.amount }
  }
}

// ---- Home case list ----
// A returning user's cases, each a separate scenario already defined above —
// Home just points at whichever (state, activeCase) pair opens that case
// back up where it left off. "Days open" is real daysBetween() math against
// each case's own createdAt, not a guessed number.

export type CaseSummary = {
  id: string
  company: string | null
  amount: number | null
  state: State
  activeCase: ActiveCase
  createdAt: string
  daysOpen: number
  daysWaiting?: number // WAITING/SENT only — days since sent, not since createdAt
}

// C03: "order from 2019 still shows pending" — no exact date given, so this
// picks a plausible one for that year to compute a (deliberately large)
// days-open number, same spirit as the source's own "pending 6 years" framing.
const NOT_SURE_CREATED_AT = "2019-01-15"
const NOT_SURE_NOW = new Date("2026-09-15T00:00:00.000Z")

// C26 gives no dates at all; this is a reasonable recent one, not sourced.
const OUT_OF_SCOPE_CREATED_AT = "2026-08-01"
const OUT_OF_SCOPE_NOW = new Date("2026-09-15T00:00:00.000Z")

// C02: "today 12 Sep" is the case's own reference point.
const MISSING_INFO_CREATED_AT = "2026-08-25"
const MISSING_INFO_NOW = new Date("2026-09-12T00:00:00.000Z")
export const MISSING_INFO_AMOUNT = 47490

export const MOCK_CASES: CaseSummary[] = [
  {
    id: "flipkart-mixer",
    company: MOCK_FACTS.company,
    amount: MOCK_FACTS.amount,
    state: "APPROVE",
    activeCase: "main",
    createdAt: MOCK_FACTS.firstComplaintDate!,
    daysOpen: daysBetween(MOCK_FACTS.firstComplaintDate!, MOCK_NOW),
  },
  {
    id: "mirraw-lehenga",
    company: BLOCKED_FACTS.company,
    amount: BLOCKED_FACTS.amount,
    state: "BLOCKED",
    activeCase: "blocked",
    createdAt: BLOCKED_FACTS.firstComplaintDate!,
    daysOpen: daysBetween(BLOCKED_FACTS.firstComplaintDate!, BLOCKED_NOW),
  },
  {
    id: "spotify-upi",
    company: UPI_FACTS.company,
    amount: UPI_FACTS.amount,
    state: "WAITING",
    activeCase: "upi",
    createdAt: UPI_FACTS.firstComplaintDate!,
    daysOpen: daysBetween(UPI_FACTS.firstComplaintDate!, UPI_NOW),
    daysWaiting: UPI_DAYS_WAITING,
  },
  {
    id: "myntra-return",
    company: MYNTRA_FACTS.company,
    amount: MYNTRA_FACTS.amount,
    state: "RESOLVED",
    activeCase: "myntra",
    createdAt: MYNTRA_FACTS.firstComplaintDate!,
    daysOpen: MYNTRA_RESOLVED_DAYS,
  },
  {
    id: "flipkart-2019",
    company: "Flipkart",
    amount: null,
    state: "NOT_SURE",
    activeCase: "main",
    createdAt: NOT_SURE_CREATED_AT,
    daysOpen: daysBetween(NOT_SURE_CREATED_AT, NOT_SURE_NOW),
  },
  {
    id: "byjus-loan",
    company: "Byju's",
    amount: 78000,
    state: "OUT_OF_SCOPE",
    activeCase: "main",
    createdAt: OUT_OF_SCOPE_CREATED_AT,
    daysOpen: daysBetween(OUT_OF_SCOPE_CREATED_AT, OUT_OF_SCOPE_NOW),
  },
  {
    id: "phone-order",
    company: null,
    amount: MISSING_INFO_AMOUNT,
    state: "MISSING_INFO",
    activeCase: "main",
    createdAt: MISSING_INFO_CREATED_AT,
    daysOpen: daysBetween(MISSING_INFO_CREATED_AT, MISSING_INFO_NOW),
  },
]
