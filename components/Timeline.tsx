import { ReactNode } from "react"

export type TimelineStep = {
  label: string
  sublabel: ReactNode
  status: "done" | "active" | "upcoming"
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step.status === "done"
                  ? "bg-positive text-white"
                  : step.status === "active"
                    ? "bg-positive/20 text-positive border-2 border-positive"
                    : "bg-line text-ink-soft"
              }`}
            >
              {step.status === "done" ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && <div className="w-0.5 h-8 bg-line mt-2" />}
          </div>
          <div className="pt-1 pb-4">
            <p className="text-sm font-semibold text-ink">{step.label}</p>
            <p className="text-xs text-ink-soft mt-1">{step.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
