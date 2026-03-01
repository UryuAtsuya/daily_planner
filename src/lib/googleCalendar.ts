import { google, calendar_v3 } from "googleapis"
import { Task, getDateKey } from "@/features/day-view/types"

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

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.calendar({ version: "v3", auth })
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
  const calendar = getCalendarClient(accessToken)

  const baseParams: calendar_v3.Params$Resource$Events$List = {
    calendarId: options.calendarId,
    singleEvents: true,
    showDeleted: true,
    maxResults: 2500,
  }

  if (options.syncToken) {
    baseParams.syncToken = options.syncToken
  } else {
    const { start, end } = getDayRange(options.dateKey)
    baseParams.timeMin = start.toISOString()
    baseParams.timeMax = end.toISOString()
    baseParams.orderBy = "startTime"
  }

  try {
    const response = await calendar.events.list(baseParams)
    const events = response.data.items || []

    const tasks = events
      .filter((event): event is calendar_v3.Schema$Event & { id: string } => {
        if (!event.id) return false
        if (event.status === "cancelled") return false
        return !!event.start?.dateTime || !!event.start?.date
      })
      .map((event) => convertEventToTask(event, options.dateKey))

    return {
      tasks,
      nextSyncToken: response.data.nextSyncToken ?? undefined,
    }
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 410) {
      return { tasks: [], tokenExpired: true }
    }
    console.error("Google Calendar API error:", error)
    return { tasks: [] }
  }
}

export async function listCalendars(accessToken: string): Promise<CalendarListItem[]> {
  const calendar = getCalendarClient(accessToken)
  const response = await calendar.calendarList.list()

  return (response.data.items || [])
    .filter((item): item is calendar_v3.Schema$CalendarListEntry & { id: string; summary: string } =>
      Boolean(item.id && item.summary)
    )
    .map((item) => ({
      id: item.id,
      summary: item.summary,
      primary: item.primary ?? false,
    }))
}

function convertEventToTask(event: calendar_v3.Schema$Event, fallbackDateKey: string): Task {
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
): calendar_v3.Schema$Event {
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
  const calendar = getCalendarClient(accessToken)
  const eventData = convertTaskToEvent(task, dateKey)

  const response = await calendar.events.insert({
    calendarId,
    requestBody: eventData,
  })

  const createdEvent = response.data
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
  const calendar = getCalendarClient(accessToken)
  const eventData = convertTaskToEvent(task, dateKey)

  const response = await calendar.events.update({
    calendarId,
    eventId: googleEventId,
    requestBody: eventData,
  })

  return convertEventToTask(response.data, dateKey)
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  googleEventId: string
): Promise<void> {
  const calendar = getCalendarClient(accessToken)

  await calendar.events.delete({
    calendarId,
    eventId: googleEventId,
  })
}
