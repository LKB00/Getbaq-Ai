import type { Metadata, Viewport } from "next"
import { Schibsted_Grotesk, Spline_Sans_Mono } from "next/font/google"
import "./globals.css"

// Two typefaces doing distinct jobs, not three fonts standing in for one
// idea. Schibsted Grotesk carries the agent's own voice, screen titles, and
// body text — a newspaper-grotesk ancestry, which is the right register for
// a product whose whole job is reading facts back to someone accurately and
// calmly. Spline Sans Mono is reserved for every computed number and date —
// so the moment a rupee figure or a deadline appears in mono, it's a visual
// promise that code produced it, not the model (see lib/deadlines.ts).
const displaySans = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--display-sans",
})
const numeralMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--numeral-mono",
})

export const metadata: Metadata = {
  title: "Getbaq",
  description: "Draft a refund complaint. Nothing sends without your tap.",
  // Lets "Add to Home Screen" on iOS launch this as its own standalone
  // window (no Safari address bar/toolbar) with its own name under the
  // icon, instead of just bookmarking a browser tab.
  appleWebApp: {
    capable: true,
    title: "Getbaq",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displaySans.variable} ${numeralMono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
