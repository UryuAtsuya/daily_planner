"use client"

import { useCallback, useEffect, useState } from "react"
import { DEFAULT_TASKS, Task, getDateKey } from "../types"

const STORAGE_KEY = "daily-planner-tasks-v2"

type CreateTaskInput = Omit<Task, "id"> & { id?: string }

function normalizeTask(task: Task): Task {
  return {
    ...task,
    dateKey: task.dateKey ?? getDateKey(new Date()),
    icon: task.icon ?? undefined,
  }
}

function parseStoredTasks(stored: string | null): Task[] {
  if (!stored) return DEFAULT_TASKS

  try {
    const parsed = JSON.parse(stored) as Task[]
    if (!Array.isArray(parsed)) return DEFAULT_TASKS
    return parsed.map(normalizeTask)
  } catch {
    return DEFAULT_TASKS
  }
}

export function useTaskStore() {
  const [isLoaded] = useState(() => typeof window !== "undefined")
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return []
    return parseStoredTasks(localStorage.getItem(STORAGE_KEY))
  })

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks, isLoaded])

  const addTask = useCallback((task: CreateTaskInput) => {
    const newTask: Task = {
      ...task,
      id: task.id ?? crypto.randomUUID(),
      dateKey: task.dateKey ?? getDateKey(new Date()),
    }

    setTasks((prev) => [...prev, newTask].sort((a, b) => a.startMinutes - b.startMinutes))
  }, [])

  const addTasks = useCallback((nextTasks: CreateTaskInput[]) => {
    setTasks((prev) => {
      const normalized = nextTasks.map((task) => ({
        ...task,
        id: task.id ?? crypto.randomUUID(),
        dateKey: task.dateKey ?? getDateKey(new Date()),
      })) as Task[]
      return [...prev, ...normalized].sort((a, b) => a.startMinutes - b.startMinutes)
    })
  }, [])

  const replaceTasksForDate = useCallback((dateKey: string, nextTasks: CreateTaskInput[]) => {
    setTasks((prev) => {
      const rest = prev.filter((task) => task.dateKey !== dateKey)
      const normalized = nextTasks.map((task) => ({
        ...task,
        id: task.id ?? crypto.randomUUID(),
        dateKey,
      })) as Task[]
      return [...rest, ...normalized].sort((a, b) => a.startMinutes - b.startMinutes)
    })
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, "id">>) => {
    setTasks((prev) =>
      prev
        .map((task) => (task.id === id ? { ...task, ...updates } : task))
        .sort((a, b) => a.startMinutes - b.startMinutes)
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const resetTasks = useCallback(() => {
    setTasks(DEFAULT_TASKS)
  }, [])

  return {
    tasks,
    isLoaded,
    addTask,
    addTasks,
    replaceTasksForDate,
    updateTask,
    deleteTask,
    resetTasks,
  }
}
