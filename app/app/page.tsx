"use client"

import { useEffect, useRef, useState } from "react"
import { computeDeadline, formatDateLabel } from "@/lib/deadlines"
import { transition } from "@/lib/state"
import type { State } from "@/lib/types"
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion"
import { useIsDesktop } from "@/components/useIsDesktop"
import { useIsTouchDevice } from "@/components/useIsTouchDevice"
import { ScreenShell } from "@/components/ScreenShell"
import { AgentLine } from "@/components/AgentLine"
import { CaseDrawer } from "@/components/CaseDrawer"
import { CaseSidebar } from "@/components/CaseSidebar"
import { IntakeIntro, IntakeComposer } from "@/components/screens/IntakeScreen"
import { SentMessage } from "@/components/SentMessage"
import { ReadingScreen } from "@/components/screens/ReadingScreen"
import { CheckFactsScreen } from "@/components/screens/CheckFactsScreen"
import { RuleCardScreen } from "@/components/screens/RuleCardScreen"
import { ApproveScreen } from "@/components/screens/ApproveScreen"
import { WaitingScreen } from "@/components/screens/WaitingScreen"
import { ReplyReadScreen } from "@/components/screens/ReplyReadScreen"
import { ResolvedScreen } from "@/components/screens/ResolvedScreen"
import { MissingInfoScreen } from "@/components/screens/MissingInfoScreen"
import { NotSureScreen } from "@/components/screens/NotSureScreen"
import { IgnoredScreen } from "@/components/screens/IgnoredScreen"
import { BlockedScreen } from "@/components/screens/BlockedScreen"
import { OutOfScopeScreen } from "@/components/screens/OutOfScopeScreen"
import { SecondaryButton } from "@/components/Buttons"
import { Mono, Money } from "@/components/Numeral"
import { caseStatusWord } from "@/lib/status"
import {
  agentLineFor,
  caseIdentityFor,
  BLOCKED_DEADLINE,
  BLOCKED_DRAFT_FULL_TEXT,
  BLOCKED_DRAFT_WORD_COUNT,
  BLOCKED_FACTS,
  BLOCKED_FOLLOW_UP_DATE,
  BLOCKED_WAITING_STEPS,
  CASE_CONTENT,
  contentCaseFor,
  DGCA_DEADLINE,
  DGCA_FACTS,
  DGCA_FOLLOW_UP_DATE,
  DGCA_WAITING_STEPS,
  IGNORED_DEADLINE_LABEL,
  MOCK_CASE_STUDY_NUMBER,
  MOCK_CASES,
  MOCK_DEADLINE,
  MOCK_ESCALATION_DRAFT,
  MOCK_ESCALATION_WORD_COUNT,
  MOCK_ESCALATIONS,
  MOCK_FACTS,
  MOCK_FOLLOW_UP_DATE,
  MOCK_MESSAGES_SENT,
  MISSING_INFO_PLACEHOLDER,
  MISSING_INFO_QUESTION,
  MOCK_REPLY_READING,
  MOCK_REPLY_REASON,
  MOCK_REPLY_TEXT,
  MOCK_REPLY_VERDICT,
  MOCK_RESOLVED_DAYS,
  MOCK_WAITING_STEPS,
  MYNTRA_CASE_STUDY_NUMBER,
  MYNTRA_ESCALATIONS,
  MYNTRA_FACTS,
  MYNTRA_MESSAGES_SENT,
  MYNTRA_RESOLVED_DAYS,
  NOT_SURE_CASE_TYPE,
  NOT_SURE_REASON,
  OUT_OF_SCOPE_REASON,
  OUT_OF_SCOPE_WHERE_TO_GO,
  UPI_DEADLINE,
  UPI_FACTS,
  UPI_FOLLOW_UP_DATE,
  UPI_WAITING_STEPS,
  type ActiveCase,
  type CaseSummary,
} from "../mock-case"

// This is a hero-flow-plus-failure-screens walkthrough of SPEC.md section
// 9, on hardcoded mock data — no /app/api/agent call happens here.
//
// A case is one continuously growing thread, not a screen per state: each
// transition APPENDS a card rather than replacing the view (real AI
// products never navigate you to a new page per step). `history` is the
// ordered list of states this case has passed through; every entry but the
// last renders "settled" (its own record of what happened, no longer
// interactive) and the last renders live. Each entry also freezes the
// `activeCase` mock-dataset variant it was pushed with, since activeCase
// itself can change mid-thread (e.g. Ignored -> escalation) without
// rewriting earlier entries' data.
//
// Screen transitions that ARE modeled in lib/state.ts's diagram go through
// transition() for real: Ignored -> (escalation) Approve -> Waiting, and
// Blocked -> Waiting, both use the real state machine, just with a second
// mock dataset ("escalation" / "blocked") swapped in for whichever shared
// card (Approve, Waiting) they land on. "Edit" appending a fresh Check
// facts card, and the dev picker jumping straight to a failure state, are
// the exceptions: the diagram has no such edges, so those are plain UI
// navigation, not transition() calls.
//
// Demo-only affordances (the "load this for me" shortcuts, and the picker
// below) are gated behind ?dev=1 so a plain screenshot or recording of this
// URL never shows them.

type HistoryItem = { state: State; activeCase: ActiveCase }

// These screens open with their own real narration (Reading, Rule card,
// Reply read) or are the user's own turn (Intake) — a separate agent-line
// preface above them would just repeat what the card already says.
const SELF_NARRATING: State[] = ["INTAKE", "READING", "RULE_CARD", "REPLY_READ"]

const FAILURE_STATES: State[] = ["MISSING_INFO", "NOT_SURE", "IGNORED", "BLOCKED", "OUT_OF_SCOPE"]

export default function Home() {
  // ChatGPT/Claude-shaped, not a home-page-first app: the landing screen is
  // always a fresh new case (Intake) — see SPEC.md's hero flow — and past
  // cases live behind the menu (CaseDrawer), never on their own page. This
  // toggle exists only so the dev picker can demo the drawer's empty state.
  const [simulateEmptyCases, setSimulateEmptyCases] = useState(false)
  const cases = simulateEmptyCases ? [] : MOCK_CASES
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([{ state: "INTAKE", activeCase: "main" }])
  const [activeCase, setActiveCase] = useState<ActiveCase>("main")
  // Set only via the Waiting screen's "I got it resolved another way" path —
  // when present it overrides the mock amount shown on Resolved, same as if
  // the AI had read a reply confirming that figure.
  const [manualResolution, setManualResolution] = useState<{ amount: number; date: string } | null>(null)
  // What the user typed/pasted into Intake, kept only so the settled Intake
  // card can render it back as their own sent message — this app has no
  // real Case object to log it onto.
  const [submittedText, setSubmittedText] = useState<{ text: string; attachments: string[] } | null>(null)
  // Starts false on both server and client render so hydration matches,
  // then corrected right after mount — reading window.location during the
  // initial render would make the server-rendered HTML (always false) and
  // the client's first render (true when ?dev=1 is set) disagree.
  const [showDemoShortcuts, setShowDemoShortcuts] = useState(false)
  useEffect(() => {
    setShowDemoShortcuts(new URLSearchParams(window.location.search).get("dev") === "1")
  }, [])

  // Lives here, not inside IntakeComposer, so a quick-start chip tapped up
  // in the thread (IntakeIntro) can fill the same compose bar pinned down
  // in ScreenShell's footer.
  const [intakeText, setIntakeText] = useState("")
  // Carried over from the landing page's own composer (components/
  // LandingComposer.tsx): picking a chip or typing a case there and hitting
  // send lands here with that text already in the bar, not retyped. A query
  // param, not sessionStorage, so this also works from a bookmarked or
  // shared `/app?start=...` link. Cleared from the URL immediately so a
  // refresh doesn't keep re-filling it.
  useEffect(() => {
    const start = new URLSearchParams(window.location.search).get("start")
    if (start) {
      setIntakeText(start)
      window.history.replaceState(null, "", "/app")
    }
  }, [])
  // Computed on mount only — a "TODAY, 12 SEP" style header on the landing
  // screen, the same status-of-the-day framing Lifesum's own composer
  // screen opens with. Left null until mount so server and client render
  // the same thing on the first pass.
  const [todayLabel, setTodayLabel] = useState<string | null>(null)
  useEffect(() => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const d = new Date()
    setTodayLabel(`${d.getDate()} ${months[d.getMonth()]}`)
  }, [])

  const threadEndRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  // A wide viewport is a desktop browser, not a phone — the mobile
  // phone-frame mockup (status bar, bezel, home indicator) would just be
  // fake chrome floating in the middle of a huge screen there. Desktop gets
  // a real web layout instead: a permanent sidebar plus a wider column, no
  // device skeuomorphism. Below the breakpoint, nothing here changes.
  const isDesktop = useIsDesktop()
  // A real phone (or the iOS Simulator) reports the same coarse
  // pointer/no-hover either way — the fake phone-frame chrome below is only
  // for a desktop browser window narrowed to preview the mobile layout; on
  // an actual device it would just draw a second phone around the real one.
  const isTouchDevice = useIsTouchDevice()
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "end" })
  }, [history.length, prefersReducedMotion])

  // Appends a card rather than replacing one. `newActiveCase` both updates
  // the variant used by anything pushed after this and freezes it onto this
  // new entry — everything already in `history` keeps whatever variant it
  // was pushed with.
  function pushState(newState: State, newActiveCase?: ActiveCase) {
    const ac = newActiveCase ?? activeCase
    if (newActiveCase && newActiveCase !== activeCase) setActiveCase(newActiveCase)
    setHistory((h) => [...h, { state: newState, activeCase: ac }])
  }

  function openCase(c: CaseSummary) {
    setManualResolution(null)
    setSubmittedText(null)
    setIntakeText("")
    setActiveCase(c.activeCase)
    // Reopening shows the thread from its current point, not a replay from
    // the top — this mock has no persisted history for an in-progress case.
    setHistory([{ state: c.state, activeCase: c.activeCase }])
    setDrawerOpen(false)
  }

  // Starts a fresh Intake with a given mock-dataset variant — `main` is the
  // ordinary "New case" button; `upi`/`dgca` back the dev picker's shortcuts
  // for walking a full Reading -> Rule card -> Approve pass with a sharp
  // piece of rule reasoning on screen (T+1 vs T+5, the DGCA agent-booking
  // split), for case-study screenshots that need more than the generic
  // Flipkart hero flow.
  function startCase(ac: ActiveCase) {
    setManualResolution(null)
    setSubmittedText(null)
    setIntakeText("")
    setActiveCase(ac)
    setHistory([{ state: "INTAKE", activeCase: ac }])
    setDrawerOpen(false)
  }

  function startNewCase() {
    startCase("main")
  }

  function resolveManually(amount: number, date: string) {
    setManualResolution({ amount, date })
    pushState(transition("WAITING", { type: "MARK_RESOLVED_MANUALLY" }))
  }

  // One entry's card. `settled` is true for every entry but the last —
  // settled cards hide their action buttons and just stand as a record.
  function renderCard(item: HistoryItem, settled: boolean) {
    switch (item.state) {
      case "INTAKE":
        return settled ? (
          submittedText && <SentMessage text={submittedText.text} attachmentUrls={submittedText.attachments} />
        ) : (
          <>
            {todayLabel && (
              <p className="label-caps text-center">Today, {todayLabel}</p>
            )}
            <IntakeIntro onSelectChip={setIntakeText} />
          </>
        )

      case "READING":
        return (
          <ReadingScreen
            facts={CASE_CONTENT[contentCaseFor(item.activeCase)].facts}
            settled={settled}
            onContinue={() => pushState(transition("READING", { type: "READING_RESULT", result: "ready" }))}
            // Same destination as RuleCardScreen's own onNotRight and
            // Approve's Edit button — the editable facts screen.
            onNotRight={() => pushState("CHECK_FACTS", item.activeCase)}
          />
        )

      case "CHECK_FACTS":
        return (
          <CheckFactsScreen
            facts={CASE_CONTENT[contentCaseFor(item.activeCase)].facts}
            settled={settled}
            onConfirm={() => pushState(transition("CHECK_FACTS", { type: "CONFIRM_FACTS" }))}
          />
        )

      case "RULE_CARD": {
        const content = CASE_CONTENT[contentCaseFor(item.activeCase)]
        return (
          <RuleCardScreen
            ruleLaw={content.rule.law}
            ruleSays={content.rule.says}
            deadline={content.deadline}
            confidence={content.confidence}
            confidenceReason={content.confidenceReason}
            caseTypeLabel={content.caseTypeLabel}
            settled={settled}
            onContinue={() => {
              // A low-confidence rule match belongs in Not Sure, not
              // Approve — state.ts's diagram only draws that edge out of
              // Reading, so (like the dev picker's failure-state jumps)
              // this is plain UI navigation rather than transition().
              if (content.confidence === "low") {
                pushState("NOT_SURE")
                return
              }
              // RULE_CARD -> DRAFT_READY -> APPROVE isn't gated by a user
              // tap in SPEC.md section 5's list, so both hops chain
              // together into a single new card here.
              const draftReady = transition("RULE_CARD", { type: "DRAFT_GENERATED" })
              pushState(transition(draftReady, { type: "READY_FOR_APPROVAL" }))
            }}
            // Same destination as Approve's own Edit button — this just
            // gives the user an earlier, lighter-weight exit if the match
            // itself looks off before they've even seen the draft.
            onNotRight={() => pushState("CHECK_FACTS", item.activeCase)}
          />
        )
      }

      case "APPROVE": {
        if (item.activeCase === "escalation") {
          return (
            <ApproveScreen
              amount={MOCK_ESCALATION_DRAFT.amount}
              sendTo="the National Consumer Helpline"
              summary={MOCK_ESCALATION_DRAFT.summary}
              fullText={MOCK_ESCALATION_DRAFT.fullText}
              wordCount={MOCK_ESCALATION_WORD_COUNT}
              ruleSays={MOCK_ESCALATION_DRAFT.ruleSays}
              deadline={MOCK_ESCALATION_DRAFT.deadline}
              confidence={MOCK_ESCALATION_DRAFT.confidence}
              confidenceReason={MOCK_ESCALATION_DRAFT.confidenceReason}
              settled={settled}
              onSend={() => {
                const sent = transition("APPROVE", { type: "SEND", outcome: "sent" })
                pushState(transition(sent, { type: "MESSAGE_SENT" }))
              }}
            />
          )
        }
        const content = CASE_CONTENT[contentCaseFor(item.activeCase)]
        return (
          <ApproveScreen
            amount={content.facts.amount!}
            sendTo={content.facts.company ?? "them"}
            summary={content.draftSummary}
            fullText={content.draftFullText}
            wordCount={content.draftWordCount}
            ruleSays={content.rule.says}
            deadline={content.deadline}
            confidence={content.confidence}
            confidenceReason={content.confidenceReason}
            settled={settled}
            onSend={() => {
              const sent = transition("APPROVE", { type: "SEND", outcome: "sent" })
              pushState(transition(sent, { type: "MESSAGE_SENT" }))
            }}
            // Appends a fresh, editable Check facts card below this one,
            // rather than navigating back to it — the thread only grows.
            onEdit={() => pushState("CHECK_FACTS", item.activeCase)}
          />
        )
      }

      case "WAITING":
        if (item.activeCase === "escalation") {
          return (
            <WaitingScreen
              deadlineLabel={MOCK_ESCALATION_DRAFT.deadline.label}
              followUpLabel={formatDateLabel(
                computeDeadline(MOCK_ESCALATION_DRAFT.deadline.date, { days: 1 }).date
              )}
              steps={[
                { label: "Sent to 1915", sublabel: <Mono>{MOCK_FOLLOW_UP_DATE.label}</Mono>, status: "done" },
                {
                  label: "Waiting for reply",
                  sublabel: <>by <Mono>{MOCK_ESCALATION_DRAFT.deadline.label}</Mono></>,
                  status: "active",
                },
                { label: "Auto follow-up", sublabel: "if still no reply", status: "upcoming" },
                { label: "e-Jagriti info", sublabel: "last resort", status: "upcoming" },
              ]}
              amount={MOCK_ESCALATION_DRAFT.amount}
              demoReplyText={MOCK_REPLY_TEXT}
              showDemoShortcuts={showDemoShortcuts}
              settled={settled}
              onReplyPasted={() => pushState(transition("WAITING", { type: "REPLY_PASTED" }))}
              onResolvedAnotherWay={resolveManually}
            />
          )
        }
        if (item.activeCase === "blocked") {
          return (
            <WaitingScreen
              deadlineLabel={BLOCKED_DEADLINE.label}
              followUpLabel={BLOCKED_FOLLOW_UP_DATE.label}
              steps={BLOCKED_WAITING_STEPS}
              amount={BLOCKED_FACTS.amount!}
              demoReplyText={MOCK_REPLY_TEXT}
              showDemoShortcuts={showDemoShortcuts}
              settled={settled}
              onReplyPasted={() => pushState(transition("WAITING", { type: "REPLY_PASTED" }))}
              onResolvedAnotherWay={resolveManually}
            />
          )
        }
        if (item.activeCase === "upi") {
          return (
            <WaitingScreen
              deadlineLabel={UPI_DEADLINE.label}
              followUpLabel={UPI_FOLLOW_UP_DATE.label}
              steps={UPI_WAITING_STEPS}
              amount={UPI_FACTS.amount!}
              demoReplyText={MOCK_REPLY_TEXT}
              showDemoShortcuts={showDemoShortcuts}
              settled={settled}
              onReplyPasted={() => pushState(transition("WAITING", { type: "REPLY_PASTED" }))}
              onResolvedAnotherWay={resolveManually}
            />
          )
        }
        if (item.activeCase === "dgca") {
          return (
            <WaitingScreen
              deadlineLabel={DGCA_DEADLINE.label}
              followUpLabel={DGCA_FOLLOW_UP_DATE.label}
              steps={DGCA_WAITING_STEPS}
              amount={DGCA_FACTS.amount!}
              demoReplyText={MOCK_REPLY_TEXT}
              showDemoShortcuts={showDemoShortcuts}
              settled={settled}
              onReplyPasted={() => pushState(transition("WAITING", { type: "REPLY_PASTED" }))}
              onResolvedAnotherWay={resolveManually}
            />
          )
        }
        return (
          <WaitingScreen
            deadlineLabel={MOCK_DEADLINE.label}
            followUpLabel={MOCK_FOLLOW_UP_DATE.label}
            steps={MOCK_WAITING_STEPS}
            amount={MOCK_FACTS.amount!}
            demoReplyText={MOCK_REPLY_TEXT}
            showDemoShortcuts={showDemoShortcuts}
            settled={settled}
            onReplyPasted={() => pushState(transition("WAITING", { type: "REPLY_PASTED" }))}
            onResolvedAnotherWay={resolveManually}
          />
        )

      case "REPLY_READ":
        return (
          <ReplyReadScreen
            reading={MOCK_REPLY_READING}
            verdict={MOCK_REPLY_VERDICT}
            reason={MOCK_REPLY_REASON}
            settled={settled}
            onConfirmResolved={() =>
              pushState(transition("REPLY_READ", { type: "VERDICT", verdict: "resolved" }))
            }
          />
        )

      case "RESOLVED":
        return item.activeCase === "myntra" ? (
          <ResolvedScreen
            company={MYNTRA_FACTS.company ?? "the company"}
            amount={manualResolution?.amount ?? MYNTRA_FACTS.amount ?? 0}
            claimedAmount={MYNTRA_FACTS.amount ?? 0}
            days={MYNTRA_RESOLVED_DAYS}
            messagesSent={MYNTRA_MESSAGES_SENT}
            escalations={MYNTRA_ESCALATIONS}
            caseStudyNumber={MYNTRA_CASE_STUDY_NUMBER}
          />
        ) : (
          <ResolvedScreen
            company={MOCK_FACTS.company ?? "the company"}
            amount={manualResolution?.amount ?? MOCK_FACTS.amount ?? 0}
            claimedAmount={MOCK_FACTS.amount ?? 0}
            days={MOCK_RESOLVED_DAYS}
            messagesSent={MOCK_MESSAGES_SENT}
            escalations={MOCK_ESCALATIONS}
            caseStudyNumber={MOCK_CASE_STUDY_NUMBER}
          />
        )

      case "MISSING_INFO":
        return <MissingInfoScreen question={MISSING_INFO_QUESTION} placeholder={MISSING_INFO_PLACEHOLDER} />

      case "NOT_SURE":
        return <NotSureScreen caseType={NOT_SURE_CASE_TYPE} reason={NOT_SURE_REASON} />

      case "IGNORED":
        return (
          <IgnoredScreen
            deadlineLabel={IGNORED_DEADLINE_LABEL}
            settled={settled}
            onReviewEscalation={() => {
              const draftReady = transition("IGNORED", { type: "ESCALATE" })
              pushState(transition(draftReady, { type: "READY_FOR_APPROVAL" }), "escalation")
            }}
          />
        )

      case "BLOCKED":
        return (
          <BlockedScreen
            fullText={BLOCKED_DRAFT_FULL_TEXT}
            wordCount={BLOCKED_DRAFT_WORD_COUNT}
            settled={settled}
            onSentItMyself={() => pushState(transition("BLOCKED", { type: "USER_CONFIRMED_SENT" }), "blocked")}
          />
        )

      case "OUT_OF_SCOPE":
        return <OutOfScopeScreen outOfScopeReason={OUT_OF_SCOPE_REASON} whereToGo={OUT_OF_SCOPE_WHERE_TO_GO} />

      default:
        return null
    }
  }

  const currentItem = history[history.length - 1]
  const currentIdentity = caseIdentityFor(currentItem.activeCase, currentItem.state)
  const caseLine =
    currentItem.state === "INTAKE" ? null : (
      <>
        Case · {currentIdentity.company ?? "Company not yet known"}
        {currentIdentity.amount != null && (
          <>
            {" "}
            · <Money amount={currentIdentity.amount} />
          </>
        )}{" "}
        · {caseStatusWord(currentItem.state)}
      </>
    )

  const threadItems = (
    <>
      {history.map((item, i) => {
        const settled = i < history.length - 1
        const showAgentLine = !SELF_NARRATING.includes(item.state)
        return (
          // Keyed on settled too, not just index: when a card locks in from
          // live to settled (its content swaps — e.g. Intake's chips become
          // the sent bubble, a card's action row disappears) React would
          // otherwise keep the same DOM node and just patch its children,
          // so the CSS *animation* on animate-card-enter (which only plays
          // when it's newly applied, not on every re-render) never replays.
          // The result was every state landing instantly except the very
          // first mount. Forcing a fresh node on that one transition makes
          // every "something just happened" moment actually animate in.
          <div key={`${i}-${settled}`} className="animate-card-enter space-y-3">
            {showAgentLine && <AgentLine text={agentLineFor(item.state, item.activeCase)} showAvatar={!settled} />}
            {renderCard(item, settled)}
          </div>
        )
      })}
      <div ref={threadEndRef} />
    </>
  )

  const composer = (
    <IntakeComposer
      text={intakeText}
      setText={setIntakeText}
      demoText={CASE_CONTENT[contentCaseFor(activeCase)].inputText}
      showDemoShortcuts={showDemoShortcuts}
      // The bar stays on screen for the whole case (a real chat product's
      // input never disappears) but only Intake actually reads free text
      // right now — everywhere else it's shown, not wired, so it reads as
      // "not yet", not as broken.
      disabled={history[history.length - 1].state !== "INTAKE"}
      onContinue={(text, attachmentUrls) => {
        setSubmittedText({ text, attachments: attachmentUrls })
        setIntakeText("")
        pushState(transition("INTAKE", { type: "SUBMIT_INPUT" }))
      }}
    />
  )

  return (
    <main
      className={
        isTouchDevice
          ? "flex min-h-screen flex-col bg-paper"
          : "flex min-h-screen flex-col items-center justify-center gap-4 bg-paper-alt p-4"
      }
    >
      {isDesktop ? (
        // The web layout: a permanent sidebar (no overlay/backdrop, nothing
        // to open or close) plus a wider reading column — real desktop
        // chrome, not the phone mockup scaled up. Same ScreenShell/thread
        // as mobile underneath; only the frame around it changes.
        <div className="flex h-[100dvh] max-h-[820px] w-full max-w-[960px] overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
          <CaseSidebar cases={cases} onOpenCase={openCase} onNewCase={startNewCase} />
          <div className="flex min-w-0 flex-1 justify-center">
            <div className="flex w-full max-w-[640px] flex-col">
              <ScreenShell
                onOpenMenu={() => {}}
                onNewCase={startNewCase}
                caseLine={caseLine}
                hideMenuButton
                footer={composer}
              >
                {threadItems}
              </ScreenShell>
            </div>
          </div>
        </div>
      ) : (
        // The mobile mockup: a real device frame, not just a bordered
        // rectangle — status bar and home indicator give the prototype the
        // same "this is a phone" presence as a Mobbin/App Store screenshot,
        // instead of looking like a webpage clipped to a narrow column. But
        // that frame is fake chrome standing in for a real device's own —
        // on an actual phone (or the iOS Simulator) it would draw a second
        // phone around the first, so it's skipped entirely there in favor
        // of the real device's real screen.
        <div
          className={
            isTouchDevice
              ? "flex h-[100dvh] w-full flex-col bg-paper"
              : "relative flex h-[100dvh] max-h-[900px] w-full max-w-[430px] flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-ink bg-paper shadow-xl"
          }
        >
          {!isTouchDevice && (
            <div className="flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[13px] font-semibold text-ink">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 18 12" fill="currentColor" className="h-[9px] w-[15px]">
                  <rect x="0" y="7" width="3" height="5" rx="0.5" />
                  <rect x="5" y="4.5" width="3" height="7.5" rx="0.5" />
                  <rect x="10" y="2" width="3" height="10" rx="0.5" />
                  <rect x="15" y="0" width="3" height="12" rx="0.5" />
                </svg>
                <svg viewBox="0 0 24 12" fill="none" className="h-[10px] w-[22px]">
                  <rect x="0.5" y="0.5" width="19" height="11" rx="2.5" stroke="currentColor" />
                  <rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor" />
                  <rect x="20.5" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" />
                </svg>
              </div>
            </div>
          )}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <ScreenShell
              onOpenMenu={() => setDrawerOpen(true)}
              onNewCase={startNewCase}
              caseLine={caseLine}
              footer={composer}
            >
              {threadItems}
            </ScreenShell>

            <CaseDrawer
              open={drawerOpen}
              cases={cases}
              onOpenCase={openCase}
              onNewCase={startNewCase}
              onClose={() => setDrawerOpen(false)}
            />
          </div>

          {!isTouchDevice && (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-1.5 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-ink/25"
            />
          )}
        </div>
      )}

      {showDemoShortcuts && (
        <div className="flex w-full max-w-[430px] flex-wrap gap-2 rounded-md border border-dashed border-line bg-paper p-3">
          <span className="w-full text-xs font-medium text-ink-soft">
            Dev picker (hidden unless ?dev=1):
          </span>
          <SecondaryButton className="w-auto px-3 py-1.5 text-xs" onClick={() => setDrawerOpen(true)}>
            Open cases menu
          </SecondaryButton>
          <SecondaryButton
            className="w-auto px-3 py-1.5 text-xs"
            onClick={() => setSimulateEmptyCases((v) => !v)}
          >
            {simulateEmptyCases ? "Restore cases" : "Simulate 0 cases"}
          </SecondaryButton>
          <SecondaryButton className="w-auto px-3 py-1.5 text-xs" onClick={startNewCase}>
            Hero flow
          </SecondaryButton>
          <SecondaryButton className="w-auto px-3 py-1.5 text-xs" onClick={() => startCase("upi")}>
            UPI case (T+1 vs T+5)
          </SecondaryButton>
          <SecondaryButton className="w-auto px-3 py-1.5 text-xs" onClick={() => startCase("dgca")}>
            Flight case (DGCA split)
          </SecondaryButton>
          {FAILURE_STATES.map((s) => (
            <SecondaryButton
              key={s}
              className="w-auto px-3 py-1.5 text-xs"
              onClick={() => {
                setManualResolution(null)
                setSubmittedText(null)
                setActiveCase("main")
                setHistory([{ state: s, activeCase: "main" }])
                setDrawerOpen(false)
              }}
            >
              {s.replace("_", " ")}
            </SecondaryButton>
          ))}
        </div>
      )}
    </main>
  )
}
