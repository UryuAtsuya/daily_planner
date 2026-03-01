import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

type TaskStore = {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    // Actions
    addTask: (task: CreateTaskInput) => void;
    updateTask: (id: string, updates: UpdateTaskInput) => void;
    deleteTask: (id: string) => void;
    toggleTaskStatus: (id: string) => void;
    getTodayTasks: () => Task[];
    getTasksByStatus: (status: Task['status']) => Task[];
    getOverdueTasks: () => Task[];
};

// モックデータ
const mockTasks: Task[] = [
    {
        id: '1',
        user_id: 'mock-user',
        title: 'プロジェクト資料を作成',
        description: '来週のミーティング用の資料を準備する',
        priority: 'high',
        status: 'todo',
        due_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        user_id: 'mock-user',
        title: 'メールの返信',
        description: '取引先からのメールに返信する',
        priority: 'medium',
        status: 'todo',
        due_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: mockTasks,
    isLoading: false,
    error: null,

    addTask: (taskInput: CreateTaskInput) => {
        const newTask: Task = {
            id: Date.now().toString(),
            user_id: 'mock-user',
            ...taskInput,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        set((state) => ({
            tasks: [...state.tasks, newTask],
        }));
    },

    updateTask: (id: string, updates: UpdateTaskInput) => {
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id
                    ? { ...task, ...updates, updated_at: new Date().toISOString() }
                    : task
            ),
        }));
    },

    deleteTask: (id: string) => {
        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
        }));
    },

    toggleTaskStatus: (id: string) => {
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id
                    ? {
                        ...task,
                        status: task.status === 'done' ? 'todo' : 'done',
                        updated_at: new Date().toISOString(),
                    }
                    : task
            ),
        }));
    },

    getTodayTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter((task) => task.due_date === today);
    },

    getTasksByStatus: (status: Task['status']) => {
        return get().tasks.filter((task) => task.status === status);
    },

    getOverdueTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return get().tasks.filter((task) => {
            if (!task.due_date || task.status === 'done') return false;
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        });
    },
}));
