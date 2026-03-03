"use client"

import { useMemo, useState } from "react"
import {
    ChevronLeft, ChevronRight,
    Plus, RefreshCw,
    Clock, BarChart3, TrendingUp, Sparkles, CalendarClock, Link2
} from "lucide-react"
import { DailyPieChart } from "@/features/day-view/components/DailyPieChart"
import { TaskList } from "@/features/day-view/components/TaskList"
import { Task, formatDateLabel, TaskTemplate, minutesToTimeString } from "@/features/day-view/types"
import { ChartAppearance } from "@/features/day-view/constants/chartAppearance"
import { cn } from "@/lib/utils"

interface AggregateStatItem { minutes: number }

interface DailyPlannerViewProps {
    currentDate: Date
    allTasks: Task[]
    localTasksForDate: Task[]
    selectedTaskId: string | undefined
    chartAppearance: ChartAppearance
    diary: string
    weekStats: AggregateStatItem[]
    monthStats: AggregateStatItem[]
    onPrevDay: () => void
    onNextDay: () => void
    onAddModal: () => void
    onEditModal: (task: Task) => void
    onDelete: (task: Task) => void
    onSyncToGoogle: (task: Task) => void
    onBulkSync: () => void
    onTaskAdjust: (taskId: string, start: number, duration: number) => void
    onSelectTask: (task: Task) => void
    onDiaryChange: (text: string) => void
    onApplyTemplate: (templateId: string) => void
    customTemplates: TaskTemplate[]
}

export function DailyPlannerView({
    currentDate, allTasks, localTasksForDate, selectedTaskId,
    chartAppearance, diary,
    weekStats, monthStats, onPrevDay, onNextDay,
    onAddModal, onEditModal, onDelete, onSyncToGoogle, onBulkSync,
    onTaskAdjust, onSelectTask, onDiaryChange,
    onApplyTemplate, customTemplates,
}: DailyPlannerViewProps) {

    const [selectedTemplateId, setSelectedTemplateId] = useState(customTemplates[0]?.id ?? "")

    const totalMinutes = useMemo(() => allTasks.reduce((s, t) => s + t.durationMinutes, 0), [allTasks])
    const totalHours = (totalMinutes / 60).toFixed(1)
    const weekHours = (weekStats.reduce((s, i) => s + i.minutes, 0) / 60).toFixed(1)
    const monthHours = (monthStats.reduce((s, i) => s + i.minutes, 0) / 60).toFixed(1)
    const effectiveTplId = selectedTemplateId || customTemplates[0]?.id || ""
    const sortedTasks = useMemo(
        () => [...allTasks].sort((a, b) => a.startMinutes - b.startMinutes),
        [allTasks]
    )
    const firstTask = sortedTasks[0]
    const lastTask = sortedTasks.at(-1)
    const totalBreakMinutes = useMemo(() => {
        if (sortedTasks.length < 2) return 0
        return sortedTasks.reduce((sum, task, index) => {
            const nextTask = sortedTasks[index + 1]
            if (!nextTask) return sum
            const gap = nextTask.startMinutes - (task.startMinutes + task.durationMinutes)
            return gap > 0 ? sum + gap : sum
        }, 0)
    }, [sortedTasks])
    const today = new Date()
    const isCurrentDateToday =
        today.getFullYear() === currentDate.getFullYear()
        && today.getMonth() === currentDate.getMonth()
        && today.getDate() === currentDate.getDate()
    const nowMinutes = today.getHours() * 60 + today.getMinutes()
    const upcomingTasks = useMemo(() => {
        if (!isCurrentDateToday) return sortedTasks.slice(0, 3)
        return sortedTasks
            .filter((task) => task.startMinutes + task.durationMinutes >= nowMinutes)
            .slice(0, 3)
    }, [isCurrentDateToday, nowMinutes, sortedTasks])
    const syncedCount = localTasksForDate.filter((task) => task.syncStatus === "synced").length

    const reflectionPrompts = [
        "今日うまくいったこと",
        "次に改善すること",
        "明日の最重要タスク",
    ]

    const stats = [
        { label: "Tasks", value: localTasksForDate.length.toString(), icon: BarChart3, color: "text-[hsl(var(--ui-brand))]", bg: "bg-[hsl(var(--ui-brand)/0.1)]" },
        { label: "Today", value: `${totalHours}h`, icon: Clock, color: "text-[hsl(var(--ui-cyan))]", bg: "bg-[hsl(var(--ui-cyan)/0.1)]" },
        { label: "Week", value: `${weekHours}h`, icon: TrendingUp, color: "text-[hsl(var(--ui-green))]", bg: "bg-[hsl(var(--ui-green)/0.1)]" },
        { label: "Month", value: `${monthHours}h`, icon: BarChart3, color: "text-[hsl(var(--ui-pink))]", bg: "bg-[hsl(var(--ui-pink)/0.1)]" },
    ]

    return (
        <div className="w-full text-[hsl(var(--ui-text-strong))] transition-colors duration-300">
            <div className="space-y-7">

                {/* ─── Sub-header: Page title + Date navigator ─── */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    {/* Left: Page title */}
                    <div>
                        <h1 className="font-display text-[1.75rem] sm:text-[2rem] font-bold tracking-tight leading-tight">
                            <span>Today</span>
                        </h1>
                        <p className="text-[0.8125rem] font-medium text-[hsl(var(--ui-text-muted))] mt-1">
                            {formatDateLabel(currentDate)}
                        </p>
                    </div>

                    {/* Right: Date navigator */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 p-1 rounded-[0.875rem] premium-card">
                            <button
                                onClick={onPrevDay}
                                className="p-1.5 rounded-[0.5rem] text-[hsl(var(--ui-text-muted))] hover:bg-[hsl(var(--ui-surface-secondary))] hover:text-[hsl(var(--ui-brand))] transition-all"
                                aria-label="前の日"
                            >
                                <ChevronLeft size={14} strokeWidth={2.5} />
                            </button>
                            <span className="text-[0.8125rem] font-semibold px-3 py-0.5 tabular-nums">
                                {currentDate.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" })}
                            </span>
                            <button
                                onClick={onNextDay}
                                className="p-1.5 rounded-[0.5rem] text-[hsl(var(--ui-text-muted))] hover:bg-[hsl(var(--ui-surface-secondary))] hover:text-[hsl(var(--ui-brand))] transition-all"
                                aria-label="次の日"
                            >
                                <ChevronRight size={14} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Add task CTA */}
                        <button
                            onClick={onAddModal}
                            className="primary-button py-2 px-4 text-[0.8125rem]"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            予定追加
                        </button>
                    </div>
                </div>

                {/* ─── Main Grid ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-8">
                    <section className="premium-card p-7 sm:p-8 lg:col-start-1 lg:row-start-1">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-[0.9375rem] font-bold tracking-tight text-[hsl(var(--ui-text-strong))]">
                                    今日のタイムライン
                                </h2>
                                <p className="text-[0.75rem] text-[hsl(var(--ui-text-muted))] mt-0.5">
                                    24時間スケジュール
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-muted))]">
                                <span className="text-[0.6875rem] font-semibold">Timeline</span>
                            </div>
                        </div>
                        <div className="flex justify-center py-3">
                            <DailyPieChart
                                tasks={allTasks}
                                appearance={chartAppearance}
                                selectedTaskId={selectedTaskId}
                                onTaskAdjust={onTaskAdjust}
                            />
                        </div>
                        <div className="grid gap-3.5 mt-6 grid-cols-2 sm:grid-cols-4">
                            {stats.map(({ label, value, icon: Icon, color, bg }) => (
                                <div key={label} className="stat-widget group cursor-default">
                                    <div className={cn("inline-flex items-center justify-center w-7 h-7 rounded-lg mb-2 mx-auto", bg)}>
                                        <Icon size={15} className={color} />
                                    </div>
                                    <p className="text-[0.625rem] font-semibold tracking-wide uppercase text-[hsl(var(--ui-text-muted))] mb-1">{label}</p>
                                    <p className="text-[1.375rem] font-semibold tracking-tight leading-none text-[hsl(var(--ui-text-strong))]">{value}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="premium-card p-7 sm:p-8 min-h-[520px] lg:col-start-2 lg:row-start-1">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <div>
                                <h2 className="text-[0.9375rem] font-bold tracking-tight text-[hsl(var(--ui-text-strong))]">メインの予定</h2>
                                <p className="text-[0.75rem] text-[hsl(var(--ui-text-muted))] mt-0.5">
                                    {localTasksForDate.length}件のタスク
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onBulkSync}
                                    className="text-[0.75rem] font-semibold px-3.5 py-2 rounded-full bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-muted))] hover:border-[hsl(var(--ui-brand)/0.4)] hover:text-[hsl(var(--ui-brand))] transition-all"
                                >
                                    <RefreshCw size={12} className="inline mr-1.5 -mt-0.5" />
                                    同期
                                </button>
                                <button
                                    onClick={onAddModal}
                                    className="primary-button text-[0.75rem] py-2 px-4"
                                >
                                    <Plus size={13} strokeWidth={2.5} />
                                    追加
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6 p-2.5 rounded-xl bg-[hsl(var(--ui-surface-soft))] dark:bg-[hsl(var(--ui-surface-secondary))] border border-[hsl(var(--ui-line))]">
                            <select
                                value={effectiveTplId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                className="
                                    flex-1 bg-transparent border-none
                                    text-[0.8125rem] font-semibold text-[hsl(var(--ui-text-strong))]
                                    focus:outline-none cursor-pointer appearance-none px-2
                                "
                            >
                                {customTemplates.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => effectiveTplId && onApplyTemplate(effectiveTplId)}
                                disabled={!effectiveTplId}
                                className="
                                    text-[0.75rem] font-bold px-4 py-1.5 rounded-lg shrink-0
                                    bg-[hsl(var(--ui-brand))] text-white
                                    hover:bg-[hsl(var(--ui-brand-strong))] transition-colors
                                    disabled:opacity-40 shadow-sm
                                "
                            >
                                適用
                            </button>
                        </div>

                        <TaskList
                            tasks={allTasks}
                            onEdit={onEditModal}
                            onDelete={onDelete}
                            onSyncToGoogle={onSyncToGoogle}
                            onSelect={onSelectTask}
                            selectedTaskId={selectedTaskId}
                        />
                    </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    <section className="premium-card p-7 sm:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-[0.9375rem] font-bold tracking-tight text-[hsl(var(--ui-text-strong))]">今日のインサイト</h2>
                                <p className="text-[0.75rem] text-[hsl(var(--ui-text-muted))] mt-0.5">Overview</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--ui-brand-soft))] text-[hsl(var(--ui-brand))] flex items-center justify-center">
                                <Sparkles size={16} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] p-3">
                                <p className="text-[0.6875rem] font-bold tracking-wide text-[hsl(var(--ui-text-muted))]">開始</p>
                                <p className="text-[0.95rem] font-semibold mt-1">{firstTask ? minutesToTimeString(firstTask.startMinutes) : "--:--"}</p>
                            </div>
                            <div className="rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] p-3">
                                <p className="text-[0.6875rem] font-bold tracking-wide text-[hsl(var(--ui-text-muted))]">終了</p>
                                <p className="text-[0.95rem] font-semibold mt-1">{lastTask ? minutesToTimeString(lastTask.startMinutes + lastTask.durationMinutes) : "--:--"}</p>
                            </div>
                            <div className="rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] p-3">
                                <p className="text-[0.6875rem] font-bold tracking-wide text-[hsl(var(--ui-text-muted))]">すき間</p>
                                <p className="text-[0.95rem] font-semibold mt-1">{Math.floor(totalBreakMinutes / 60)}h {totalBreakMinutes % 60}m</p>
                            </div>
                            <div className="rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] p-3">
                                <p className="text-[0.6875rem] font-bold tracking-wide text-[hsl(var(--ui-text-muted))]">同期済み</p>
                                <p className="text-[0.95rem] font-semibold mt-1">{syncedCount}/{localTasksForDate.length || 0}</p>
                            </div>
                        </div>
                    </section>

                    <section className="premium-card p-7 sm:p-8">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-[0.9375rem] font-bold tracking-tight text-[hsl(var(--ui-text-strong))]">次にやること</h2>
                                <p className="text-[0.75rem] text-[hsl(var(--ui-text-muted))] mt-0.5">{isCurrentDateToday ? "Now to next" : "Top 3 tasks"}</p>
                            </div>
                            <CalendarClock size={16} className="text-[hsl(var(--ui-text-muted))]" />
                        </div>
                        {upcomingTasks.length === 0 ? (
                            <p className="text-[0.8125rem] text-[hsl(var(--ui-text-muted))] bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] rounded-xl p-3">
                                これ以降の予定はありません。Todo または Planner で次のタスクを追加しましょう。
                            </p>
                        ) : (
                            <ul className="space-y-2.5">
                                {upcomingTasks.map((task) => (
                                    <li key={task.id} className="rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] p-3.5">
                                        <p className="text-[0.875rem] font-semibold leading-none flex items-center gap-2">
                                            <span>{task.icon ?? "📝"}</span>
                                            <span className="truncate">{task.label}</span>
                                        </p>
                                        <p className="text-[0.75rem] text-[hsl(var(--ui-text-muted))] mt-2">
                                            {minutesToTimeString(task.startMinutes)} - {minutesToTimeString(task.startMinutes + task.durationMinutes)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="premium-card p-7 sm:p-8 flex flex-col">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-[0.9375rem] font-bold tracking-tight text-[hsl(var(--ui-text-strong))]">今日の振り返り</h2>
                                <p className="text-[0.75rem] text-[hsl(var(--ui-text-muted))] mt-0.5">Daily Notes</p>
                            </div>
                            <span className="text-[0.6875rem] font-semibold text-[hsl(var(--ui-text-muted))]">
                                {diary.length} chars
                            </span>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-2">
                            {reflectionPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => onDiaryChange(`${diary}${diary ? "\n" : ""}- ${prompt}: `)}
                                    className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] px-3 py-1.5 text-[0.75rem] font-semibold text-[hsl(var(--ui-text-soft))] hover:text-[hsl(var(--ui-brand))] hover:border-[hsl(var(--ui-brand)/0.4)] transition-colors"
                                >
                                    <Link2 size={11} />
                                    {prompt}
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={diary}
                            onChange={(e) => onDiaryChange(e.target.value)}
                            placeholder="自由に書き込んでください..."
                            className="
                                flex-1 w-full min-h-[180px]
                                bg-[hsl(var(--ui-surface-soft))] dark:bg-[hsl(var(--ui-surface-secondary))]
                                border border-[hsl(var(--ui-line))]
                                p-3.5 text-[0.875rem] font-medium
                                text-[hsl(var(--ui-text-strong))]
                                placeholder:text-[hsl(var(--ui-text-muted))]
                                resize-none rounded-xl
                                focus:outline-none focus:ring-[3px] focus:ring-[hsl(var(--ui-brand)/0.2)]
                                focus:border-[hsl(var(--ui-brand))]
                                transition-all leading-relaxed
                            "
                        />
                        <p className="text-[0.6875rem] text-[hsl(var(--ui-text-muted))] mt-2">
                            ヒント: 箇条書きで「事実 / 気づき / 次アクション」を1行ずつ書くと、翌日の計画に繋げやすくなります。
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
