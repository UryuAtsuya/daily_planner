"use client"

import * as React from "react"
import { Task } from "../types"
import { TaskForm } from "./TaskForm"
import { X } from "lucide-react"

interface TaskModalProps {
  isOpen: boolean
  task?: Task
  dateKey?: string
  onSave: (data: Omit<Task, "id">) => Promise<boolean> | boolean
  onClose: () => void
}

export function TaskModal({ isOpen, task, dateKey, onSave, onClose }: TaskModalProps) {
  const [isSaving, setIsSaving] = React.useState(false)

  if (!isOpen) return null

  const handleSave = async (data: Omit<Task, "id">) => {
    setIsSaving(true)
    try {
      const saved = await onSave(data)
      if (saved !== false) onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      {/* Premium Sheet */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "640px",
          maxHeight: "92dvh",
          overflowY: "auto",
          background: "var(--modal-bg, #ffffff)",
          borderRadius: "1.75rem 1.75rem 0 0",
          animation: "sheet-up 0.3s cubic-bezier(0.32,0.72,0,1) both",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Gradient top accent line */}
        <div
          style={{
            height: "3px",
            width: "100%",
            borderRadius: "1.75rem 1.75rem 0 0",
            background: "linear-gradient(90deg, hsl(252 95% 65%), hsl(186 90% 50%))",
          }}
        />

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.75rem", paddingBottom: "0.25rem" }}>
          <div style={{ width: "2.25rem", height: "4px", borderRadius: "9999px", background: "rgba(0,0,0,0.15)" }} />
        </div>

        <div style={{ padding: "1rem 1.5rem 2rem" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div>
              <h2
                id="modal-title"
                style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.02em", color: "hsl(222 25% 10%)", margin: 0 }}
              >
                {task ? "予定を編集" : "予定を追加"}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "hsl(220 10% 55%)", marginTop: "0.125rem" }}>
                {task ? "スケジュールを更新" : "新しいスケジュールを作成"}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSaving}
              style={{
                width: "2rem",
                height: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                background: "hsl(220 16% 93%)",
                color: "hsl(220 10% 55%)",
                border: "1px solid hsl(220 14% 88%)",
                cursor: "pointer",
                transition: "all 0.15s",
                opacity: isSaving ? 0.5 : 1,
                flexShrink: 0,
              }}
              aria-label="閉じる"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          <TaskForm
            task={task}
            dateKey={dateKey}
            onSave={handleSave}
            onCancel={onClose}
            isSaving={isSaving}
          />
        </div>
      </section>
    </div>
  )
}
