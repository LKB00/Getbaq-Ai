"use client"

import type { CaseSummary } from "@/app/mock-case"

interface CaseSidebarProps {
  cases: CaseSummary[]
  onOpenCase: (c: CaseSummary) => void
  onNewCase: () => void
}

export function CaseSidebar({ cases, onOpenCase, onNewCase }: CaseSidebarProps) {
  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-line bg-paper">
      <div className="border-b border-line px-4 py-4">
        <button
          onClick={onNewCase}
          className="w-full rounded-lg bg-positive px-4 py-2 text-sm font-semibold text-paper hover:bg-[#12722f]"
        >
          + New case
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 px-2 py-2">
        {cases.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-ink-soft">No cases yet</p>
        ) : (
          cases.map((c) => (
            <button
              key={c.id}
              onClick={() => onOpenCase(c)}
              className="w-full rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-line transition"
            >
              <p className="font-semibold text-ink text-sm">{c.company || "Unknown"}</p>
              <p className="text-xs text-ink-soft mt-0.5">{c.state}</p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
