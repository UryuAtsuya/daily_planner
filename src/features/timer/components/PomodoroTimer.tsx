'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

const RING_SIZE = 320;
const STROKE = 14;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTimer() {
  const {
    status,
    timeLeft,
    currentSession,
    isWorkTime,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    sessions,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    setUserId,
    tick,
  } = usePomodoroStore();
  const { data: session } = useSession();

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [status, tick]);

  useEffect(() => {
    const nextUserId = session?.user?.email ?? session?.user?.name ?? null;
    setUserId(nextUserId);
  }, [session?.user?.email, session?.user?.name, setUserId]);

  const totalSeconds = isWorkTime
    ? workDuration * 60
    : (currentSession % sessionsUntilLongBreak === 0 && currentSession > 0)
      ? longBreakDuration * 60
      : shortBreakDuration * 60;

  const progress = Math.max(0, Math.min(1, (totalSeconds - timeLeft) / totalSeconds));
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((session) => session.started_at.split('T')[0] === today);
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
  const totalMinutesDone = sessions.reduce((sum, session) => sum + session.duration, 0);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12 animate-fade-in-scale">
      <div className="premium-card p-6 sm:p-10">
        <header className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--ui-text-muted))]">Focus Mode</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[hsl(var(--ui-text-strong))] tracking-tight">Pomodoro Timer</h2>
          <p className="text-sm font-body text-[hsl(var(--ui-text-muted))]">
            {isWorkTime ? '今は集中時間。ひとつずつ着実に進める。' : '休憩時間。呼吸を整えて次に備える。'}
          </p>
        </header>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE, maxWidth: '82vw', maxHeight: '82vw' }}>
            <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="h-full w-full">
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--ui-line))"
                strokeWidth={STROKE}
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={isWorkTime ? 'hsl(var(--ui-brand))' : 'hsl(145 38% 45%)'}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                className="transition-[stroke-dashoffset] duration-500"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--ui-text-muted))] dark:text-[#E2E8F0]/50 mb-2">
                {isWorkTime ? 'Focus Session' : 'Break Session'}
              </div>
              <div className="font-display font-bold text-[hsl(var(--ui-text-strong))] dark:text-[#E2E8F0] leading-none tracking-tight" style={{ fontSize: 'clamp(48px, 9vw, 84px)' }}>
                {formatTime(timeLeft)}
              </div>
              <div className="mt-4 text-sm font-medium text-[hsl(var(--ui-text-soft))] bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] px-3 py-1 rounded-lg">
                Session {currentSession + 1}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 sm:gap-6">
            <button
              onClick={resetTimer}
              disabled={status === 'idle' && timeLeft === totalSeconds}
              className="h-12 w-12 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] inline-flex items-center justify-center text-[hsl(var(--ui-text-muted))] hover:bg-[hsl(var(--ui-surface))] hover:text-[hsl(var(--ui-text-strong))] transition-colors disabled:opacity-50"
              aria-label="Reset"
            >
              <RotateCcw size={18} />
            </button>

            {status === 'running' ? (
              <button
                onClick={pauseTimer}
                className="h-14 px-10 rounded-xl bg-[hsl(var(--ui-surface-soft))] border border-[hsl(var(--ui-line))] text-[hsl(var(--ui-text-strong))] text-base font-semibold hover:bg-[hsl(var(--ui-surface))] transition-colors"
              >
                <span className="inline-flex items-center gap-2"><Pause size={20} /> Pause</span>
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="primary-button h-14 px-10 rounded-xl text-base font-semibold"
              >
                <span className="inline-flex items-center gap-2"><Play size={20} /> Start</span>
              </button>
            )}

            <button
              onClick={skipSession}
              className="h-12 w-12 rounded-xl border border-[hsl(var(--ui-line))] bg-[hsl(var(--ui-surface-soft))] inline-flex items-center justify-center text-[hsl(var(--ui-text-muted))] hover:bg-[hsl(var(--ui-surface))] hover:text-[hsl(var(--ui-text-strong))] transition-colors"
              aria-label="Skip"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div >

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <article className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--ui-text-muted))]">Today&apos;s Focus</div>
          <div className="mt-3 text-4xl font-display font-bold text-[hsl(var(--ui-text-strong))]">{todayMinutes}m</div>
          <div className="mt-1.5 text-sm font-medium text-[hsl(var(--ui-text-soft))]">{todaySessions.length} sessions</div>
        </article>

        <article className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--ui-text-muted))]">Completed</div>
          <div className="mt-3 text-4xl font-display font-bold text-[hsl(var(--ui-text-strong))]">{sessions.length}</div>
          <div className="mt-1.5 text-sm font-medium text-[hsl(var(--ui-text-soft))]">total sessions</div>
        </article>

        <article className="premium-card p-6 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--ui-text-muted))]">Total Time</div>
          <div className="mt-3 text-4xl font-display font-bold text-[hsl(var(--ui-text-strong))]">{totalMinutesDone}m</div>
          <div className="mt-1.5 text-sm font-medium text-[hsl(var(--ui-text-soft))]">all-time focus</div>
        </article>
      </div>
    </section >
  );
}
