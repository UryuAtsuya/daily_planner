'use client';

import { Task } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants';
import { formatDateJP, isOverdue } from '@/lib/utils';
import { cn } from '@/lib/utils';

type TaskItemProps = {
    task: Task;
    onToggle: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
};

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
    const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';

    return (
        <div
            className={cn(
                'flex items-center justify-between p-5 border-none rounded-2xl transition-all duration-300 shadow-sm group',
                task.status === 'done'
                    ? 'opacity-60 bg-muted/40 scale-[0.98]'
                    : 'bg-card/95 hover:bg-card hover:shadow-md hover:-translate-y-0.5'
            )}
        >
            <div className="flex items-center space-x-5 flex-1">
                <div
                    onClick={() => onToggle(task.id)}
                    className={cn(
                        "w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all",
                        task.status === 'done'
                            ? "bg-accent border-accent"
                            : "border-accent/40 hover:border-accent"
                    )}
                >
                    {task.status === 'done' && <div className="w-2.5 h-2.5 rounded-full bg-accent-foreground shadow-sm" />}
                </div>

                <div className="flex-1">
                    <p
                        className={cn(
                            'text-lg transition-all duration-300 font-medium',
                            task.status === 'done'
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                        )}
                    >
                        {task.title}
                    </p>

                    {task.description && (
                        <p className="text-sm text-muted-foreground/80 mt-1 italic">
                            {task.description}
                        </p>
                    )}

                    {task.due_date && (
                        <p
                            className={cn(
                                'text-xs mt-2 uppercase tracking-widest font-semibold',
                                overdue ? 'text-destructive' : 'text-primary'
                            )}
                        >
                            {overdue ? 'Past Bloom' : 'Target'}: {formatDateJP(task.due_date)}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <Badge variant="outline" className={cn("rounded-full px-3 py-1 border border-border/50", PRIORITY_COLORS[task.priority])}>
                    {PRIORITY_LABELS[task.priority]}
                </Badge>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-accent/10"
                        onClick={() => onEdit(task)}
                    >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10"
                        onClick={() => onDelete(task.id)}
                    >
                        <Trash2 className="h-4 w-4 text-destructive-foreground" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
