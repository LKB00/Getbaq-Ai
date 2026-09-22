// Manual smoke test for step 3: "Prompt + API route + zod validation. Test
// with 3 cases in the terminal." Run with `npm run test:agent`.
//
// Three cases, each exercising a different part of the pipeline:
//   C01 — clean ecommerce case, deadline not yet missed (happy path)
//   C02 — missing-facts case: company name is never given
//   C20 — trap case: a UPI merchant dispute that looks RBI-adjacent but
//         isn't a failed transaction — the rule sheet has nothing for it.
//         Inventing an RBI rule here is exactly the "invented rule" failure
//         CLAUDE.md and SPEC.md section 6 guard against.
//
// For each case this prints the RAW text the model returned (before zod
// validation or any of the code-side correction/retry logic), and then the
// final processReading() result, so the two can be compared directly.

import { readFileSync } from "node:fs"
import path from "node:path"
import {
  anthropicClient,
  buildSystemPrompt,
  buildUserContent,
  MODEL,
  processReading,
} from "../app/api/agent/route"
import { stripOtpLike } from "../lib/otp"

type EvalCase = {
  id: string
  inputText: string
  expected: { caseType: string; ruleId: string | null; amount: number | null; channel: string }
  notes: string
}

const CASE_IDS = ["C01", "C02", "C20"]

function loadCases(): EvalCase[] {
  const casesPath = path.join(process.cwd(), "eval", "cases.json")
  const all: EvalCase[] = JSON.parse(readFileSync(casesPath, "utf-8"))
  return CASE_IDS.map((id) => {
    const found = all.find((c) => c.id === id)
    if (!found) throw new Error(`Case ${id} not found in eval/cases.json`)
    return found
  })
}

async function getRawModelOutput(text: string): Promise<string> {
  const anthropic = anthropicClient()
  const { text: cleanText } = stripOtpLike(text)
  const content = buildUserContent(cleanText, { text: cleanText, caseTypeHint: null })

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content }],
  })

  const block = response.content.find((b) => b.type === "text")
  return block && block.type === "text" ? block.text : "(no text content in response)"
}

async function main() {
  const cases = loadCases()

  for (const testCase of cases) {
    console.log(`\n${"=".repeat(70)}`)
    console.log(`${testCase.id}: ${testCase.inputText}`)
    console.log(`expected: ${JSON.stringify(testCase.expected)}`)
    console.log(`notes: ${testCase.notes}`)

    console.log(`\n--- raw model output (${testCase.id}) ---`)
    try {
      const raw = await getRawModelOutput(testCase.inputText)
      console.log(raw)
    } catch (err) {
      console.error("ERROR (raw call):", err instanceof Error ? err.message : err)
      continue
    }

    console.log(`\n--- processReading() result, after zod validation + code checks (${testCase.id}) ---`)
    try {
      const result = await processReading({ text: testCase.inputText, caseTypeHint: null })
      console.log(JSON.stringify(result, null, 2))
    } catch (err) {
      console.error("ERROR (processReading):", err instanceof Error ? err.message : err)
    }
  }
}

main()
