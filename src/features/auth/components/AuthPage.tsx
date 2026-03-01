"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { CalendarClock, RefreshCw, ShieldCheck, Sparkles } from "lucide-react"

interface AuthPageProps {
    onAuthStart?: () => void
}

const FEATURES = [
    {
        icon: <CalendarClock size={18} strokeWidth={1.8} />,
        title: "カレンダー連携",
        description: "Google予定を取り込み、1日の流れを一画面で確認できます。",
    },
    {
        icon: <RefreshCw size={18} strokeWidth={1.8} />,
        title: "同期の一元化",
        description: "予定変更は反映が速く、管理の手間を減らせます。",
    },
    {
        icon: <ShieldCheck size={18} strokeWidth={1.8} />,
        title: "安全な接続",
        description: "予定管理に必要な範囲のみ権限を利用します。",
    },
]

export function AuthPage({ onAuthStart }: AuthPageProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)
        onAuthStart?.()
        await signIn("google", { callbackUrl: "/" })
    }

    return (
        <div className="app-surface min-h-screen">
            <header className="sticky top-0 z-30 w-full border-b border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface))/0.92] backdrop-blur-md">
                <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border border-[hsl(var(--ui-line-strong))] bg-[hsl(var(--ui-surface-soft))] flex items-center justify-center text-[hsl(var(--ui-text-soft))]">
                            <Sparkles size={15} />
                        </div>
                        <div className="leading-tight">
                            <p className="font-display text-[0.95rem] font-semibold text-[hsl(var(--ui-text-strong))]">Daily Planner</p>
                            <p className="text-[0.6875rem] text-[hsl(var(--ui-text-muted))]">Sign in</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <section className="premium-card p-7 sm:p-9 lg:col-span-7">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--ui-text-soft))]">
                            <Sparkles size={13} className="text-[hsl(var(--ui-brand))]" />
                            Daily Planner
                        </div>

                        <h1 className="mt-5 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[hsl(var(--ui-text-strong))] leading-tight">
                            予定を整えると、
                            <br />
                            1日が静かに回りはじめる
                        </h1>
                        <p className="mt-4 text-[0.98rem] leading-7 text-[hsl(var(--ui-text-muted))]">
                            Planner画面と同じトーンで、予定の見える化と実行に集中できます。
                            最初にGoogleアカウントを接続して、あなたのカレンダーを読み込みましょう。
                        </p>

                        <div className="mt-7 grid gap-2.5">
                            {FEATURES.map((feature, index) => (
                                <article
                                    key={feature.title}
                                    className="flex items-start gap-3 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] px-4 py-3.5"
                                    style={{ animation: `fade-in-up 0.3s ease-out ${index * 80}ms both` }}
                                >
                                    <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--ui-line-strong))] text-[hsl(var(--ui-text-soft))]">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[hsl(var(--ui-text-strong))]">{feature.title}</p>
                                        <p className="mt-1 text-xs leading-5 text-[hsl(var(--ui-text-muted))]">{feature.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="premium-card p-7 sm:p-9 lg:col-span-5">
                        <p className="text-xs font-semibold tracking-wide text-[hsl(var(--ui-text-muted))] uppercase">Sign in</p>
                        <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight text-[hsl(var(--ui-text-strong))]">
                            Googleで続行
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-[hsl(var(--ui-text-muted))]">
                            ログイン後、同期とテンプレート設定をすぐに始められます。
                        </p>

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="primary-button w-full h-12 rounded-xl text-sm font-semibold mt-7"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                    認証中...
                                </>
                            ) : (
                                <>
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[hsl(var(--ui-line-strong))] bg-[hsl(var(--ui-surface))]">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </span>
                                    Googleでログイン
                                </>
                            )}
                        </button>

                        <p className="mt-4 text-xs leading-5 text-[hsl(var(--ui-text-muted))]">
                            Googleカレンダーの予定管理に必要な権限のみを利用します。
                        </p>

                        <footer className="mt-7 pt-5 border-t border-[hsl(var(--ui-line))] text-xs text-[hsl(var(--ui-text-muted))]">
                            <div className="flex items-center gap-4">
                                <Link href="/privacy-policy" className="hover:text-[hsl(var(--ui-text-strong))] transition-colors">Privacy</Link>
                                <Link href="/terms" className="hover:text-[hsl(var(--ui-text-strong))] transition-colors">Terms</Link>
                            </div>
                            <p className="mt-2">&copy; {new Date().getFullYear()} Daily Planner</p>
                        </footer>
                    </section>
                </div>
            </main>
        </div>
    )
}
