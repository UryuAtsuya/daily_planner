"use client"

export type ViewType = "planner" | "todo" | "focus"

interface MainNavigationProps {
    currentView: ViewType
    onViewChange: (view: ViewType) => void
}

const NAV_ITEMS = [
    {
        id: "planner" as ViewType,
        label: "Planner",
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
        ),
    },
    {
        id: "todo" as ViewType,
        label: "Todo",
        icon: (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
            </svg>
        ),
    },
    {
        id: "focus" as ViewType,
        label: "Focus",
        icon: (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
    },
]

export function MainNavigation({ currentView, onViewChange }: MainNavigationProps) {
    return (
        <nav role="tablist" aria-label="メインナビゲーション" className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface))] p-1">
            {NAV_ITEMS.map((item) => {
                const isActive = currentView === item.id
                return (
                    <button
                        key={item.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onViewChange(item.id)}
                        className={isActive
                            ? "inline-flex items-center justify-center gap-1.5 h-9 min-w-[98px] px-3 rounded-lg border border-[hsl(var(--ui-brand-ring))] bg-[hsl(var(--ui-brand-soft))] text-[hsl(var(--ui-brand))] text-[0.8125rem] font-semibold"
                            : "inline-flex items-center justify-center gap-1.5 h-9 min-w-[98px] px-3 rounded-lg border border-transparent bg-transparent text-[hsl(var(--ui-text-muted))] text-[0.8125rem] font-semibold hover:bg-[hsl(var(--ui-surface-soft))] hover:text-[hsl(var(--ui-text-strong))] transition-colors"
                        }
                    >
                        <span className={isActive ? "opacity-90" : "opacity-60"}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}
