import { useState, useCallback } from 'react';
import { PlayCircle, RefreshCw, Inbox } from 'lucide-react';
import { useWorkflowTasks } from '../../hooks/useWorkflowTasks';
import { EndpointTaskCard } from './EndpointTaskCard';

const PROCESS_KEY = 'endpoint-publishing';

/**
 * Workflow-specific inbox for Data Endpoint Publishing tasks.
 * Phase 1: Displays only endpoint-publishing tasks for admin group.
 */
export function EndpointTaskInbox() {
    const { tasks, loading, error, completeTask, refresh } = useWorkflowTasks({
        group: 'admin',
        processKey: PROCESS_KEY,
    });

    const [approvingTaskId, setApprovingTaskId] = useState<string | null>(null);

    const handleApprove = useCallback(async (taskId: string) => {
        setApprovingTaskId(taskId);
        try {
            await completeTask(taskId);
        } catch (err) {
            console.error('Failed to approve task:', err);
            alert('Failed to approve task. Please try again.');
        } finally {
            setApprovingTaskId(null);
        }
    }, [completeTask]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <PlayCircle className="text-blue-500" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            Endpoint Approval
                        </h1>
                        <p className="text-sm text-text-secondary">
                            Approve data endpoints for publication
                        </p>
                    </div>
                </div>

                <button
                    onClick={refresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-surface-border rounded-lg hover:bg-surface transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Error State */}
            {error ? (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg" role="alert">
                    {error}
                </div>
            ) : null}

            {/* Loading State */}
            {loading && tasks.length === 0 ? (
                <div className="bg-surface border border-surface-border rounded-lg p-8 text-center" aria-live="polite">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" aria-hidden="true"></div>
                    <p className="text-text-secondary mt-4">Loading tasks…</p>
                </div>
            ) : null}

            {/* Empty State */}
            {!loading && tasks.length === 0 ? (
                <div className="bg-surface border border-surface-border rounded-lg p-8 text-center">
                    <Inbox className="mx-auto text-text-secondary/50" size={48} aria-hidden="true" />
                    <p className="text-text-secondary mt-4">No pending approval tasks</p>
                    <p className="text-sm text-text-secondary/70 mt-1">
                        Tasks will appear here when users request endpoint publication
                    </p>
                </div>
            ) : null}

            {/* Task List */}
            {tasks.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm text-text-secondary">
                        {tasks.length} pending task{tasks.length !== 1 ? 's' : ''}
                    </p>

                    {tasks.map(task => (
                        <EndpointTaskCard
                            key={task.id}
                            task={task}
                            onApprove={() => handleApprove(task.id)}
                            isApproving={approvingTaskId === task.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
