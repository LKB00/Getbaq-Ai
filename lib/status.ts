import type { State } from "./types"

export function caseStatusWord(state: State): string {
  switch (state) {
    case "INTAKE":
      return "New"
    case "READING":
      return "Reading"
    case "CHECK_FACTS":
      return "Checking"
    case "RULE_CARD":
      return "Rule found"
    case "APPROVE":
      return "Ready to send"
    case "WAITING":
      return "Waiting"
    case "REPLY_READ":
      return "Reply received"
    case "RESOLVED":
      return "Resolved"
    case "MISSING_INFO":
      return "Incomplete"
    case "NOT_SURE":
      return "Uncertain"
    case "IGNORED":
      return "Escalating"
    case "BLOCKED":
      return "Manual send"
    case "OUT_OF_SCOPE":
      return "Out of scope"
    default:
      return "Unknown"
  }
}
