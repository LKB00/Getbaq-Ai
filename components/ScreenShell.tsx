"use client"

import { ReactNode } from "react"

interface ScreenShellProps {
  children: ReactNode
  footer?: ReactNode
  onOpenMenu?: () => void
  onNewCase?: () => void
  caseLine?: ReactNode | null
  hideMenuButton?: boolean
}

export function ScreenShell({
  children,
  footer,
  onOpenMenu,
  onNewCase,
  caseLine,
  hideMenuButton,
}: ScreenShellProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          {!hideMenuButton && (
            <button
              onClick={onOpenMenu}
              className="rounded p-2 hover:bg-line"
              aria-label="Open menu"
            >
              ☰
            </button>
          )}
          {onNewCase && (
            <button
              onClick={onNewCase}
              className="text-xs font-semibold text-positive hover:underline"
            >
              + New case
            </button>
          )}
        </div>
        {caseLine && (
          <div className="text-xs text-ink-soft">{caseLine}</div>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {children}
        </div>
      </main>

      {footer && (
        <footer className="shrink-0 border-t border-line px-4 py-4">
          {footer}
        </footer>
      )}
    </div>
  )
}
