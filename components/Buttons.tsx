import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}

export function PrimaryButton({ children, onClick, className, disabled, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg bg-positive px-4 py-3 text-sm font-semibold text-paper shadow-lg shadow-positive/25 transition duration-150 hover:bg-[#12722f] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, className, disabled, type = "button" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-positive hover:bg-positive-soft active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      {children}
    </button>
  )
}
