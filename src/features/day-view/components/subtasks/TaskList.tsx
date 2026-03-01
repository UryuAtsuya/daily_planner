'use client';

import { useState } from 'react';
import { Task, CreateTaskInput } from './types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { useTaskStore } from './stores/taskStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export function TaskList() {
    const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTaskStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>();
    const [activeTab, setActiveTab] = useState('all');

    const todoTasks = tasks.filter((task) => task.status === 'todo');
    const inProgressTasks = tasks.filter((task) => task.status === 'in_progress');
    const doneTasks = tasks.filter((task) => task.status === 'done');

    const handleAddTask = (taskData: CreateTaskInput) => {
        addTask(taskData);
    };

    const handleEditTask = (taskData: CreateTaskInput) => {
        if (editingTask) {
            updateTask(editingTask.id, taskData);
            setEditingTask(undefined);
        }
    };

    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTask(undefined);
    };

    const renderTasks = (taskList: Task[]) => {
        if (taskList.length === 0) {
            return (
                <div className="text-center py-12 text-muted-foreground">
                    <p>タスクがありません</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {taskList.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTaskStatus}
                        onEdit={handleOpenEdit}
                        onDelete={deleteTask}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">タスク一覧</h2>
                    <p className="text-muted-foreground mt-1">
                        全{tasks.length}件のタスク（完了: {doneTasks.length}件）
                    </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    新しいタスク
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">すべて ({tasks.length})</TabsTrigger>
                    <TabsTrigger value="todo">未着手 ({todoTasks.length})</TabsTrigger>
                    <TabsTrigger value="in_progress">進行中 ({inProgressTasks.length})</TabsTrigger>
                    <TabsTrigger value="done">完了 ({doneTasks.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    {renderTasks(tasks)}
                </TabsContent>

                <TabsContent value="todo" className="mt-6">
                    {renderTasks(todoTasks)}
                </TabsContent>

                <TabsContent value="in_progress" className="mt-6">
                    {renderTasks(inProgressTasks)}
                </TabsContent>

                <TabsContent value="done" className="mt-6">
                    {renderTasks(doneTasks)}
                </TabsContent>
            </Tabs>

            <TaskForm
                open={isFormOpen}
                onOpenChange={handleCloseForm}
                onSubmit={editingTask ? handleEditTask : handleAddTask}
                initialData={editingTask}
                mode={editingTask ? 'edit' : 'create'}
            />
        </div>
    );
}
