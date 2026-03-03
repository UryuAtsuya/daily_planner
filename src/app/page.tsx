"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { ChartAppearance, DEFAULT_CHART_APPEARANCE } from "@/features/day-view/constants/chartAppearance"
import { ACCENT_THEME_STORAGE_KEY, CHART_APPEARANCE_STORAGE_KEY, DIARY_STORAGE_KEY, TEMPLATES_STORAGE_KEY, THEME_STORAGE_KEY } from "@/features/day-view/constants/storageKeys"
import { TaskModal } from "@/features/day-view/components/TaskModal"
import { SettingsPage } from "@/features/settings/SettingsPage"
import { useTaskStore } from "@/features/day-view/hooks/useTaskStore"
import { addDays, extractGoogleEventId, getWeekEnd, getWeekStart } from "@/features/day-view/utils/schedule"
import { TASK_TEMPLATES, TaskTemplate, Task, getDateKey } from "@/features/day-view/types"
import { AuthPage, AuthSuccess } from "@/features/auth"
import { AccentTheme, isAccentTheme } from "@/lib/accentTheme"

// New Imports
import { MainNavigation, ViewType } from "@/features/main/components/MainNavigation"
import { DailyPlannerView } from "@/features/day-view/components/DailyPlannerView"
import { PomodoroTimer } from "@/features/timer/components/PomodoroTimer"
import { TodoView } from "@/features/todo/components/TodoView"
import { aggregateCategoryMinutes } from "@/features/day-view/utils/schedule"

interface GoogleEventsResponse {
  tasks: Task[]
}

interface CreateEventResponse {
  googleEventId: string
  task: Task
}

type UpdateEventResponse = Task

export default function Home() {
  const { tasks, isLoaded, addTask, updateTask, deleteTask } = useTaskStore()
  const { data: session, status } = useSession()

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>("planner")

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [googleTasks, setGoogleTasks] = useState<Task[]>([])
  const selectedCalendarId = "primary"
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("mono")

  // ダークモードをhtml要素に反映（fixedなモーダルにもCSS変数を届けるため）
  useEffect(() => {
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }, [isDarkMode])

  const [diaryEntries, setDiaryEntries] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {}
    const raw = localStorage.getItem(DIARY_STORAGE_KEY)
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw) as Record<string, string>
      return parsed && typeof parsed === "object" ? parsed : {}
    } catch {
      return {}
    }
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<TaskTemplate[]>(() => {
    if (typeof window === "undefined") return TASK_TEMPLATES
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY)
    if (!raw) return TASK_TEMPLATES
    try {
      return JSON.parse(raw) as TaskTemplate[]
    } catch {
      return TASK_TEMPLATES
    }
  })
  const [chartAppearance] = useState<ChartAppearance>(() => {
    if (typeof window === "undefined") return DEFAULT_CHART_APPEARANCE
    const raw = localStorage.getItem(CHART_APPEARANCE_STORAGE_KEY)
    if (!raw) return DEFAULT_CHART_APPEARANCE
    try {
      return JSON.parse(raw)
    } catch {
      return DEFAULT_CHART_APPEARANCE
    }
  })

  const currentDateKey = useMemo(() => getDateKey(currentDate), [currentDate])

  const localTasksForDate = useMemo(
    () => tasks.filter((task) => task.dateKey === currentDateKey),
    [tasks, currentDateKey]
  )

  const syncedGoogleIds = useMemo(
    () => new Set(localTasksForDate.map((task) => task.googleEventId).filter((id): id is string => Boolean(id))),
    [localTasksForDate]
  )

  const visibleGoogleTasks = useMemo(
    () => googleTasks.filter((task) => {
      const id = extractGoogleEventId(task)
      return id ? !syncedGoogleIds.has(id) : true
    }),
    [googleTasks, syncedGoogleIds]
  )

  const allTasks = useMemo(
    () => [...localTasksForDate, ...visibleGoogleTasks].sort((a, b) => a.startMinutes - b.startMinutes),
    [localTasksForDate, visibleGoogleTasks]
  )

  const diary = diaryEntries[currentDateKey] ?? ""

  // Stats
  const weekStats = useMemo(() => {
    const start = getWeekStart(currentDate)
    const end = getWeekEnd(currentDate)
    const targets = tasks.filter((task) => {
      const [y, m, d] = task.dateKey.split("-").map(Number)
      const date = new Date(y, m - 1, d)
      return date >= start && date <= end
    })
    return aggregateCategoryMinutes(targets)
  }, [tasks, currentDate])

  const monthStats = useMemo(() => {
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const targets = tasks.filter((task) => {
      const [taskYear, taskMonth] = task.dateKey.split("-").map(Number)
      return taskYear === year && taskMonth - 1 === month
    })
    return aggregateCategoryMinutes(targets)
  }, [tasks, currentDate])

  // Google Handlers (truncated for brevity but keep original logic in mind)
  const fetchGoogleEvents = useCallback(async () => {
    if (!session?.accessToken) return
    try {
      const params = new URLSearchParams({ date: currentDateKey, calendarId: selectedCalendarId })
      const res = await fetch(`/api/calendar/events?${params.toString()}`)
      if (!res.ok) return
      const result = await res.json() as GoogleEventsResponse
      setGoogleTasks(result.tasks ?? [])
    } catch (error) { console.error(error) }
  }, [currentDateKey, selectedCalendarId, session?.accessToken])

  const updateGoogleCalendarEvent = useCallback(async (task: Task, data: Omit<Task, "id">) => {
    const googleEventId = extractGoogleEventId(task)
    if (!googleEventId) throw new Error("Missing Google event ID")

    const res = await fetch(`/api/calendar/events/${encodeURIComponent(googleEventId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        calendarId: selectedCalendarId,
      }),
    })

    if (!res.ok) {
      throw new Error("Failed to update Google Calendar event")
    }

    return res.json() as Promise<UpdateEventResponse>
  }, [selectedCalendarId])

  const deleteGoogleCalendarEvent = useCallback(async (task: Task) => {
    const googleEventId = extractGoogleEventId(task)
    if (!googleEventId) throw new Error("Missing Google event ID")

    const params = new URLSearchParams({ calendarId: selectedCalendarId })
    const res = await fetch(`/api/calendar/events/${encodeURIComponent(googleEventId)}?${params.toString()}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      throw new Error("Failed to delete Google Calendar event")
    }
  }, [selectedCalendarId])

  const handleSyncToGoogle = async (task: Task) => {
    if (!session?.accessToken) return
    setIsSyncing(true)
    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...task,
          dateKey: task.dateKey,
          calendarId: selectedCalendarId,
        }),
      })
      if (res.ok) {
        const synced = (await res.json()) as CreateEventResponse
        updateTask(task.id, {
          googleEventId: synced.googleEventId,
          syncStatus: "synced",
        })
        await fetchGoogleEvents()
      } else {
        updateTask(task.id, { syncStatus: "error" })
      }
    } catch (error) {
      console.error(error)
      updateTask(task.id, { syncStatus: "error" })
    } finally { setIsSyncing(false) }
  }

  const handleBulkSyncToGoogle = async () => {
    const unsynced = localTasksForDate.filter((t) => !t.googleEventId)
    for (const t of unsynced) {
      await handleSyncToGoogle(t)
    }
  }

  const handleTaskAdjust = async (taskId: string, startMinutes: number, durationMinutes: number) => {
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return

    const nextData: Omit<Task, "id"> = {
      label: task.label,
      description: task.description,
      nextAction: task.nextAction,
      itemsToBring: task.itemsToBring,
      startMinutes,
      durationMinutes,
      color: task.color,
      dateKey: task.dateKey,
      categoryId: task.categoryId,
      icon: task.icon,
      googleEventId: task.googleEventId,
      syncStatus: task.syncStatus,
    }

    if (extractGoogleEventId(task)) {
      setIsSyncing(true)
      try {
        await updateGoogleCalendarEvent(task, nextData)
        if (task.id.startsWith("google-")) {
          await fetchGoogleEvents()
        } else {
          updateTask(taskId, {
            startMinutes,
            durationMinutes,
            syncStatus: "synced",
          })
          await fetchGoogleEvents()
        }
      } catch (error) {
        console.error(error)
        if (!task.id.startsWith("google-")) {
          updateTask(taskId, { syncStatus: "error" })
        }
      } finally {
        setIsSyncing(false)
      }
      return
    }

    updateTask(taskId, { startMinutes, durationMinutes })
  }

  const handleApplyTemplate = (templateId: string) => {
    const template = customTemplates.find(t => t.id === templateId) || TASK_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      template.tasks.forEach(task => {
        addTask({ ...task, dateKey: currentDateKey, syncStatus: "local" })
      })
    }
  }

  const handleSave = async (data: Omit<Task, "id">) => {
    if (editingTask) {
      if (extractGoogleEventId(editingTask)) {
        setIsSyncing(true)
        try {
          const updatedTask = await updateGoogleCalendarEvent(editingTask, data)
          if (editingTask.id.startsWith("google-")) {
            await fetchGoogleEvents()
          } else {
            updateTask(editingTask.id, {
              ...data,
              googleEventId: updatedTask.id.replace("google-", ""),
              syncStatus: "synced",
            })
            await fetchGoogleEvents()
          }
        } catch (error) {
          console.error(error)
          if (!editingTask.id.startsWith("google-")) {
            updateTask(editingTask.id, { syncStatus: "error" })
          }
          return false
        } finally {
          setIsSyncing(false)
        }
      } else {
        updateTask(editingTask.id, data)
      }
    } else {
      addTask({ ...data, dateKey: currentDateKey, syncStatus: "local" })
    }
    setIsModalOpen(false)
    return true
  }

  const handleDeleteTask = async (task: Task) => {
    if (extractGoogleEventId(task)) {
      setIsSyncing(true)
      try {
        await deleteGoogleCalendarEvent(task)
        if (task.id.startsWith("google-")) {
          await fetchGoogleEvents()
        } else {
          deleteTask(task.id)
          await fetchGoogleEvents()
        }
      } catch (error) {
        console.error(error)
        if (!task.id.startsWith("google-")) {
          updateTask(task.id, { syncStatus: "error" })
        }
      } finally {
        setIsSyncing(false)
      }
      return
    }

    deleteTask(task.id)
  }

  // Effects
  useEffect(() => {
    if (typeof window === "undefined") return
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === "dark") setIsDarkMode(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedAccent = localStorage.getItem(ACCENT_THEME_STORAGE_KEY)
    if (isAccentTheme(storedAccent)) setAccentTheme(storedAccent)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    html.dataset.accent = accentTheme
    localStorage.setItem(ACCENT_THEME_STORAGE_KEY, accentTheme)
  }, [accentTheme])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(diaryEntries))
  }, [diaryEntries])

  useEffect(() => {
    if (session?.accessToken) {
      if (!sessionStorage.getItem("hasShownWelcome")) {
        setShowSuccess(true)
        sessionStorage.setItem("hasShownWelcome", "true")
      }
      fetchGoogleEvents()
    }
  }, [session?.accessToken, fetchGoogleEvents])

  // Auth & Overlays
  if (status === "loading" || !isLoaded) return <div className="p-8 text-center">読み込み中...</div>
  if (!session) return <AuthPage />
  if (showSuccess) return <AuthSuccess userName={session.user?.name ?? undefined} onComplete={() => setShowSuccess(false)} />
  if (isSettingsOpen) return (
    <SettingsPage
      userName={session.user?.name}
      userImage={session.user?.image}
      userEmail={session.user?.email}
      accentTheme={accentTheme}
      onAccentThemeChange={setAccentTheme}
      templates={customTemplates}
      onSaveTemplates={(t) => { setCustomTemplates(t); localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(t)) }}
      onClose={() => setIsSettingsOpen(false)}
    />
  )

  const renderView = () => {
    switch (currentView) {
      case "planner":
        return (
          <DailyPlannerView
            currentDate={currentDate}
            allTasks={allTasks}
            localTasksForDate={localTasksForDate}
            selectedTaskId={selectedTaskId}
            chartAppearance={chartAppearance}
            diary={diary}
            weekStats={weekStats}
            monthStats={monthStats}
            onPrevDay={() => setCurrentDate(p => addDays(p, -1))}
            onNextDay={() => setCurrentDate(p => addDays(p, 1))}
            onAddModal={() => { setEditingTask(undefined); setIsModalOpen(true) }}
            onEditModal={(task) => { setSelectedTaskId(task.id); setEditingTask(task); setIsModalOpen(true) }}
            onDelete={handleDeleteTask}
            onSyncToGoogle={handleSyncToGoogle}
            onBulkSync={handleBulkSyncToGoogle}
            onTaskAdjust={handleTaskAdjust}
            onSelectTask={(t) => setSelectedTaskId(t.id)}
            onDiaryChange={(text) => setDiaryEntries(prev => ({ ...prev, [currentDateKey]: text }))}
            onApplyTemplate={handleApplyTemplate}
            customTemplates={customTemplates}
          />
        )
      case "focus":
        return <PomodoroTimer />
      case "todo":
        return <TodoView />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col app-surface transition-colors duration-300">

      <header className="sticky top-0 z-40 w-full border-b border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface))/0.92] backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-[64px] max-w-7xl mx-auto">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg border border-[hsl(var(--ui-line-strong))] bg-[hsl(var(--ui-surface-soft))] flex items-center justify-center text-[hsl(var(--ui-text-soft))]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-[0.95rem] font-semibold text-[hsl(var(--ui-text-strong))]">Daily Planner</span>
              <span className="text-[0.6875rem] text-[hsl(var(--ui-text-muted))]">Plan calmly, focus deeply</span>
            </div>
          </div>

          <MainNavigation currentView={currentView} onViewChange={setCurrentView} />

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Date pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-soft))]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--ui-text-muted))" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {currentDate.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" })}
            </div>

            {/* Sync status */}
            {isSyncing && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-muted))] text-[0.6875rem] font-semibold">
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                同期中
              </div>
            )}

            {/* Dark mode */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="icon-button"
              aria-label={isDarkMode ? "ライトモードへ" : "ダークモードへ"}
            >
              {isDarkMode
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--ui-brand))" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--ui-text-muted))" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              }
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="icon-button"
              aria-label="設定"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--ui-text-muted))" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-[hsl(var(--ui-line))] mx-0.5" />

            {/* User avatar chip */}
            <button className="flex items-center gap-2 pl-0.5 pr-3 py-1 rounded-full hover:bg-[hsl(var(--ui-surface-secondary))] transition-colors group">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[hsl(var(--ui-text-soft))] text-[0.6875rem] font-semibold bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))]"
                >
                  {(session.user?.name ?? "G").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block text-[0.75rem] font-semibold text-[hsl(var(--ui-text-soft))] group-hover:text-[hsl(var(--ui-text-strong))] transition-colors">
                {session.user?.name ?? "Guest"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ════ Page Content ════ */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderView()}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        dateKey={currentDateKey}
        onSave={handleSave}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
