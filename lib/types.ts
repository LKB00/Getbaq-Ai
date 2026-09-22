export type State =
  | "INTAKE"
  | "READING"
  | "CHECK_FACTS"
  | "RULE_CARD"
  | "APPROVE"
  | "WAITING"
  | "REPLY_READ"
  | "RESOLVED"
  | "MISSING_INFO"
  | "NOT_SURE"
  | "IGNORED"
  | "BLOCKED"
  | "OUT_OF_SCOPE"

export type Facts = {
  company: string
  amount: number | null
  orderId: string | null
  eventDate: string
  firstComplaintDate: string | null
  problem: string
}
