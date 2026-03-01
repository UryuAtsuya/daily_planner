export type AccentTheme = "mono" | "blue" | "green" | "amber" | "rose" | "violet"

export interface AccentThemeOption {
  id: AccentTheme
  label: string
  swatch: string
}

export const ACCENT_THEME_OPTIONS: AccentThemeOption[] = [
  { id: "mono", label: "Mono", swatch: "hsl(220 15% 28%)" },
  { id: "blue", label: "Blue", swatch: "hsl(210 78% 50%)" },
  { id: "green", label: "Green", swatch: "hsl(145 52% 42%)" },
  { id: "amber", label: "Amber", swatch: "hsl(36 92% 52%)" },
  { id: "rose", label: "Rose", swatch: "hsl(345 78% 56%)" },
  { id: "violet", label: "Violet", swatch: "hsl(262 78% 60%)" },
]

export function isAccentTheme(value: string | null): value is AccentTheme {
  return ACCENT_THEME_OPTIONS.some((option) => option.id === value)
}
