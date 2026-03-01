/**
 * 日別タスクデータ
 */
export interface Task {
  id: string
  label: string
  description?: string
  nextAction?: string
  itemsToBring?: string
  startMinutes: number
  durationMinutes: number
  color: string
  dateKey: string
  categoryId?: string
  icon?: string
  googleEventId?: string
  syncStatus?: "local" | "synced" | "syncing" | "error"
}

export interface TaskTemplate {
  id: string
  name: string
  tasks: Array<Omit<Task, "id" | "dateKey">>
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export function getDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date)
}

export function minutesToTimeString(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

export function timeStringToMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number)
  return hours * 60 + mins
}

export function snapToFiveMinutes(minutes: number): number {
  return Math.round(minutes / 5) * 5
}

export const COLOR_PALETTE_8 = [
  "hsl(212 80% 58%)",
  "hsl(245 58% 63%)",
  "hsl(165 58% 46%)",
  "hsl(140 52% 46%)",
  "hsl(18 78% 58%)",
  "hsl(335 70% 58%)",
  "hsl(282 58% 58%)",
  "hsl(36 80% 56%)",
] as const

export const CATEGORIES: Category[] = [
  { id: "work", name: "仕事", icon: "💼", color: "hsl(212 80% 58%)" },
  { id: "sleep", name: "睡眠", icon: "🌙", color: "hsl(245 58% 63%)" },
  { id: "study", name: "学習", icon: "📚", color: "hsl(165 58% 46%)" },
  { id: "health", name: "健康", icon: "🏃", color: "hsl(140 52% 46%)" },
  { id: "family", name: "家族", icon: "🏠", color: "hsl(18 78% 58%)" },
  { id: "focus", name: "集中", icon: "🎯", color: "hsl(335 70% 58%)" },
  { id: "hobby", name: "趣味", icon: "🎨", color: "hsl(282 58% 58%)" },
  { id: "break", name: "休憩", icon: "☕", color: "hsl(36 80% 56%)" },
]

export function getCategoryById(categoryId?: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === categoryId)
}

const defaultDateKey = getDateKey(new Date())

export const DEFAULT_TASKS: Task[] = [
  {
    id: "1",
    label: "Sleep",
    description: "質の高い睡眠で翌日の集中力を整える",
    startMinutes: 0,
    durationMinutes: 420,
    color: "hsl(245 58% 63%)",
    dateKey: defaultDateKey,
    categoryId: "sleep",
    icon: "🌙",
  },
  {
    id: "2",
    label: "Morning Routine",
    description: "朝食、身支度、今日の優先タスク確認",
    nextAction: "今日の最重要タスクを1つだけ決める",
    itemsToBring: "財布, 水筒",
    startMinutes: 420,
    durationMinutes: 120,
    color: "hsl(36 80% 56%)",
    dateKey: defaultDateKey,
    categoryId: "break",
    icon: "☕",
  },
  {
    id: "3",
    label: "Work",
    description: "午前は深い作業、午後は会議とレビュー中心",
    nextAction: "15時までに提案書ドラフトを完成",
    itemsToBring: "ノートPC, 充電器",
    startMinutes: 540,
    durationMinutes: 480,
    color: "hsl(212 80% 58%)",
    dateKey: defaultDateKey,
    categoryId: "work",
    icon: "💼",
  },
  {
    id: "4",
    label: "Free Time",
    description: "運動や読書でリフレッシュする時間",
    startMinutes: 1020,
    durationMinutes: 420,
    color: "hsl(282 58% 58%)",
    dateKey: defaultDateKey,
    categoryId: "hobby",
    icon: "🎨",
  },
]

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "office-day",
    name: "仕事デー",
    tasks: [
      { label: "睡眠", startMinutes: 0, durationMinutes: 420, color: "hsl(245 58% 63%)", categoryId: "sleep", icon: "🌙" },
      { label: "朝準備", startMinutes: 420, durationMinutes: 90, color: "hsl(36 80% 56%)", categoryId: "break", icon: "☕" },
      { label: "集中作業", startMinutes: 540, durationMinutes: 210, color: "hsl(212 80% 58%)", categoryId: "work", icon: "💼" },
      { label: "ミーティング", startMinutes: 780, durationMinutes: 120, color: "hsl(335 70% 58%)", categoryId: "work", icon: "🗣️" },
      { label: "学習", startMinutes: 1200, durationMinutes: 90, color: "hsl(165 58% 46%)", categoryId: "study", icon: "📚" },
    ],
  },
  {
    id: "learning-day",
    name: "学習デー",
    tasks: [
      { label: "睡眠", startMinutes: 0, durationMinutes: 420, color: "hsl(245 58% 63%)", categoryId: "sleep", icon: "🌙" },
      { label: "朝の振り返り", startMinutes: 420, durationMinutes: 60, color: "hsl(36 80% 56%)", categoryId: "break", icon: "☀️" },
      { label: "深い学習", startMinutes: 540, durationMinutes: 180, color: "hsl(165 58% 46%)", categoryId: "study", icon: "📚" },
      { label: "演習", startMinutes: 780, durationMinutes: 150, color: "hsl(282 58% 58%)", categoryId: "focus", icon: "🎯" },
      { label: "復習", startMinutes: 1140, durationMinutes: 120, color: "hsl(140 52% 46%)", categoryId: "study", icon: "🧠" },
    ],
  },
  {
    id: "recovery-day",
    name: "回復デー",
    tasks: [
      { label: "睡眠", startMinutes: 0, durationMinutes: 480, color: "hsl(245 58% 63%)", categoryId: "sleep", icon: "🌙" },
      { label: "散歩", startMinutes: 540, durationMinutes: 60, color: "hsl(140 52% 46%)", categoryId: "health", icon: "🚶" },
      { label: "家族時間", startMinutes: 660, durationMinutes: 180, color: "hsl(18 78% 58%)", categoryId: "family", icon: "🏠" },
      { label: "趣味", startMinutes: 900, durationMinutes: 180, color: "hsl(282 58% 58%)", categoryId: "hobby", icon: "🎨" },
      { label: "日記", startMinutes: 1260, durationMinutes: 30, color: "hsl(335 70% 58%)", categoryId: "focus", icon: "✍️" },
    ],
  },
]

export function isGoogleTask(task: Task): boolean {
  return task.id.startsWith("google-")
}
