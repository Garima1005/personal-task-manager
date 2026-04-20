import { useState, useEffect } from "react";

interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
}

interface TaskFormProps {
    task?: Task | null;
    onSubmit: (data: { title: string; description: string }) => void;
    onClose: () => void;
}

export default function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
    const [title, setTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
        }
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Please enter a task title");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ title: title.trim(), description: "" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-gray-900 rounded-lg border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
                {task ? "Edit Task" : "Create New Task"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title Input */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title"
                        className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-gray-100 placeholder-gray-500 outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"
                        disabled={isSubmitting}
                    />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        )}
                        {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
                    </button>
                </div>
            </form>
        </div>
    );
}
