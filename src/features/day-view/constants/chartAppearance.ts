export interface ChartAppearance {
  ringColor: string
  tickColor: string
  labelColor: string
  segmentStrokeColor: string
  centerBorderColor: string
}

export const DEFAULT_CHART_APPEARANCE: ChartAppearance = {
  ringColor: "hsl(var(--ui-line))",
  tickColor: "hsl(var(--ui-text-muted))",
  labelColor: "hsl(var(--ui-text-muted))",
  segmentStrokeColor: "hsl(var(--ui-surface))",
  centerBorderColor: "hsl(var(--ui-line-strong))",
}

export const CHART_PRESETS: Array<{ name: string; appearance: ChartAppearance }> = [
  {
    name: "Minimal",
    appearance: DEFAULT_CHART_APPEARANCE,
  },
  {
    name: "Indigo",
    appearance: {
      ringColor: "hsl(var(--ui-line))",
      tickColor: "hsl(var(--ui-brand-soft))",
      labelColor: "hsl(var(--ui-brand))",
      segmentStrokeColor: "hsl(var(--ui-surface))",
      centerBorderColor: "hsl(var(--ui-brand))",
    },
  },
  {
    name: "Slate",
    appearance: {
      ringColor: "hsl(var(--ui-line))",
      tickColor: "hsl(215, 16%, 47%)",
      labelColor: "hsl(215, 25%, 27%)",
      segmentStrokeColor: "hsl(var(--ui-surface))",
      centerBorderColor: "hsl(215, 16%, 47%)",
    },
  },
]
