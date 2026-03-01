"use client"

export function AuthLoading() {
    return (
        <div className="app-surface flex min-h-screen flex-col items-center justify-center">
            <div className="space-y-6 text-center animate-fade-in-up">
                {/* Minimal Spinner */}
                <div className="relative mx-auto h-24 w-24">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background Track */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-[hsl(var(--ui-line))] opacity-50"
                        />
                        {/* Animated Arc */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            className="animate-spin-slow text-[hsl(var(--ui-brand))]"
                            style={{ strokeDashoffset: 200 }}
                        />
                    </svg>
                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center text-[hsl(var(--ui-brand))]">
                        <svg className="h-8 w-8 animate-pulse-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Text content */}
                <div className="space-y-2">
                    <h2 className="font-display text-xl font-semibold text-[hsl(var(--ui-text-strong))]">
                        カレンダーを準備中...
                    </h2>
                    <p className="font-body text-sm text-[hsl(var(--ui-text-muted))]">
                        Googleアカウントと安全に接続しています
                    </p>
                </div>
            </div>
        </div>
    )
}
