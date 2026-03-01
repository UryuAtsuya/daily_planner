/**
 * ポモドーロセッション型
 */
export type PomodoroSession = {
    id: string;
    user_id: string;
    task_id?: string;
    duration: number; // 分
    completed: boolean;
    started_at: string;
    ended_at?: string;
};
