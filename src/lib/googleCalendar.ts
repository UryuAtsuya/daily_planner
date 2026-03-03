import type { Task } from "@/features/day-view/types"
import { getDateKey } from "@/features/day-view/types"

export interface CalendarListItem {
  id: string
  summary: string
  primary?: boolean
}

interface FetchEventsOptions {
  dateKey: string
  calendarId: string
  syncToken?: string
}

interface FetchEventsResult {
  tasks: Task[]
  nextSyncToken?: string
  tokenExpired?: boolean
}

interface GoogleCalendarDateTime {
  dateTime?: string
  date?: string
  timeZone?: string
}

interface GoogleCalendarEvent {
  id?: string
  status?: string
  summary?: string | null
  description?: string | null
  start?: GoogleCalendarDateTime
  end?: GoogleCalendarDateTime
}

interface GoogleCalendarListResponse {
  items?: GoogleCalendarEvent[]
  nextSyncToken?: string
}

interface GoogleCalendarListEntry {
  id?: string
  summary?: string
  primary?: boolean
}

interface GoogleCalendarListEntriesResponse {
  items?: GoogleCalendarListEntry[]
}

interface GoogleCalendarApiError extends Error {
  status?: number
}

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"

async function googleCalendarRequest<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
  searchParams?: URLSearchParams
): Promise<T> {
  const url = new URL(path, GOOGLE_CALENDAR_API_BASE)

  if (searchParams) {
    url.search = searchParams.toString()
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = `Google Calendar API request failed with status ${response.status}`

    try {
      const errorBody = (await response.json()) as {
        error?: { message?: string }
      }
      if (errorBody.error?.message) {
        message = errorBody.error.message
      }
    } catch {
      // Ignore response parsing errors and keep the fallback message.
    }

    const error = new Error(message) as GoogleCalendarApiError
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function getDayRange(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const start = new Date(year, month - 1, day, 0, 0, 0)
  const end = new Date(year, month - 1, day, 23, 59, 59)
  return { start, end }
}

export async function fetchEvents(
  accessToken: string,
  options: FetchEventsOptions
): Promise<FetchEventsResult> {
  const searchParams = new URLSearchParams({
    singleEvents: "true",
    showDeleted: "true",
    maxResults: "2500",
  })

  if (options.syncToken) {
    searchParams.set("syncToken", options.syncToken)
  } else {
    const { start, end } = getDayRange(options.dateKey)
    searchParams.set("timeMin", start.toISOString())
    searchParams.set("timeMax", end.toISOString())
    searchParams.set("orderBy", "startTime")
  }

  try {
    const response = await googleCalendarRequest<GoogleCalendarListResponse>(
      accessToken,
      `/calendars/${encodeURIComponent(options.calendarId)}/events`,
      undefined,
      searchParams
    )
    const events = response.items || []

    const tasks = events
      .filter((event): event is GoogleCalendarEvent & { id: string } => {
        if (!event.id) return false
        if (event.status === "cancelled") return false
        return !!event.start?.dateTime || !!event.start?.date
      })
      .map((event) => convertEventToTask(event, options.dateKey))

    return {
      tasks,
      nextSyncToken: response.nextSyncToken ?? undefined,
    }
  } catch (error) {
    if (typeof error === "object" && error && "status" in error && error.status === 410) {
      return { tasks: [], tokenExpired: true }
    }
    console.error("Google Calendar API error:", error)
    return { tasks: [] }
  }
}

export async function listCalendars(accessToken: string): Promise<CalendarListItem[]> {
  const response = await googleCalendarRequest<GoogleCalendarListEntriesResponse>(
    accessToken,
    "/users/me/calendarList"
  )

  return (response.items || [])
    .filter((item): item is GoogleCalendarListEntry & { id: string; summary: string } => Boolean(item.id && item.summary))
    .map((item) => ({
      id: item.id,
      summary: item.summary,
      primary: item.primary ?? false,
    }))
}

function convertEventToTask(event: GoogleCalendarEvent, fallbackDateKey: string): Task {
  const start = event.start?.dateTime || event.start?.date || ""
  const end = event.end?.dateTime || event.end?.date || ""

  const startDate = new Date(start)
  const endDate = new Date(end)

  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
  const parsed = parseDescriptionTemplate(event.description)

  return {
    id: `google-${event.id}`,
    label: event.summary || "無題のイベント",
    description: parsed.description,
    nextAction: parsed.nextAction,
    itemsToBring: parsed.itemsToBring,
    startMinutes,
    durationMinutes: Math.max(durationMinutes, 5),
    color: "#4285f4",
    dateKey: getDateKey(startDate) || fallbackDateKey,
    categoryId: parsed.categoryId,
    icon: parsed.icon,
  }
}

function convertTaskToEvent(
  task: Omit<Task, "id"> & { id?: string },
  dateKey: string
): GoogleCalendarEvent {
  const [year, month, day] = dateKey.split("-").map(Number)
  const startDate = new Date(year, month - 1, day)
  startDate.setMinutes(task.startMinutes)

  const endDate = new Date(startDate.getTime() + task.durationMinutes * 60 * 1000)

  return {
    summary: task.label,
    description: buildDescriptionTemplate(task),
    start: {
      dateTime: startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }
}

function buildDescriptionTemplate(
  task: Pick<Task, "description" | "nextAction" | "itemsToBring" | "categoryId" | "icon">
): string | undefined {
  const sections: string[] = []
  if (task.description?.trim()) sections.push(task.description.trim())
  if (task.nextAction?.trim()) sections.push(`次のアクション: ${task.nextAction.trim()}`)
  if (task.itemsToBring?.trim()) sections.push(`持ち物: ${task.itemsToBring.trim()}`)
  if (task.categoryId?.trim()) sections.push(`カテゴリ: ${task.categoryId.trim()}`)
  if (task.icon?.trim()) sections.push(`アイコン: ${task.icon.trim()}`)
  return sections.length ? sections.join("\n\n") : undefined
}

function parseDescriptionTemplate(
  description: string | null | undefined
): Pick<Task, "description" | "nextAction" | "itemsToBring" | "categoryId" | "icon"> {
  if (!description) return {}

  const lines = description.split("\n")
  let nextAction: string | undefined
  let itemsToBring: string | undefined
  let categoryId: string | undefined
  let icon: string | undefined
  const descriptionLines: string[] = []

  for (const line of lines) {
    const actionMatch = line.match(/^次のアクション:\s*(.+)$/)
    if (actionMatch) {
      nextAction = actionMatch[1].trim()
      continue
    }

    const itemsMatch = line.match(/^持ち物:\s*(.+)$/)
    if (itemsMatch) {
      itemsToBring = itemsMatch[1].trim()
      continue
    }

    const categoryMatch = line.match(/^カテゴリ:\s*(.+)$/)
    if (categoryMatch) {
      categoryId = categoryMatch[1].trim()
      continue
    }

    const iconMatch = line.match(/^アイコン:\s*(.+)$/)
    if (iconMatch) {
      icon = iconMatch[1].trim()
      continue
    }

    descriptionLines.push(line)
  }

  const plainDescription = descriptionLines.join("\n").trim()
  return {
    description: plainDescription || undefined,
    nextAction,
    itemsToBring,
    categoryId,
    icon,
  }
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  dateKey: string,
  task: Omit<Task, "id">
): Promise<{ googleEventId: string; task: Task }> {
  const eventData = convertTaskToEvent(task, dateKey)
  const createdEvent = await googleCalendarRequest<GoogleCalendarEvent>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      body: JSON.stringify(eventData),
    }
  )

  return {
    googleEventId: createdEvent.id!,
    task: convertEventToTask(createdEvent, dateKey),
  }
}

export async function updateEvent(
  accessToken: string,
  calendarId: string,
  dateKey: string,
  googleEventId: string,
  task: Omit<Task, "id">
): Promise<Task> {
  const eventData = convertTaskToEvent(task, dateKey)
  const updatedEvent = await googleCalendarRequest<GoogleCalendarEvent>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
    {
      method: "PUT",
      body: JSON.stringify(eventData),
    }
  )

  return convertEventToTask(updatedEvent, dateKey)
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  googleEventId: string
): Promise<void> {
  await googleCalendarRequest<void>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
    {
      method: "DELETE",
    }
  )
}
