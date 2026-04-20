"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/app/lib/api";
import TaskForm from "@/app/components/TaskForm";

interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">("all");
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        let filtered = tasks;

        if (statusFilter === "true") {
            filtered = filtered.filter((task) => task.completed === true);
        } else if (statusFilter === "false") {
            filtered = filtered.filter((task) => task.completed === false);
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
            );
        }

        setFilteredTasks(filtered);
    }, [tasks, searchQuery, statusFilter]);

    const fetchTasks = async (page = 1, limit = 100, search = "", status = "all") => {
        try {
            setLoading(true);
            const params: any = { page, limit };
            if (search) params.search = search;
            if (status !== "all") params.status = status;

            const response = await api.get("/tasks", { params });
            setTasks(Array.isArray(response.data) ? response.data : response.data.tasks || []);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Failed to fetch tasks");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (taskData: { title: string; description: string }) => {
        try {
            const response = await api.post("/tasks", { title: taskData.title });
            setTasks([...tasks, response.data]);
            toast.success("Task created successfully!");
            setShowTaskForm(false);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Failed to create task");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    const handleUpdateTask = async (taskData: { title: string; description: string }) => {
        if (!editingTask) return;
        try {
            const response = await api.patch(`/tasks/${editingTask.id}`, { title: taskData.title });
            setTasks(tasks.map((task) => (task.id === editingTask.id ? response.data : task)));
            toast.success("Task updated successfully!");
            setEditingTask(null);
            setShowTaskForm(false);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Failed to update task");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter((task) => task.id !== taskId));
            toast.success("Task deleted successfully!");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Failed to delete task");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    const handleToggleStatus = async (taskId: string) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        try {
            const response = await api.patch(`/tasks/${taskId}/toggle`);
            setTasks(tasks.map((t) => (t.id === taskId ? response.data : t)));
            toast.success("Task status updated!");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || "Failed to update task status");
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        toast.success("Logged out successfully!");
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold">TaskFlow</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors text-sm font-medium"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight mb-2">My Tasks</h2>
                    <p className="text-gray-400">Manage and organize all your tasks efficiently</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-gray-100 placeholder-gray-500 outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
                        />
                    </div>

                    <div className="flex gap-4 flex-col sm:flex-row">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as "all" | "true" | "false")}
                            className="flex-1 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-gray-100 outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
                        >
                            <option value="all" className="text-gray-800">All Tasks</option>
                            <option value="false" className="text-gray-800">Pending</option>
                            <option value="true" className="text-gray-800">Completed</option>
                        </select>

                        <button
                            onClick={() => {
                                setEditingTask(null);
                                setShowTaskForm(true);
                            }}
                            className="px-6 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors whitespace-nowrap"
                        >
                            + Add Task
                        </button>
                    </div>
                </div>

                {showTaskForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <TaskForm
                            task={editingTask}
                            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                            onClose={() => {
                                setShowTaskForm(false);
                                setEditingTask(null);
                            }}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            {tasks.length === 0 ? "No tasks yet. Create one to get started!" : "No tasks match your search."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className="p-4 rounded-lg border border-white/10 bg-white/2 hover:bg-white/5 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white line-clamp-2">{task.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            ID: {task?.id}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${task.completed
                                            ? "bg-emerald-500/20 text-emerald-200"
                                            : "bg-amber-500/20 text-amber-200"
                                            }`}
                                    >
                                        {task.completed ? "✓ Done" : "Pending"}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{task.description}</p>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggleStatus(task.id)}
                                        className="flex-1 px-3 py-2 rounded bg-white/4 hover:bg-violet-500/20 border border-white/10 text-xs font-medium text-gray-300 transition-colors"
                                    >
                                        {task.completed ? "Undo" : "Mark Done"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingTask(task);
                                            setShowTaskForm(true);
                                        }}
                                        className="px-3 py-2 rounded bg-white/4 hover:bg-blue-500/20 border border-white/10 text-xs font-medium text-gray-300 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="px-3 py-2 rounded bg-white/4 hover:bg-red-500/20 border border-white/10 text-xs font-medium text-gray-300 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}