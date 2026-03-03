import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PomodoroSession } from '../types';
import { POMODORO_DEFAULTS } from '@/lib/constants';

type TimerStatus = 'idle' | 'running' | 'paused' | 'break';

type PomodoroStore = {
    // Timer state
    status: TimerStatus;
    timeLeft: number; // seconds
    currentSession: number;
    isWorkTime: boolean;
    userId: string | null;

    // Settings
    workDuration: number; // minutes
    shortBreakDuration: number; // minutes
    longBreakDuration: number; // minutes
    sessionsUntilLongBreak: number;

    // Sessions history
    sessions: PomodoroSession[];

    // Actions
    setUserId: (userId: string | null) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    skipSession: () => void;
    completeSession: () => void;
    updateSettings: (settings: Partial<{
        workDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        sessionsUntilLongBreak: number;
    }>) => void;
    tick: () => void;
};

export const usePomodoroStore = create<PomodoroStore>()(persist((set, get) => ({
    // Initial state
    status: 'idle',
    timeLeft: POMODORO_DEFAULTS.FOCUS_TIME * 60,
    currentSession: 0,
    isWorkTime: true,
    userId: null,

    // Default settings
    workDuration: POMODORO_DEFAULTS.FOCUS_TIME,
    shortBreakDuration: POMODORO_DEFAULTS.SHORT_BREAK,
    longBreakDuration: POMODORO_DEFAULTS.LONG_BREAK,
    sessionsUntilLongBreak: POMODORO_DEFAULTS.SESSIONS_UNTIL_LONG_BREAK,

    sessions: [],

    setUserId: (userId) => {
        set({ userId });
    },

    startTimer: () => {
        const state = get();
        if (state.status === 'idle') {
            set({ status: 'running' });
        } else if (state.status === 'paused') {
            set({ status: 'running' });
        }
    },

    pauseTimer: () => {
        set({ status: 'paused' });
    },

    resetTimer: () => {
        const state = get();
        const duration = state.isWorkTime ? state.workDuration :
            (state.currentSession % state.sessionsUntilLongBreak === 0 && state.currentSession > 0)
                ? state.longBreakDuration
                : state.shortBreakDuration;

        set({
            status: 'idle',
            timeLeft: duration * 60,
        });
    },

    skipSession: () => {
        const state = get();
        const newIsWorkTime = !state.isWorkTime;
        const newSession = newIsWorkTime ? state.currentSession + 1 : state.currentSession;

        let duration: number;
        if (newIsWorkTime) {
            duration = state.workDuration;
        } else {
            const isLongBreak = newSession % state.sessionsUntilLongBreak === 0 && newSession > 0;
            duration = isLongBreak ? state.longBreakDuration : state.shortBreakDuration;
        }

        set({
            status: 'idle',
            isWorkTime: newIsWorkTime,
            currentSession: newSession,
            timeLeft: duration * 60,
        });
    },

    completeSession: () => {
        const state = get();

        // Save session if it was work time
        if (state.isWorkTime) {
            const now = new Date().toISOString();
            const session: PomodoroSession = {
                id: Date.now().toString(),
                user_id: state.userId ?? 'anonymous',
                duration: state.workDuration,
                completed: true,
                started_at: now,
                ended_at: now,
                task_id: undefined,
            };

            set({ sessions: [...state.sessions, session] });
        }

        // Move to next session
        get().skipSession();
    },

    updateSettings: (settings) => {
        const state = get();
        const newSettings = { ...state, ...settings };

        // Update timeLeft if timer is idle
        if (state.status === 'idle') {
            const duration = state.isWorkTime ? newSettings.workDuration :
                (state.currentSession % newSettings.sessionsUntilLongBreak === 0 && state.currentSession > 0)
                    ? newSettings.longBreakDuration
                    : newSettings.shortBreakDuration;

            set({
                ...settings,
                timeLeft: duration * 60,
            });
        } else {
            set(settings);
        }
    },

    tick: () => {
        const state = get();
        if (state.status !== 'running') return;

        if (state.timeLeft > 0) {
            set({ timeLeft: state.timeLeft - 1 });
        } else {
            // Session completed
            get().completeSession();
        }
    },
}), {
    name: 'daily-planner-pomodoro',
    partialize: (state) => ({
        timeLeft: state.timeLeft,
        currentSession: state.currentSession,
        isWorkTime: state.isWorkTime,
        userId: state.userId,
        workDuration: state.workDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        sessions: state.sessions,
    }),
}));
