/**
 * サブタスク型 (Internal to Subtasks feature)
 */
export type Subtask = {
    id: string;
    title: string;
    completed: boolean;
};

/**
 * サブタスク管理におけるメインタスク型
 */
export type Task = {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    due_date?: string;
    subtasks?: Subtask[];
    created_at: string;
    updated_at: string;
};

export type CreateTaskInput = Omit<
    Task,
    'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export type UpdateTaskInput = Partial<CreateTaskInput>;
