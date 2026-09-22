import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// The iOS (and Android "add to home screen") launcher icon. Reuses the
// agent's own identity mark — the same near-black square and check-on-a-
// ruled-line glyph as Avatar.tsx, not a separate mark invented just for the
// icon — so the home-screen icon and the avatar next to every agent line
// read as the same product. No rounded corners: iOS and Android both apply
// their own mask shape over a square source icon, so pre-rounding here
// would double up.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 12.5l4.3 4L18 7"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M6 19.5h12" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
