export type ComputedDeadline = {
  date: string
  label: string
}

export function computeDeadline(
  fromDate: string,
  duration: { days: number },
  now?: Date
): ComputedDeadline {
  const base = new Date(fromDate)
  base.setDate(base.getDate() + duration.days)
  const dateStr = base.toISOString().split("T")[0]
  return {
    date: dateStr,
    label: formatDateLabel(dateStr),
  }
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00.000Z")
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }
  return date.toLocaleDateString("en-IN", options)
}

export function daysBetween(date1: string, date2: Date): number {
  const d1 = new Date(date1 + "T00:00:00.000Z")
  const d2 = new Date(date2.toISOString().split("T")[0] + "T00:00:00.000Z")
  const diff = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function fillDeadlinePlaceholder(text: string, deadline: ComputedDeadline): string {
  return text.replace(/{{deadline}}/g, deadline.label)
}
