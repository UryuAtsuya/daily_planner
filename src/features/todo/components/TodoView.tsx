"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodoItem {
    id: string
    text: string
    completed: boolean
}

const TODO_STORAGE_KEY = "daily-planner-todos"

const DEFAULT_TODOS: TodoItem[] = [
    { id: "seed-1", text: "メールチェック", completed: true },
    { id: "seed-2", text: "タスクの整理", completed: false },
]

export function TodoView() {
    const [todos, setTodos] = useState<TodoItem[]>(() => {
        if (typeof window === "undefined") return DEFAULT_TODOS
        const raw = localStorage.getItem(TODO_STORAGE_KEY)
        if (!raw) return DEFAULT_TODOS
        try {
            const parsed = JSON.parse(raw) as TodoItem[]
            return Array.isArray(parsed) ? parsed : DEFAULT_TODOS
        } catch {
            return DEFAULT_TODOS
        }
    })
    const [newTodo, setNewTodo] = useState("")

    useEffect(() => {
        localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
    }, [todos])

    const completedCount = useMemo(() => todos.filter((todo) => todo.completed).length, [todos])
    const completionRate = todos.length ? Math.round((completedCount / todos.length) * 100) : 0
    const ringProgress = todos.length ? (completedCount / todos.length) * 94.25 : 0

    const toggleTodo = (id: string) => {
        setTodos((prev) =>
            prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
        )
    }

    const deleteTodo = (id: string) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id))
    }

    const addTodo = (e: FormEvent) => {
        e.preventDefault()
        const text = newTodo.trim()
        if (!text) return
        setTodos((prev) => [...prev, { id: `${Date.now()}`, text, completed: false }])
        setNewTodo("")
    }

    return (
        <div className="max-w-4xl mx-auto w-full">
            <section className="premium-card p-8 sm:p-10 min-h-[640px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-[2rem] sm:text-[2.25rem] font-bold tracking-tight leading-tight">
                            <span>Todo</span>
                        </h1>
                        <p className="text-[0.95rem] font-medium text-[hsl(var(--ui-text-muted))] mt-2">
                            {completedCount}/{todos.length} 完了
                        </p>
                    </div>
                    <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--ui-line))" strokeWidth="3" />
                            <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                stroke="hsl(var(--ui-green))"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${ringProgress} 94.25`}
                                className="transition-all duration-500"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[0.75rem] font-semibold text-[hsl(var(--ui-text-soft))]">
                            {completionRate}%
                        </span>
                    </div>
                </div>

                <ul className="flex-1 overflow-y-auto space-y-2.5 mb-6">
                    {todos.map((todo) => (
                        <li key={todo.id}>
                            <div
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                                    todo.completed
                                        ? "opacity-50 bg-[hsl(var(--ui-surface-soft))]"
                                        : "hover:bg-[hsl(var(--ui-surface-soft))] dark:hover:bg-[hsl(var(--ui-surface-secondary))]"
                                )}
                            >
                                <button
                                    onClick={() => toggleTodo(todo.id)}
                                    className="shrink-0 transition-all duration-200 hover:scale-110"
                                    aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
                                >
                                    {todo.completed ? (
                                        <CheckCircle2 size={20} className="text-[hsl(var(--ui-green))]" strokeWidth={2} />
                                    ) : (
                                        <Circle size={20} className="text-[hsl(var(--ui-line-strong))] hover:text-[hsl(var(--ui-brand))]" strokeWidth={2} />
                                    )}
                                </button>
                                <span className={cn("flex-1 text-[1rem] font-medium", todo.completed && "line-through")}>
                                    {todo.text}
                                </span>
                                <button
                                    onClick={() => deleteTodo(todo.id)}
                                    className="shrink-0 p-2 rounded-md text-[hsl(var(--ui-text-muted))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    aria-label="削除"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <form onSubmit={addTodo} className="relative">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="アッ！と思いついたらここへ..."
                        className="
                            w-full pl-5 pr-14 py-4
                            bg-[hsl(var(--ui-surface-soft))] dark:bg-[hsl(var(--ui-surface-secondary))]
                            border border-[hsl(var(--ui-line))]
                            rounded-xl text-[0.95rem] font-medium
                            text-[hsl(var(--ui-text-strong))]
                            placeholder:text-[hsl(var(--ui-text-muted))]
                            focus:outline-none focus:ring-[3px] focus:ring-[hsl(var(--ui-brand)/0.2)]
                            focus:border-[hsl(var(--ui-brand))]
                            transition-all
                        "
                    />
                    <button
                        type="submit"
                        disabled={!newTodo.trim()}
                        className="
                            absolute right-2 top-1/2 -translate-y-1/2
                            w-10 h-10 flex items-center justify-center
                            bg-[hsl(var(--ui-brand))] text-white rounded-lg
                            disabled:opacity-0 disabled:pointer-events-none
                            transition-colors duration-150
                        "
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                </form>
            </section>
        </div>
    )
}
