export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function truncateText(value: string, max = 80) {
  if (value.length <= max) {
    return value
  }

  return `${value.slice(0, max).trimEnd()}...`
}
