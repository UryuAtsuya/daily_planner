"use client"

import * as React from "react"
import {
  CATEGORIES,
  COLOR_PALETTE_8,
  Task,
  getCategoryById,
  minutesToTimeString,
  timeStringToMinutes,
} from "../types"
import { cn } from "@/lib/utils"

interface TaskFormProps {
  task?: Task
  dateKey?: string
  onSave: (data: Omit<Task, "id">) => void
  onCancel: () => void
  isSaving?: boolean
}

export function TaskForm({ task, dateKey, onSave, onCancel, isSaving = false }: TaskFormProps) {
  const [label, setLabel] = React.useState(task?.label ?? "")
  const [description, setDescription] = React.useState(task?.description ?? "")
  const [nextAction, setNextAction] = React.useState(task?.nextAction ?? "")
  const [itemsToBring, setItemsToBring] = React.useState(task?.itemsToBring ?? "")
  const [startTime, setStartTime] = React.useState(
    task ? minutesToTimeString(task.startMinutes) : "09:00"
  )
  const [endTime, setEndTime] = React.useState(
    task ? minutesToTimeString(task.startMinutes + task.durationMinutes) : "10:00"
  )

  const defaultCategory = task?.categoryId ?? "work"
  const [categoryId, setCategoryId] = React.useState(defaultCategory)
  const category = getCategoryById(categoryId)
  const [color, setColor] = React.useState(task?.color ?? category?.color ?? COLOR_PALETTE_8[0])
  const [icon, setIcon] = React.useState(task?.icon ?? category?.icon ?? "📝")

  React.useEffect(() => {
    const selectedCategory = getCategoryById(categoryId)
    if (!selectedCategory) return

    if (!task) {
      setColor(selectedCategory.color)
      setIcon(selectedCategory.icon)
    }
  }, [categoryId, task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const startMinutes = timeStringToMinutes(startTime)
    let endMinutes = timeStringToMinutes(endTime)

    if (endMinutes <= startMinutes) {
      endMinutes += 1440
    }

    const durationMinutes = Math.max(5, endMinutes - startMinutes)

    onSave({
      label: label.trim() || "Untitled",
      description: description.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
      itemsToBring: itemsToBring.trim() || undefined,
      startMinutes,
      durationMinutes,
      color,
      icon,
      categoryId,
      dateKey: task?.dateKey ?? dateKey ?? "",
      syncStatus: task?.syncStatus ?? "local",
      googleEventId: task?.googleEventId,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={isSaving} className="space-y-5">
        <div>
          <label className="block text-sm font-body font-medium ui-text-soft mb-2">
            予定名
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="例: ミーティング"
            className="w-full px-4 py-3 font-body ui-form-control disabled:opacity-60"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-body font-medium ui-text-soft mb-2">カテゴリー</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 ui-form-control"
            >
              {CATEGORIES.map((categoryItem) => (
                <option key={categoryItem.id} value={categoryItem.id}>
                  {categoryItem.icon} {categoryItem.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-body font-medium ui-text-soft mb-2">アイコン</label>
            <input
              type="text"
              maxLength={2}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-3 ui-form-control"
              placeholder="例: 💡"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-body font-medium ui-text-soft mb-2">
            詳細メモ
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="この予定の背景や持ち物、ゴールを記録"
            rows={4}
            className="w-full px-4 py-3 font-body ui-form-control resize-y min-h-[6.875rem] disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-body font-medium ui-text-soft mb-2">
            次のアクション
          </label>
          <input
            type="text"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="例: 16:00までに資料の骨子を確定する"
            className="w-full px-4 py-3 font-body ui-form-control disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-body font-medium ui-text-soft mb-2">
            持ち物
          </label>
          <input
            type="text"
            value={itemsToBring}
            onChange={(e) => setItemsToBring(e.target.value)}
            placeholder="例: ノートPC, 充電器, メモ帳"
            className="w-full px-4 py-3 font-body ui-form-control disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-body font-medium ui-text-soft mb-2">
              開始時刻（5分単位）
            </label>
            <input
              type="time"
              step={300}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 ui-form-control"
            />
          </div>
          <div>
            <label className="block text-sm font-body font-medium ui-text-soft mb-2">
              終了時刻（5分単位）
            </label>
            <input
              type="time"
              step={300}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 ui-form-control"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-body font-medium ui-text-soft mb-2">
            カラー（8色）
          </label>
          <div className="rounded-xl ui-surface-soft p-3">
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PALETTE_8.map((paletteColor) => (
                <button
                  key={paletteColor}
                  type="button"
                  onClick={() => setColor(paletteColor)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-all duration-150 border",
                    color === paletteColor
                      ? "border-zinc-800 dark:border-zinc-100 scale-110"
                      : "border-white/40 hover:scale-105"
                  )}
                  style={{ backgroundColor: paletteColor }}
                  aria-label={`色 ${paletteColor}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-body font-medium ui-text-muted hover:bg-[hsl(var(--secondary))] rounded-full transition disabled:opacity-60"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={cn(
              "px-5 py-2.5 text-sm font-body font-bold text-white rounded-full european-shadow transition disabled:opacity-60",
              task
                ? "bg-[hsl(var(--ui-brand))] hover:bg-[hsl(var(--ui-brand-strong))]"
                : "bg-red-500 hover:bg-red-600 shadow-red-200"
            )}
          >
            {isSaving ? "処理中..." : task ? "保存" : "追加"}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
