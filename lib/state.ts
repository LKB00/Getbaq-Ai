import type { State } from "./types"

type Event =
  | { type: "SUBMIT_INPUT" }
  | { type: "READING_RESULT"; result: "ready" }
  | { type: "CONFIRM_FACTS" }
  | { type: "DRAFT_GENERATED" }
  | { type: "READY_FOR_APPROVAL" }
  | { type: "SEND"; outcome: "sent" }
  | { type: "MESSAGE_SENT" }
  | { type: "REPLY_PASTED" }
  | { type: "MARK_RESOLVED_MANUALLY" }
  | { type: "VERDICT"; verdict: "resolved" }
  | { type: "ESCALATE" }
  | { type: "USER_CONFIRMED_SENT" }

export function transition(state: State, event: Event): State {
  switch (state) {
    case "INTAKE":
      if (event.type === "SUBMIT_INPUT") return "READING"
      break
    case "READING":
      if (event.type === "READING_RESULT" && event.result === "ready") return "RULE_CARD"
      break
    case "CHECK_FACTS":
      if (event.type === "CONFIRM_FACTS") return "RULE_CARD"
      break
    case "RULE_CARD":
      if (event.type === "DRAFT_GENERATED") return "DRAFT_READY"
      break
    case "DRAFT_READY":
      if (event.type === "READY_FOR_APPROVAL") return "APPROVE"
      break
    case "APPROVE":
      if (event.type === "SEND") return "SENT"
      break
    case "SENT":
      if (event.type === "MESSAGE_SENT") return "WAITING"
      break
    case "WAITING":
      if (event.type === "REPLY_PASTED") return "REPLY_READ"
      if (event.type === "MARK_RESOLVED_MANUALLY") return "RESOLVED"
      break
    case "REPLY_READ":
      if (event.type === "VERDICT" && event.verdict === "resolved") return "RESOLVED"
      break
    case "IGNORED":
      if (event.type === "ESCALATE") return "ESCALATION_READY"
      break
    case "ESCALATION_READY":
      if (event.type === "READY_FOR_APPROVAL") return "APPROVE"
      break
  }
  return state
}
