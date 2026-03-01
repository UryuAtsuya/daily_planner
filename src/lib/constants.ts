/**
 * タスクの優先度
 */
export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

/**
 * タスクのステータス
 */
export const TASK_STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    DONE: 'done',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

/**
 * 習慣の頻度
 */
export const HABIT_FREQUENCY = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
} as const;

export type HabitFrequency = (typeof HABIT_FREQUENCY)[keyof typeof HABIT_FREQUENCY];

/**
 * 優先度の表示名
 */
export const PRIORITY_LABELS: Record<Priority, string> = {
    low: '低',
    medium: '中',
    high: '高',
};

/**
 * 優先度の色
 */
export const PRIORITY_COLORS: Record<Priority, string> = {
    low: 'bg-secondary/40 text-secondary-foreground',
    medium: 'bg-accent/40 text-accent-foreground',
    high: 'bg-destructive/35 text-destructive-foreground',
};

/**
 * ステータスの表示名
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
    todo: '未着手',
    in_progress: '進行中',
    done: '完了',
};

/**
 * ポモドーロタイマーのデフォルト設定（分）
 */
export const POMODORO_DEFAULTS = {
    FOCUS_TIME: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
    SESSIONS_UNTIL_LONG_BREAK: 4,
} as const;
