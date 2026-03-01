"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Task, minutesToTimeString, snapToFiveMinutes } from "../types"
import { ChartAppearance, DEFAULT_CHART_APPEARANCE } from "../constants/chartAppearance"

interface DailyPieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  tasks: Task[]
  selectedTaskId?: string
  onTaskClick?: (task: Task) => void
  onTaskAdjust?: (taskId: string, startMinutes: number, durationMinutes: number) => void
  appearance?: ChartAppearance
}

const SIZE = 240
const CENTER = SIZE / 2
const RADIUS = 90

function timeToDegree(minutes: number) {
  return (minutes / 1440) * 360
}

function angleToMinutes(angle: number) {
  const normalized = (angle + 360) % 360
  return snapToFiveMinutes(Math.round((normalized / 360) * 1440))
}

function pointToClockAngle(x: number, y: number) {
  const radians = Math.atan2(y - CENTER, x - CENTER)
  const degrees = (radians * 180) / Math.PI + 90
  return (degrees + 360) % 360
}

function createSectorPath(startMin: number, durationMin: number) {
  const startAngle = timeToDegree(startMin) - 90
  const endAngle = timeToDegree(startMin + durationMin) - 90

  const x1 = CENTER + RADIUS * Math.cos((startAngle * Math.PI) / 180)
  const y1 = CENTER + RADIUS * Math.sin((startAngle * Math.PI) / 180)
  const x2 = CENTER + RADIUS * Math.cos((endAngle * Math.PI) / 180)
  const y2 = CENTER + RADIUS * Math.sin((endAngle * Math.PI) / 180)

  const largeArcFlag = durationMin > 720 ? 1 : 0

  return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
}

function nowAngle() {
  const now = new Date()
  return timeToDegree(now.getHours() * 60 + now.getMinutes()) - 90
}

export function DailyPieChart({
  className,
  tasks,
  selectedTaskId,
  onTaskClick,
  onTaskAdjust,
  appearance = DEFAULT_CHART_APPEARANCE,
  ...props
}: DailyPieChartProps) {
  const svgRef = React.useRef<SVGSVGElement | null>(null)
  const [currentNowAngle, setCurrentNowAngle] = React.useState(nowAngle())
  const [dragState, setDragState] = React.useState<{
    taskId: string
    edge: "start" | "end"
    baseStart: number
    baseDuration: number
  } | null>(null)

  React.useEffect(() => {
    const interval = window.setInterval(() => setCurrentNowAngle(nowAngle()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const selectedTask = React.useMemo(
    () => tasks.find((task) => task.id === selectedTaskId),
    [tasks, selectedTaskId]
  )

  const handlePointerMove = React.useCallback(
    (event: PointerEvent) => {
      if (!dragState || !onTaskAdjust || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * SIZE
      const y = ((event.clientY - rect.top) / rect.height) * SIZE
      const minutes = angleToMinutes(pointToClockAngle(x, y))

      const end = dragState.baseStart + dragState.baseDuration
      if (dragState.edge === "start") {
        const safeStart = Math.min(minutes, end - 5)
        const snappedStart = Math.max(0, Math.min(1435, safeStart))
        onTaskAdjust(dragState.taskId, snappedStart, end - snappedStart)
      } else {
        const safeEnd = Math.max(minutes, dragState.baseStart + 5)
        const snappedEnd = Math.max(dragState.baseStart + 5, Math.min(1440, safeEnd))
        onTaskAdjust(dragState.taskId, dragState.baseStart, snappedEnd - dragState.baseStart)
      }
    },
    [dragState, onTaskAdjust]
  )

  const stopDrag = React.useCallback(() => setDragState(null), [])

  React.useEffect(() => {
    if (!dragState) return

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", stopDrag)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", stopDrag)
    }
  }, [dragState, handlePointerMove, stopDrag])

  const startDrag = (task: Task, edge: "start" | "end") => {
    setDragState({
      taskId: task.id,
      edge,
      baseStart: task.startMinutes,
      baseDuration: task.durationMinutes,
    })
  }

  const nowX = CENTER + (RADIUS + 16) * Math.cos((currentNowAngle * Math.PI) / 180)
  const nowY = CENTER + (RADIUS + 16) * Math.sin((currentNowAngle * Math.PI) / 180)

  return (
    <div className={cn("relative aspect-square w-[17.5rem] max-w-[78vw] sm:w-[20rem] xl:w-[21.25rem] mx-auto", className)} {...props}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-full"
        style={{ animation: "fade-in-scale 0.6s ease-out both" }}
      >
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke={appearance.ringColor} strokeWidth="1" />

        {tasks.map((task) => {
          const isSelected = task.id === selectedTaskId
          const startAngle = timeToDegree(task.startMinutes) - 90
          const endAngle = timeToDegree(task.startMinutes + task.durationMinutes) - 90
          const startX = CENTER + RADIUS * Math.cos((startAngle * Math.PI) / 180)
          const startY = CENTER + RADIUS * Math.sin((startAngle * Math.PI) / 180)
          const endX = CENTER + RADIUS * Math.cos((endAngle * Math.PI) / 180)
          const endY = CENTER + RADIUS * Math.sin((endAngle * Math.PI) / 180)

          return (
            <g key={task.id}>
              <path
                d={createSectorPath(task.startMinutes, task.durationMinutes)}
                fill={task.color}
                stroke={appearance.segmentStrokeColor}
                strokeWidth={isSelected ? "3" : "2"}
                className={cn(
                  "transition-all duration-200 origin-center",
                  onTaskClick && "cursor-pointer",
                  isSelected ? "opacity-100" : "opacity-90 hover:opacity-100"
                )}
                style={{
                  filter: isSelected ? "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))" : undefined,
                  transformOrigin: `${CENTER}px ${CENTER}px`,
                  transform: isSelected ? "scale(1.025)" : undefined,
                }}
                onClick={() => onTaskClick?.(task)}
              >
                <title>{`${task.label} ${minutesToTimeString(task.startMinutes)}-${minutesToTimeString(task.startMinutes + task.durationMinutes)}`}</title>
              </path>

              {isSelected && onTaskAdjust && (
                <>
                  <circle
                    cx={startX}
                    cy={startY}
                    r={6}
                    fill="white"
                    stroke="hsl(var(--ui-brand))"
                    strokeWidth="2"
                    className="cursor-ew-resize"
                    onPointerDown={() => startDrag(task, "start")}
                  />
                  <circle
                    cx={endX}
                    cy={endY}
                    r={6}
                    fill="white"
                    stroke="hsl(var(--ui-brand))"
                    strokeWidth="2"
                    className="cursor-ew-resize"
                    onPointerDown={() => startDrag(task, "end")}
                  />
                </>
              )}
            </g>
          )
        })}

        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24 - 90
          const innerPoint = RADIUS - 8
          const outerPoint = RADIUS
          const labelPoint = RADIUS + 20

          const x1 = CENTER + innerPoint * Math.cos((angle * Math.PI) / 180)
          const y1 = CENTER + innerPoint * Math.sin((angle * Math.PI) / 180)
          const x2 = CENTER + outerPoint * Math.cos((angle * Math.PI) / 180)
          const y2 = CENTER + outerPoint * Math.sin((angle * Math.PI) / 180)
          const textX = CENTER + labelPoint * Math.cos((angle * Math.PI) / 180)
          const textY = CENTER + labelPoint * Math.sin((angle * Math.PI) / 180)

          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={appearance.tickColor} strokeWidth="1" />
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill={appearance.labelColor}
                fontWeight="500"
                className="font-body"
              >
                {i}
              </text>
            </g>
          )
        })}

        <line x1={CENTER} y1={CENTER} x2={nowX} y2={nowY} stroke="hsl(var(--ui-brand))" strokeWidth="2" />
        <circle cx={nowX} cy={nowY} r="4" fill="hsl(var(--ui-brand))" />
      </svg>

      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[hsl(var(--ui-surface))] rounded-full border-2 shadow-sm"
        style={{ borderColor: appearance.centerBorderColor }}
      />

      {selectedTask && (
        <p className="mt-4 text-center text-xs text-[hsl(var(--ui-text-muted))] font-body">
          選択中の端点をドラッグして 5分単位で調整
        </p>
      )}
    </div>
  )
}
