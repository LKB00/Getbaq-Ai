"use client"

import { useState } from "react"
import Link from "next/link"

export function LandingComposer() {
  const [input, setInput] = useState("")

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Paste chat, email, or screenshot..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 rounded-lg border border-line bg-paper px-4 py-3 text-sm placeholder-ink-soft focus:border-positive focus:outline-none focus:ring-2 focus:ring-positive/20"
      />
      <Link
        href="/app"
        className="rounded-lg bg-positive px-6 py-3 text-sm font-semibold text-paper shadow-lg shadow-positive/25 transition duration-150 ease-out hover:bg-[#12722f] active:scale-[0.97] active:duration-75"
      >
        Start
      </Link>
    </div>
  )
}
