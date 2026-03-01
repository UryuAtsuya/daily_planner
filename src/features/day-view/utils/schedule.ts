import { Task, getCategoryById } from "@/features/day-view/types"

export function extractGoogleEventId(task: Task): string | undefined {
  if (task.id.startsWith("google-")) {
    return task.id.replace("google-", "")
  }
  return task.googleEventId
}

export function getSyncTokenKey(calendarId: string, dateKey: string) {
  return `${calendarId}:${dateKey}`
}

export function addDays(base: Date, offset: number) {
  const date = new Date(base)
  date.setDate(date.getDate() + offset)
  return date
}

export function getWeekStart(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - result.getDay())
  return result
}

export function getWeekEnd(date: Date) {
  const result = getWeekStart(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

export function aggregateCategoryMinutes(tasks: Task[]) {
  const map = new Map<string, number>()

  for (const task of tasks) {
    const key = task.categoryId ?? "uncategorized"
    map.set(key, (map.get(key) ?? 0) + task.durationMinutes)
  }

  return [...map.entries()]
    .map(([categoryId, minutes]) => ({
      categoryId,
      minutes,
      category: getCategoryById(categoryId),
    }))
    .sort((a, b) => b.minutes - a.minutes)
}

export function minuteToHourLabel(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`
}
