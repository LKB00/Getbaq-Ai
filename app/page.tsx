import type { Metadata } from "next"
import Link from "next/link"
import { Avatar } from "@/components/Avatar"
import { LandingComposer } from "@/components/LandingComposer"
import { LandingDemo } from "@/components/LandingDemo"
import { ScrollReveal } from "@/components/ScrollReveal"
import { Money, Mono } from "@/components/Numeral"
import { MOCK_FACTS, MOCK_MESSAGES_SENT, MOCK_RESOLVED_DAYS, MOCK_RULE } from "./mock-case"

// The marketing front door. `/app` is the actual product (moved there from
// `/` so this page could exist). Static server-rendered copy everywhere
// except two small client islands: LandingDemo (the actual product
// components, live) and ScrollReveal (motion only, IntersectionObserver) —
// so the page still ships as mostly server HTML, not a client-rendered SPA,
// while still feeling like the product it's selling rather than a brochure
// describing it.
export const metadata: Metadata = {
  title: "Getbaq — get your stuck refund back",
  description:
    "Paste the chat or a screenshot. I'll find the rule, draft the complaint, and chase it until you're paid — you approve every message before it sends.",
}

// Green, not near-black: the button that starts a case is the one moment on
// the page where color should carry weight instead of restraint — the same
// positive hue the product itself shows on a resolved case, reused here as
// "this is the button that gets you there."
const CTA =
  "rounded-lg bg-positive px-8 py-3.5 text-base font-semibold text-paper shadow-lg shadow-positive/25 transition duration-150 ease-out hover:bg-[#12722f] active:scale-[0.97] active:duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-positive focus-visible:ring-offset-2 focus-visible:ring-offset-paper"

// The eyebrow label above every section header: same spaced-caps metrics as
// the product's own `.label-caps`, but in color instead of soft gray — the
// two accents (green, brass) already established by the highlighted
// headline and the payoff section, alternated section to section instead of
// invented fresh per spot.
const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.08em]"

const STEPS = [
  {
    title: "Tell me what happened",
    body: "Paste the WhatsApp chat, forward the email, or just type it out. No form to fill in first.",
  },
  {
    title: "I find the rule and draft the complaint",
    body: `A real regulation, cited by name — ${MOCK_RULE.law} — not a vague appeal to be reasonable.`,
  },
  {
    title: "You approve, I send",
    body: "One tap sends it. Nothing goes out on its own, and you get a few seconds to cancel after.",
  },
  {
    title: "I track it and escalate if they go quiet",
    body: "National Consumer Helpline, then e-Jagriti — on the actual deadline, not whenever you remember to check.",
  },
]

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 6 4 12l5 6M15 6l5 6-5 6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </svg>
  )
}

// Three unrelated facts, not a sequence — an icon each instead of numbering
// them 1/2/3, since numbering implies an order none of these actually has.
// `id` (not the icon component itself) is the data here — see TrustItem
// below for why: a Server Component can't hand a Client Component
// (ScrollReveal) a raw function reference to invoke later, only fully
// server-rendered JSX or plain serializable data.
const TRUST: { id: "code" | "lock" | "document"; text: string }[] = [
  { id: "code", text: "Every date and rupee amount here is computed by code, not guessed by the model." },
  { id: "lock", text: "Never asks for your OTP, PIN, card number, or password." },
  { id: "document", text: "Getbaq is not a lawyer. This is not legal advice." },
]

function TrustIcon({ id }: { id: "code" | "lock" | "document" }) {
  if (id === "code") return <CodeIcon />
  if (id === "lock") return <LockIcon />
  return <DocumentIcon />
}

export default function Landing() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf9f4] text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Avatar />
          <span className="text-[15px] font-semibold">Getbaq</span>
        </div>
        <Link
          href="/app"
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition duration-150 ease-out hover:border-positive hover:bg-positive-soft active:scale-[0.97] active:duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Open the app
        </Link>
      </header>

      {/* Oversized, near-black display type and a left-set eyebrow label —
          the editorial-agency register (designtakt.ch is the reference)
          instead of a centered, softly-weighted marketing headline. The
          copy and the highlighted payoff line are unchanged; only their
          scale and alignment shifted. Two soft, blurred color blooms behind
          the text (green + brass, both already in the palette) are what
          keep the ivory canvas from reading as flat gray.
          `max-w-5xl px-6` is the one shared page grid — the header above
          and every section below all open with this exact pair, so the
          logo, the headline, and every eyebrow line up on the same left
          edge instead of drifting section to section. Anything narrower
          (the paragraph, the composer) caps its own width from inside that
          grid rather than re-centering itself. */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-28 -top-28 -z-10 h-80 w-80 rounded-full bg-positive/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-16 top-6 -z-10 h-72 w-72 rounded-full bg-brass/20 blur-3xl" />
        <div className="mx-auto max-w-5xl px-6 pb-10 pt-10 sm:pb-16 sm:pt-16">
          <p className={`${EYEBROW} text-positive`}>(Refund agent)</p>
          <h1 className="mt-4 text-[3rem] font-black leading-[0.96] tracking-tight sm:text-[5.5rem]">
            Get your stuck
            <br />
            {/* Positive green, reused from the app's own "resolved" color
                (--color-positive) rather than a new marketing-only hue — this
                is the one line on the page that gets the highlighter-and-glow
                treatment, because it's the payoff the whole product exists
                to deliver. */}
            <span className="relative isolate inline-block text-positive">
              <span
                aria-hidden
                className="absolute inset-x-[-3%] bottom-[-4%] top-[42%] -z-10 -rotate-1 rounded-sm bg-positive-soft"
              />
              <span className="relative [text-shadow:0_0_20px_rgba(23,138,62,0.5),0_0_46px_rgba(23,138,62,0.28)]">
                refund back.
              </span>
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">
            Paste the chat or a screenshot. I&apos;ll find the rule, draft the complaint, and chase it until
            you&apos;re paid — you approve every message before it sends.
          </p>
          <div className="mt-9 max-w-xl">
            <LandingComposer />
            <p className="mt-3 text-sm text-ink-soft">Free. No account. Nothing sends without your tap.</p>
          </div>
        </div>
      </section>

      {/* One section, not two: the numbered steps and the live demo were
          both explaining the same "reading -> rule -> approve" process from
          two angles (words, then the actual thing running) but used to sit
          in separate, disconnected sections. Now the demo is the proof
          right under the claim it's proving, in the same "How it works". */}
      <ScrollReveal className="border-t border-line py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-3xl">
            <p className={`${EYEBROW} text-brass`}>(How it works)</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">How it works</h2>
            {/* A thin top rule per item and an oversized numeral instead of a
                boxed, shadowed card — the same spare, rule-divided rhythm as
                the section boundary above, applied one level down. The rule
                itself carries the brass tint instead of plain gray so the
                numbers read as the deliberate accent, not filler. */}
            <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {STEPS.map((step, i) => (
                <li key={step.title} className="border-t-2 border-brass/40 pt-4">
                  <Mono className="text-2xl font-semibold text-brass">{String(i + 1).padStart(2, "0")}</Mono>
                  <p className="mt-3 text-lg font-semibold text-ink">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* The proof, live: the real product components, actually running,
            not a screenshot of them. See LandingDemo.tsx. */}
        <p className="mb-4 mt-16 text-center text-sm text-ink-soft">See it happen — tap through it</p>
        <LandingDemo />
      </ScrollReveal>

      {/* The emotional payoff, in the same numbers the product itself
          would show on Resolved — not a stock "happy customer" photo. A
          full-bleed near-black band (not a photo — this page has none) is
          the one deliberate tone shift on the page, the same rhythm device
          designtakt.ch uses full-bleed photography for: a long scroll of
          flat cream needs at least one section that reads as "different."
          Brass appears nowhere else on this page, same rule as
          ResolvedScreen.tsx: it's reserved for exactly this moment. Same
          ink-rule squiggle too, not an approximation of it — the actual
          bookkeeping "ruling off" motif. */}
      <div className="relative overflow-hidden bg-brand-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(182,131,47,0.16),_transparent_60%)]"
        />
        <ScrollReveal className="relative mx-auto max-w-md px-6 py-20 text-center sm:py-28">
          <p className="text-lg text-paper">You got your money back.</p>
          <Money amount={MOCK_FACTS.amount!} className="mt-2 block text-7xl font-black text-brass" />
          <svg viewBox="0 0 200 10" width="200" height="10" className="mx-auto mt-3" aria-hidden focusable="false">
            <path
              d="M2 5.5 C 40 2, 80 8.5, 100 5 S 170 2.5, 198 5.5"
              fill="none"
              stroke="var(--color-brass)"
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength={100}
              className="animate-rule-draw"
            />
          </svg>
          <p className="mt-4 text-sm text-paper/60">
            refunded by {MOCK_FACTS.company} in <Mono className="text-paper/80">{MOCK_RESOLVED_DAYS}</Mono> days ·{" "}
            <Mono className="text-paper/80">{MOCK_MESSAGES_SENT}</Mono> message sent
          </p>
        </ScrollReveal>
      </div>

      <div className="border-t border-line">
        <ScrollReveal className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className={`${EYEBROW} text-positive`}>(Trust)</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {TRUST.map(({ id, text }) => (
              <div key={id} className="border-t-2 border-positive/40 pt-4 text-positive">
                <TrustIcon id={id} />
                <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-ink">{text}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* The cream-to-green wash instead of flat gray is the last "this
          page has color, not just black and white" beat before the close —
          the same two accents as everywhere else, not a new one introduced
          just for this band. */}
      <div className="border-t border-line bg-[linear-gradient(180deg,_rgba(23,138,62,0.07),_rgba(251,249,244,0))] px-6 py-20 text-center sm:py-28">
        <Link href="/app" className={CTA}>
          Start your case
        </Link>
      </div>

      <footer className="border-t border-brass/25 bg-brand-ink px-6 py-6 text-center">
        <span className="text-[13px] font-semibold text-paper/70">Getbaq</span>
      </footer>
    </main>
  )
}
