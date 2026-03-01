'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateTaskInput, Task } from './types';

const taskSchema = z.object({
    title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
    description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
    priority: z.enum(['low', 'medium', 'high']),
    due_date: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

type TaskFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (task: CreateTaskInput) => void;
    initialData?: Task;
    mode?: 'create' | 'edit';
};

export function TaskForm({ open, onOpenChange, onSubmit, initialData, mode = 'create' }: TaskFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: initialData
            ? {
                title: initialData.title,
                description: initialData.description || '',
                priority: initialData.priority,
                due_date: initialData.due_date || '',
            }
            : {
                title: '',
                description: '',
                priority: 'medium',
                due_date: '',
            },
    });

    const priority = watch('priority');

    const handleFormSubmit = (data: TaskFormData) => {
        const taskData: CreateTaskInput = {
            title: data.title,
            description: data.description || undefined,
            priority: data.priority,
            status: initialData?.status || 'todo',
            due_date: data.due_date || undefined,
        };

        onSubmit(taskData);
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[31.25rem]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? '新しいタスク' : 'タスクを編集'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'タスクの詳細を入力してください'
                            : 'タスクの内容を変更してください'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">タイトル *</Label>
                        <Input
                            id="title"
                            placeholder="例: プロジェクト資料を作成"
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive-foreground">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">説明</Label>
                        <Textarea
                            id="description"
                            placeholder="タスクの詳細を入力（任意）"
                            rows={3}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive-foreground">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">優先度</Label>
                            <Select
                                value={priority}
                                onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">低</SelectItem>
                                    <SelectItem value="medium">中</SelectItem>
                                    <SelectItem value="high">高</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="due_date">期限</Label>
                            <Input
                                id="due_date"
                                type="date"
                                {...register('due_date')}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            キャンセル
                        </Button>
                        <Button type="submit">
                            {mode === 'create' ? '作成' : '更新'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
