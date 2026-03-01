import { auth } from "@/lib/auth"
import { createEvent, fetchEvents } from "@/lib/googleCalendar"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const dateKey = url.searchParams.get("date")
  const calendarId = url.searchParams.get("calendarId") ?? "primary"
  const syncToken = url.searchParams.get("syncToken") ?? undefined

  if (!dateKey) {
    return NextResponse.json({ error: "date is required" }, { status: 400 })
  }

  try {
    const result = await fetchEvents(session.accessToken, {
      dateKey,
      calendarId,
      syncToken,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const calendarId = body.calendarId || "primary"
    const dateKey = body.dateKey

    if (!dateKey) {
      return NextResponse.json({ error: "dateKey is required" }, { status: 400 })
    }

    const result = await createEvent(session.accessToken, calendarId, dateKey, body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
