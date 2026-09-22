"use client"

import { MOCK_FACTS } from "@/app/mock-case"

export function LandingDemo() {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-line bg-paper p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-8 rounded-full bg-positive/20 flex items-center justify-center text-positive text-sm font-bold">
            →
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Found the rule</p>
            <p className="text-xs text-ink-soft mt-1">
              {MOCK_FACTS.company} violates Consumer Protection Act, 2019
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-8 rounded-full bg-positive/20 flex items-center justify-center text-positive text-sm font-bold">
            ✓
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Draft ready to send</p>
            <p className="text-xs text-ink-soft mt-1">
              Your complaint to {MOCK_FACTS.company} — tap to review and send
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-8 rounded-full bg-brass/20 flex items-center justify-center text-brass text-sm font-bold">
            ⏱
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">30-day deadline</p>
            <p className="text-xs text-ink-soft mt-1">
              Escalate to National Consumer Helpline if no reply by then
            </p>
          </div>
        </div>
      </div>

      <button className="mt-6 w-full rounded-lg bg-positive px-4 py-3 text-sm font-semibold text-paper shadow-lg shadow-positive/25 transition duration-150 hover:bg-[#12722f] active:scale-[0.97]">
        Review and send
      </button>
    </div>
  )
}
