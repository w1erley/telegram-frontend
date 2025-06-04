import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {toastError} from "@/lib/utils/toastError";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(dateString?: string | Date) {
  if (!dateString) return ""

  const d = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()

  const timePart = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  if (isToday) {
    return timePart
  }

  const monthDay = d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })

  return `${monthDay} at ${timePart}`
}


export { toastError };