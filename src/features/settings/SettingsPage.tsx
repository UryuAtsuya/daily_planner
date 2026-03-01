"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { ArrowLeft, LogOut, Plus, Trash2, GripVertical } from "lucide-react"
import { AdSlot } from "@/features/monetization/components/AdSlot"
import {
    TaskTemplate,
    TASK_TEMPLATES,
    CATEGORIES,
    minutesToTimeString,
    timeStringToMinutes,
    Task,
} from "@/features/day-view/types"
import { ACCENT_THEME_OPTIONS, AccentTheme } from "@/lib/accentTheme"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SettingsPageProps {
    userName?: string | null
    userImage?: string | null
    userEmail?: string | null
    accentTheme: AccentTheme
    onAccentThemeChange: (theme: AccentTheme) => void
    templates: TaskTemplate[]
    onSaveTemplates: (templates: TaskTemplate[]) => void
    onClose: () => void
}

type EditingTask = Omit<Task, "id" | "dateKey">

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
    return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const EMPTY_TASK: EditingTask = {
    label: "",
    startMinutes: 540,
    durationMinutes: 60,
    color: "hsl(212 80% 58%)",
    categoryId: "work",
    icon: "💼",
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SettingsPage({
    userName,
    userImage,
    userEmail,
    accentTheme,
    onAccentThemeChange,
    templates,
    onSaveTemplates,
    onClose,
}: SettingsPageProps) {
    // --- Template editing state ---
    const [localTemplates, setLocalTemplates] = useState<TaskTemplate[]>(
        () => JSON.parse(JSON.stringify(templates))
    )
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
        templates[0]?.id ?? null
    )
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const selectedTemplate = localTemplates.find(
        (t) => t.id === selectedTemplateId
    )

    /* ---- Template CRUD ---- */
    const updateTemplate = (id: string, patch: Partial<TaskTemplate>) => {
        setLocalTemplates((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
        )
        setHasUnsavedChanges(true)
    }

    const addTemplate = () => {
        const newTemplate: TaskTemplate = {
            id: generateId(),
            name: "新しいテンプレート",
            tasks: [{ ...EMPTY_TASK }],
        }
        setLocalTemplates((prev) => [...prev, newTemplate])
        setSelectedTemplateId(newTemplate.id)
        setHasUnsavedChanges(true)
    }

    const deleteTemplate = (id: string) => {
        setLocalTemplates((prev) => {
            const next = prev.filter((t) => t.id !== id)
            if (selectedTemplateId === id) {
                setSelectedTemplateId(next[0]?.id ?? null)
            }
            return next
        })
        setHasUnsavedChanges(true)
    }

    const resetTemplates = () => {
        setLocalTemplates(JSON.parse(JSON.stringify(TASK_TEMPLATES)))
        setSelectedTemplateId(TASK_TEMPLATES[0]?.id ?? null)
        setHasUnsavedChanges(true)
    }

    /* ---- Task CRUD within template ---- */
    const addTask = () => {
        if (!selectedTemplate) return
        updateTemplate(selectedTemplate.id, {
            tasks: [...selectedTemplate.tasks, { ...EMPTY_TASK }],
        })
    }

    const updateTask = (index: number, patch: Partial<EditingTask>) => {
        if (!selectedTemplate) return
        const tasks = [...selectedTemplate.tasks]
        tasks[index] = { ...tasks[index], ...patch }
        updateTemplate(selectedTemplate.id, { tasks })
    }

    const deleteTask = (index: number) => {
        if (!selectedTemplate) return
        const tasks = selectedTemplate.tasks.filter((_, i) => i !== index)
        updateTemplate(selectedTemplate.id, { tasks })
    }

    /* ---- Save & Close ---- */
    const handleSave = () => {
        onSaveTemplates(localTemplates)
        setHasUnsavedChanges(false)
    }

    const handleClose = () => {
        if (hasUnsavedChanges) {
            onSaveTemplates(localTemplates)
        }
        onClose()
    }

    const handleLogout = () => {
        sessionStorage.removeItem("hasShownWelcome")
        signOut()
    }

    return (
        <div className="min-h-screen app-surface">
            {/* ─── Header ─── */}
            <header className="sticky top-0 z-40 backdrop-blur-md bg-[hsl(var(--ui-surface))]/90 border-b border-[hsl(var(--ui-line))]">
                <div className="max-w-3xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] text-sm font-semibold text-[hsl(var(--ui-text-strong))] hover:bg-[hsl(var(--ui-surface-secondary))] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    >
                        <ArrowLeft size={16} className="inline mr-2" />
                        戻る
                    </button>
                    <h1 className="text-xl font-display font-bold text-[hsl(var(--ui-text-strong))] tracking-tight">
                        設定
                    </h1>
                    <div className="w-20" /> {/* spacer */}
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
                {/* ─── Section 1: Profile ─── */}
                <section
                    className="premium-card p-6 sm:p-8"
                    style={{ animation: "fade-in-up 0.4s ease-out both" }}
                >
                    <h2 className="text-lg font-display font-bold text-[hsl(var(--ui-text-strong))] mb-5">
                        外観
                    </h2>
                    <div className="flex flex-wrap gap-2.5 mb-7">
                        {ACCENT_THEME_OPTIONS.map((option) => {
                            const isActive = accentTheme === option.id
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => onAccentThemeChange(option.id)}
                                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 border transition-colors ${isActive
                                        ? "bg-[hsl(var(--ui-surface-secondary))] border-[hsl(var(--ui-line-strong))] text-[hsl(var(--ui-text-strong))]"
                                        : "bg-[hsl(var(--ui-surface-soft))] border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-muted))] hover:text-[hsl(var(--ui-text-strong))]"
                                        }`}
                                    aria-pressed={isActive}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: option.swatch }}
                                    />
                                    <span className="text-xs font-semibold">{option.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <h2 className="text-lg font-display font-bold text-[hsl(var(--ui-text-strong))] mb-6 flex items-center gap-2">
                        プロフィール
                    </h2>
                    <div className="flex items-center gap-5">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={userName ?? "User"}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-full border border-[hsl(var(--ui-line))]"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] flex items-center justify-center text-2xl text-[hsl(var(--ui-text-muted))]">
                                👤
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xl font-display font-bold text-[hsl(var(--ui-text-strong))] truncate leading-tight">
                                {userName ?? "Guest"}
                            </p>
                            {userEmail && (
                                <p className="text-sm font-body text-[hsl(var(--ui-text-muted))] truncate mt-1 font-medium">
                                    {userEmail}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── Section 2: Template Settings ─── */}
                <section
                    className="premium-card p-6 sm:p-8"
                    style={{ animation: "fade-in-up 0.4s ease-out 0.1s both" }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-display font-bold text-[hsl(var(--ui-text-strong))]">
                            テンプレート設定
                        </h2>
                        <div className="flex items-center gap-3">
                            {hasUnsavedChanges && (
                                <button
                                    onClick={handleSave}
                                    className="primary-button px-5 py-2 text-xs font-semibold"
                                >
                                    保存
                                </button>
                            )}
                            <button
                                onClick={resetTemplates}
                                className="text-xs font-semibold text-[hsl(var(--ui-text-muted))] hover:text-[hsl(var(--ui-text-strong))] transition-colors"
                            >
                                初期値に戻す
                            </button>
                        </div>
                    </div>

                    {/* Template tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {localTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplateId(template.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedTemplateId === template.id
                                    ? "bg-[hsl(var(--ui-surface-secondary))] text-[hsl(var(--ui-text-strong))] ring-1 ring-[hsl(var(--ui-line-strong))]"
                                    : "bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-soft))] hover:bg-[hsl(var(--ui-surface))] hover:text-[hsl(var(--ui-text-strong))]"
                                    }`}
                            >
                                {template.name}
                            </button>
                        ))}
                        <button
                            onClick={addTemplate}
                            className="px-4 py-2 rounded-xl text-sm font-semibold border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] text-[hsl(var(--ui-text-soft))] hover:bg-[hsl(var(--ui-surface))] hover:text-[hsl(var(--ui-text-strong))] transition-colors flex items-center gap-1.5"
                        >
                            <Plus size={16} />
                            追加
                        </button>
                    </div>

                    {/* Template editor */}
                    {selectedTemplate ? (
                        <div className="space-y-4">
                            {/* Template name */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={selectedTemplate.name}
                                    onChange={(e) =>
                                        updateTemplate(selectedTemplate.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    className="ui-form-control flex-1 px-4 py-2.5 rounded-xl text-base font-semibold placeholder-[hsl(var(--ui-text-muted))]"
                                    placeholder="テンプレート名"
                                />
                                <button
                                    onClick={() => deleteTemplate(selectedTemplate.id)}
                                    className="p-2.5 rounded-xl bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-muted))] hover:text-[hsl(var(--ui-red))] hover:bg-[hsl(var(--ui-surface))] transition-colors"
                                    aria-label="テンプレートを削除"
                                    title="テンプレートを削除"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Task list */}
                            <div className="space-y-3">
                                {selectedTemplate.tasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] flex-wrap sm:flex-nowrap"
                                        style={{
                                            animation: `stagger-in 0.3s ease-out ${index * 40}ms both`,
                                        }}
                                    >
                                        <div className="pt-2.5 text-[hsl(var(--ui-text-muted))] cursor-grab opacity-50 hover:opacity-100 transition-opacity">
                                            <GripVertical size={16} />
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            {/* Category + Label */}
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={task.categoryId ?? "work"}
                                                    onChange={(e) => {
                                                        const cat = CATEGORIES.find(
                                                            (c) => c.id === e.target.value
                                                        )
                                                        if (cat) {
                                                            updateTask(index, {
                                                                categoryId: cat.id,
                                                                icon: cat.icon,
                                                                color: cat.color,
                                                            })
                                                        }
                                                    }}
                                                    className="ui-form-control w-32 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                                                >
                                                    {CATEGORIES.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.icon} {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={task.label}
                                                    onChange={(e) =>
                                                        updateTask(index, { label: e.target.value })
                                                    }
                                                    className="ui-form-control flex-1 px-3 py-2 rounded-lg text-sm font-semibold placeholder-[hsl(var(--ui-text-muted))]"
                                                    placeholder="予定名"
                                                />
                                            </div>

                                            {/* Time range */}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={minutesToTimeString(task.startMinutes)}
                                                    onChange={(e) =>
                                                        updateTask(index, {
                                                            startMinutes: timeStringToMinutes(e.target.value),
                                                        })
                                                    }
                                                    className="ui-form-control px-3 py-1.5 rounded-lg text-xs font-medium"
                                                />
                                                <span className="text-[hsl(var(--ui-text-muted))] font-bold">−</span>
                                                <input
                                                    type="time"
                                                    value={minutesToTimeString(
                                                        task.startMinutes + task.durationMinutes
                                                    )}
                                                    onChange={(e) => {
                                                        const end = timeStringToMinutes(e.target.value)
                                                        const dur = end - task.startMinutes
                                                        if (dur > 0) {
                                                            updateTask(index, { durationMinutes: dur })
                                                        }
                                                    }}
                                                    className="ui-form-control px-3 py-1.5 rounded-lg text-xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteTask(index)}
                                            className="p-2 rounded-lg text-[hsl(var(--ui-text-muted))] hover:text-[hsl(var(--ui-red))] hover:bg-[hsl(var(--ui-surface))] transition-colors mt-0.5"
                                            aria-label="この予定を削除"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add task */}
                            <button
                                onClick={addTask}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] text-sm font-semibold text-[hsl(var(--ui-text-muted))] hover:border-[hsl(var(--ui-line-strong))] hover:text-[hsl(var(--ui-text-strong))] hover:bg-[hsl(var(--ui-surface))] transition-colors mt-2"
                            >
                                <Plus size={16} />
                                予定を追加
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-[hsl(var(--ui-text-muted))] font-medium text-sm">
                            テンプレートを選択、または新規追加してください
                        </div>
                    )}
                </section>

                {/* ─── Section 3: Logout ─── */}
                <section
                    className="premium-card p-6 sm:p-8"
                    style={{ animation: "fade-in-up 0.4s ease-out 0.2s both" }}
                >
                    <h2 className="text-lg font-display font-bold text-[hsl(var(--ui-text-strong))] mb-5 flex items-center gap-2">
                        アカウント
                    </h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-5 py-4 rounded-xl text-base font-semibold text-[hsl(var(--ui-red))] bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] hover:bg-[hsl(var(--ui-surface))] transition-colors"
                    >
                        <LogOut size={18} />
                        ログアウト
                    </button>
                </section>

                {/* ─── Section 4: Support & Legal ─── */}
                <section
                    className="premium-card p-6 sm:p-8 space-y-5"
                    style={{ animation: "fade-in-up 0.4s ease-out 0.3s both" }}
                >
                    <h2 className="text-lg font-display font-bold text-[hsl(var(--ui-text-strong))] flex items-center gap-2">
                        サポートとポリシー
                    </h2>

                    <AdSlot slot="settings-bottom-001" className="w-full" format="horizontal" />

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/privacy-policy"
                            className="px-4 py-2 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] text-xs font-semibold text-[hsl(var(--ui-text-muted))] hover:bg-[hsl(var(--ui-surface))] hover:text-[hsl(var(--ui-text-strong))] transition-colors"
                        >
                            プライバシーポリシー
                        </Link>
                        <Link
                            href="/terms"
                            className="px-4 py-2 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] text-xs font-semibold text-[hsl(var(--ui-text-muted))] hover:bg-[hsl(var(--ui-surface))] hover:text-[hsl(var(--ui-text-strong))] transition-colors"
                        >
                            利用規約
                        </Link>
                        <Link
                            href="/contact"
                            className="px-4 py-2 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] text-xs font-semibold text-[hsl(var(--ui-text-muted))] hover:bg-[hsl(var(--ui-surface))] hover:text-[hsl(var(--ui-text-strong))] transition-colors"
                        >
                            お問い合わせ
                        </Link>
                    </div>
                </section>

                {/* Spacer for safe area */}
                <div className="h-10" />
            </div>
        </div>
    )
}
