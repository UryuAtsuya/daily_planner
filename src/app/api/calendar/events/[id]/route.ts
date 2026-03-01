import { auth } from "@/lib/auth"
import { deleteEvent, updateEvent } from "@/lib/googleCalendar"
import { NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth()
  const { id } = await params

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

    const updatedTask = await updateEvent(session.accessToken, calendarId, dateKey, id, body)
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth()
  const { id } = await params

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const calendarId = url.searchParams.get("calendarId") ?? "primary"
    await deleteEvent(session.accessToken, calendarId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
