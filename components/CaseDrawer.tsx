"use client"

import type { CaseSummary } from "@/app/mock-case"

interface CaseDrawerProps {
  open: boolean
  cases: CaseSummary[]
  onOpenCase: (c: CaseSummary) => void
  onNewCase: () => void
  onClose: () => void
}

export function CaseDrawer({ open, cases, onOpenCase, onNewCase, onClose }: CaseDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "visible bg-black/40" : "invisible"
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute right-0 top-0 h-full w-80 bg-paper shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-semibold">Cases</h2>
            <button onClick={onClose} className="rounded p-1 hover:bg-line">
              ✕
            </button>
          </div>

          <button
            onClick={onNewCase}
            className="m-3 rounded-lg bg-positive px-4 py-2 text-sm font-semibold text-paper hover:bg-[#12722f]"
          >
            + New case
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 px-2 py-2">
            {cases.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-ink-soft">No cases yet</p>
            ) : (
              cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpenCase(c)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-line"
                >
                  <p className="font-semibold text-ink">{c.company || "Unknown"}</p>
                  <p className="text-xs text-ink-soft">{c.state}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
