"use client"

import { useEffect, useState } from "react"

interface AuthSuccessProps {
  userName?: string
  onComplete: () => void
}

export function AuthSuccess({ userName, onComplete }: AuthSuccessProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 30)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 1500)

    return () => {
      clearInterval(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="app-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="premium-card mx-auto max-w-xl p-8 sm:p-10">
          <div className="text-center" style={{ animation: "fade-in-up 0.35s ease-out both" }}>
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[hsl(var(--ui-brand-ring))] bg-[hsl(var(--ui-brand-soft))] text-[hsl(var(--ui-brand))]">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="font-display text-3xl font-semibold tracking-tight text-[hsl(var(--ui-text-strong))]">
              準備完了
            </h2>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--ui-text-muted))]">
              {userName ? `${userName}さん、ようこそ。` : "ようこそ。"}
              <br />
              ワークスペースを読み込んでいます...
            </p>
          </div>

          <div className="mt-8">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))]">
              <div
                className="h-full rounded-full bg-[hsl(var(--ui-brand))] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--ui-text-muted))]">
              <span>Plannerを起動中</span>
              <span>{progress}%</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ui-text-muted))] opacity-70 animate-gentle-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ui-text-muted))] opacity-70 animate-gentle-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ui-text-muted))] opacity-70 animate-gentle-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
