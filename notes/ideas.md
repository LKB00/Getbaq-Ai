# Ideas (not built — CLAUDE.md: log here instead of building ad hoc)

Found while auditing the app against standard chat-product conventions
(WhatsApp/iMessage contact header, ChatGPT/Claude/Intercom thread patterns).
The one confirmed gap against SPEC.md itself (the pinned "Case · Company ·
Amount · Status" header from section 9) was implemented directly, since it
was already a stated requirement, not a new feature. Everything below is a
genuine idea, not yet asked for or specced — logged, not built.

- **Date separators for multi-day threads.** A case can sit in Waiting for
  days before a reply. Reopening it later shows the whole history with no
  sense of which messages happened when — no "Today" / "3 Sep" dividers the
  way WhatsApp or iMessage break up a long thread by day.

- **Scroll-to-bottom affordance.** If a user scrolls up to reread an earlier
  card in a long thread, there's no floating "jump to latest" button — they
  have to scroll manually all the way back down.

- **Tap-to-enlarge on pasted screenshots.** `SentMessage` shows attachment
  thumbnails at a fixed small size with no lightbox/zoom — can't actually
  read a screenshot's fine print (order IDs, amounts) without pinching on
  the tiny thumbnail.

- **Send-failure / retry state.** Once this wires up to a real API call
  instead of mock data, a failed send currently has no visible retry
  affordance in the composer or thread — worth designing before the real
  `/app/api/agent/route.ts` call lands.

- **Search across cases.** Only worth it once someone plausibly has more
  than a handful of open cases at once — per this session's own feedback
  that the case list shouldn't be over-structured for occasional, low-volume
  use, this is explicitly *not* worth building until that's actually true.

- **Settings / profile screen.** Asked about directly this session. SPEC.md
  section 1 lists "no accounts" as an explicit non-goal, and this prototype's
  job is proving the hero flow end to end across the 30 eval cases, not
  being an account-based product — so skipped for now rather than built.
  Only becomes worth it past prototype stage, and even then probably starts
  narrow: which email address "Send it" actually sends from, and
  notification preferences for auto-follow-up — not a general profile page.
