// The only model call in this app. See CLAUDE.md.
//
// This route currently handles one turn at a time (READING, or a pasted
// REPLY) and is stateless — it does not yet load/save a Case from
// /data/cases.json. That persistence layer belongs with the multi-turn
// screens (build order step 5); wiring it in now, before there's a UI that
// needs cross-request state, would be speculative. eval/run.ts (step 4)
// and scripts/test-agent.ts both call processReading/processReply directly,
// exactly as SPEC.md section 10 asks for ("runs each case through the same
// server function, no UI").

import { readFileSync } from "node:fs"
import path from "node:path"
import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

import { computeDeadline, fillDeadlinePlaceholder } from "@/lib/deadlines"
import { stripOtpLike } from "@/lib/otp"
import { findVerifiedRule, getVerifiedRules } from "@/lib/rules"
import {
  AgentModelOutputSchema,
  AgentRequestSchema,
  ReplyModelOutputSchema,
  type AgentModelOutput,
} from "@/lib/schema"
import { transition } from "@/lib/state"
import type { Deadline, Draft, Facts, State } from "@/lib/types"

export const MODEL = "claude-sonnet-5"
const MAX_DRAFT_WORDS = 150
const BANNED_PHRASES = ["sue", "legal action", "lawyer", "court"]
// Appended by code, after the word-count and tone checks — never part of
// what the model writes or what counts against its 150-word budget. Small
// and factual: the complaint itself should read as coming from the person,
// not as an ad for the tool.
const SIGNATURE_LINE = "Sent via Getbaq."

export function anthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. The model call is server-side only — set it in your environment, never in client code."
    )
  }
  return new Anthropic({ apiKey })
}

function loadPromptTemplate(name: string): string {
  return readFileSync(path.join(process.cwd(), "prompts", name), "utf-8")
}

export function buildSystemPrompt(): string {
  const template = loadPromptTemplate("system.md")
  const rulesText = getVerifiedRules()
    .map((rule) => `- id: ${rule.id}\n  law: ${rule.law}\n  says: ${rule.says}`)
    .join("\n")
  return template.replace("{{RULES}}", rulesText)
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/)
  return JSON.parse(fenced ? fenced[1] : trimmed)
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function toneViolation(text: string): string | null {
  const lower = text.toLowerCase()
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) return `contains "${phrase}"`
  }
  if (text.includes("!")) return "contains an exclamation mark"
  return null
}

// ---- Reading (intake) ----

export type ImageInput = {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
  data: string // base64
}

export type ReadingInput = {
  text: string
  images?: ImageInput[]
  caseTypeHint?: string | null
  previousFacts?: Partial<Facts>
}

export type ReadingResult = {
  caseType: AgentModelOutput["caseType"]
  outOfScopeReason: string | null
  facts: Facts
  missingFacts: string[]
  ruleId: string | null
  confidence: AgentModelOutput["confidence"]
  confidenceReason: string
  draft: Draft | null
  suggestedChannel: AgentModelOutput["suggestedChannel"]
  deadline: Deadline | null
  state: State
  // Diagnostics for the eval harness / logs — never shown to the user as-is.
  notes: string[]
}

export function buildUserContent(
  cleanText: string,
  input: ReadingInput
): Array<Anthropic.Messages.ContentBlockParam> {
  const content: Array<Anthropic.Messages.ContentBlockParam> = []

  for (const image of input.images ?? []) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: image.mediaType, data: image.data },
    })
  }

  let contextText = ""
  if (input.caseTypeHint) contextText += `Case type hint: ${input.caseTypeHint}\n`
  if (input.previousFacts) {
    contextText += `Previously known facts: ${JSON.stringify(input.previousFacts)}\n`
  }
  contextText += `\n${cleanText}`
  content.push({ type: "text", text: contextText })

  return content
}

async function callModel(
  anthropic: Anthropic,
  content: Array<Anthropic.Messages.ContentBlockParam>
): Promise<AgentModelOutput> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content }],
  })

  const block = response.content.find((b) => b.type === "text")
  if (!block || block.type !== "text") {
    throw new Error("Model returned no text content")
  }

  return AgentModelOutputSchema.parse(extractJson(block.text))
}

async function callModelWithCorrection(
  anthropic: Anthropic,
  originalContent: Array<Anthropic.Messages.ContentBlockParam>,
  instruction: string
): Promise<AgentModelOutput> {
  return callModel(anthropic, [...originalContent, { type: "text", text: instruction }])
}

function decideReadingOutcome(input: {
  caseType: AgentModelOutput["caseType"]
  confidence: AgentModelOutput["confidence"]
  missingFacts: string[]
}): "missing_info" | "not_sure" | "out_of_scope" | "ready" {
  if (input.caseType === "out_of_scope") return "out_of_scope"
  if (input.confidence === "low") return "not_sure"
  if (input.missingFacts.length > 0) return "missing_info"
  return "ready"
}

export async function processReading(input: ReadingInput): Promise<ReadingResult> {
  const anthropic = anthropicClient()
  const notes: string[] = []

  const { text: cleanText, redacted } = stripOtpLike(input.text)
  if (redacted) notes.push("Do not share OTPs. I removed it.")

  const userContent = buildUserContent(cleanText, input)

  let output = await callModel(anthropic, userContent)

  // Invented/unverified rule: force low confidence and log it. Non-negotiable
  // per CLAUDE.md — a rule not in rules.md with verified: true never gets used.
  // Done before the draft checks below, since the deadline this yields gets
  // substituted into the draft before those checks run.
  let ruleId = output.ruleId
  let confidence = output.confidence
  let confidenceReason = output.confidenceReason
  if (ruleId && !findVerifiedRule(ruleId)) {
    notes.push(`invented rule: "${ruleId}" is not a verified rule in rules.md — forcing low confidence`)
    ruleId = null
    confidence = "low"
    confidenceReason = `The model cited an unrecognized or unverified rule ("${output.ruleId}").`
  }

  // Deadline: code computes this, never the model.
  let deadline: Deadline | null = null
  if (ruleId) {
    const rule = findVerifiedRule(ruleId)!
    const fromValue = (output.facts as Record<string, string | null>)[rule.from] ?? null
    if (!fromValue) {
      notes.push(`rule ${rule.id} needs "${rule.from}" but it is missing from the extracted facts`)
    } else {
      try {
        const span = rule.hours ? { hours: rule.hours } : { days: rule.days }
        deadline = computeDeadline(fromValue, span)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        notes.push(`could not compute deadline for ${rule.id}: ${message}`)
      }
    }
  }

  // The model leaves a literal "{{deadline}}" placeholder in the draft (see
  // prompts/system.md) — code fills it in here. The 150-word and tone checks
  // below run on this rendered text, since that's what would actually be
  // sent, not the placeholder token.
  function rendered(rawFullText: string): string {
    return fillDeadlinePlaceholder(rawFullText, deadline)
  }

  // Draft length: reject and re-ask once with "shorten". See SPEC.md section 6.
  if (output.draft && wordCount(rendered(output.draft.fullText)) > MAX_DRAFT_WORDS) {
    const words = wordCount(rendered(output.draft.fullText))
    notes.push(`draft was ${words} words, over the ${MAX_DRAFT_WORDS}-word limit — re-asked once`)
    output = await callModelWithCorrection(
      anthropic,
      userContent,
      `Your draft.fullText was ${words} words, over the ${MAX_DRAFT_WORDS}-word limit. ` +
        `Return the full corrected JSON object again with a shorter draft, under ${MAX_DRAFT_WORDS} words.`
    )
  }

  // Tone: reject and re-ask once. See SPEC.md section 6.
  if (output.draft) {
    const violation = toneViolation(rendered(output.draft.fullText))
    if (violation) {
      notes.push(`draft ${violation} — re-asked once`)
      output = await callModelWithCorrection(
        anthropic,
        userContent,
        `Your draft.fullText ${violation}. Return the full corrected JSON object again with a ` +
          `factual, calm draft: no threats, no exclamation marks, and never the words "sue", ` +
          `"legal action", "lawyer", or "court".`
      )
    }
  }

  // Final safety net: never ship a draft that still fails either check.
  let draft: Draft | null = null
  if (output.draft) {
    const finalText = rendered(output.draft.fullText)
    const words = wordCount(finalText)
    const violation = toneViolation(finalText)
    if (words > MAX_DRAFT_WORDS || violation) {
      notes.push(`draft still non-compliant after retry (${violation ?? `${words} words`}) — dropped`)
    } else {
      draft = { summary: output.draft.summary, fullText: `${finalText}\n\n${SIGNATURE_LINE}`, wordCount: words }
    }
  }

  const outcome = decideReadingOutcome({ caseType: output.caseType, confidence, missingFacts: output.missingFacts })
  const state = transition("READING", { type: "READING_RESULT", result: outcome })

  return {
    caseType: output.caseType,
    outOfScopeReason: output.outOfScopeReason,
    facts: output.facts,
    missingFacts: output.missingFacts,
    ruleId,
    confidence,
    confidenceReason,
    draft,
    suggestedChannel: output.suggestedChannel,
    deadline,
    state,
    notes,
  }
}

// ---- Reply reading ----

export type ReplyInput = {
  replyText: string
}

export type ReplyResult = {
  reading: string
  verdict: "resolved" | "not_resolved" | "needs_info"
  reason: string
  state: State
  notes: string[]
}

export async function processReply(input: ReplyInput): Promise<ReplyResult> {
  const anthropic = anthropicClient()
  const notes: string[] = []

  const { text: cleanText, redacted } = stripOtpLike(input.replyText)
  if (redacted) notes.push("Do not share OTPs. I removed it.")

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    temperature: 0,
    system: loadPromptTemplate("reply.md"),
    messages: [{ role: "user", content: cleanText }],
  })

  const block = response.content.find((b) => b.type === "text")
  if (!block || block.type !== "text") {
    throw new Error("Model returned no text content")
  }

  const parsed = ReplyModelOutputSchema.parse(extractJson(block.text))

  let state: State = transition("WAITING", { type: "REPLY_PASTED" })
  state = transition(state, { type: "VERDICT", verdict: parsed.verdict })

  return { ...parsed, state, notes }
}

// ---- HTTP handler ----

export async function POST(request: NextRequest) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsedBody = AgentRequestSchema.safeParse(json)
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.message }, { status: 400 })
  }
  const body = parsedBody.data

  try {
    if (body.step === "reply") {
      const result = await processReply(body.input)
      return NextResponse.json({ result })
    }
    const result = await processReading(body.input)
    return NextResponse.json({ result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
