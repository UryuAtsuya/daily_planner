"use client"

import * as React from "react"
import { Task, isGoogleTask, minutesToTimeString } from "../types"
import { Pencil, Trash2, Cloud, Check } from "lucide-react"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onSyncToGoogle?: (task: Task) => void
  onSelect?: (task: Task) => void
  selectedTaskId?: string
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onSyncToGoogle,
  onSelect,
  selectedTaskId,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 ui-text-muted">
        <p className="font-display text-lg">予定がありません</p>
        <p className="text-sm mt-2 font-body">「予定を追加」から作成してください</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2.5">
      {tasks.map((task, index) => {
        const isGoogle = isGoogleTask(task)
        const isSynced = !isGoogle && task.syncStatus === "synced"
        const isSelected = selectedTaskId === task.id
        return (
          <li
            key={task.id}
            className={`flex items-center gap-4 p-5 rounded-2xl transition-all cursor-pointer shadow-sm ${isGoogle
              ? "bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/50"
              : "bg-stone-50/60 dark:bg-[#12121A]/80 border border-stone-100 dark:border-[#2D2D3B]"
              } ${isSelected ? "ring-2 ring-amber-200/60 dark:ring-[#FBBF24]/60 bg-white dark:bg-[#1E1E2A]" : "hover:bg-white dark:hover:bg-[#1E1E2A] hover:shadow-md hover:-translate-y-0.5"}`}
            style={{
              animation: `stagger-in 0.4s ease-out ${index * 60}ms both`,
            }}
            onClick={() => onSelect?.(task)}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-[hsl(var(--ui-surface))] transition-shadow ${isSelected ? "animate-pulse-soft" : ""
                }`}
              style={{ backgroundColor: task.color }}
            />

            <div className="flex-1 min-w-0">
              <p className="font-body font-bold text-stone-700 dark:text-[#E2E8F0] truncate flex items-center gap-2 leading-none text-sm sm:text-base">
                <span className="inline-flex w-5 justify-center text-lg leading-none">{task.icon ?? "📝"}</span>
                <span>{task.label}</span>
                {isGoogle && (
                  <span className="text-[0.625rem] text-[#4285f4] font-medium px-2 py-0.5 bg-blue-50/50 border border-blue-100 rounded-full leading-none tracking-wide">
                    GOOGLE
                  </span>
                )}
                {isSynced && (
                  <span className="text-[0.625rem] text-[hsl(var(--ui-success))] font-medium inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--ui-success-soft))] border border-[hsl(var(--ui-success))/20] rounded-full leading-none tracking-wide">
                    <Check size={10} className="shrink-0 stroke-[3]" />
                    SYNCED
                  </span>
                )}
              </p>
              <p className="text-xs sm:text-sm text-stone-400 font-body mt-1.5 font-bold tracking-wider">
                {minutesToTimeString(task.startMinutes)} - {minutesToTimeString(task.startMinutes + task.durationMinutes)}
              </p>
            </div>

            <div className="flex gap-1.5 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
              {!isGoogle && onSyncToGoogle && !isSynced && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSyncToGoogle(task)
                  }}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-stone-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-[#818CF8]/30 transition-colors"
                  aria-label={`${task.label}をGoogleに同期`}
                  title="Googleカレンダーに同期"
                >
                  <Cloud size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(task)
                }}
                className="inline-flex items-center justify-center p-2 rounded-xl text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-[#FBBF24]/30 transition-colors"
                aria-label={`${task.label}を編集`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
                className="inline-flex items-center justify-center p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                aria-label={`${task.label}を削除`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
