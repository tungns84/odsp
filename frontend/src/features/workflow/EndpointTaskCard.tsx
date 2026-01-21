import { memo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, ExternalLink } from 'lucide-react';
import type { WorkflowTask } from '../../types/workflowTypes';

interface Props {
    task: WorkflowTask;
    onApprove: () => Promise<void>;
    isApproving?: boolean;
}

/**
 * Card component for displaying an endpoint publishing task.
 * Workflow-specific renderer for "Approve Publication" tasks.
 */
export const EndpointTaskCard = memo<Props>(function EndpointTaskCard({
    task,
    onApprove,
    isApproving = false
}) {
    const endpointId = (task.variables.endpointId as string) || 'Unknown';
    const tenantId = (task.variables.tenantId as string) || 'Unknown';
    const createTime = task.createTime
        ? new Date(task.createTime).toLocaleString()
        : 'Unknown';

    return (
        <div className="bg-surface border border-surface-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-medium text-text-primary flex items-center gap-2">
                        {task.name}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-text-secondary">
                        <p className="flex items-center gap-2">
                            <span className="font-medium">Endpoint:</span>
                            <Link
                                to={`/data-endpoints/${endpointId}`}
                                className="text-primary hover:underline flex items-center gap-1"
                            >
                                {endpointId}
                                <ExternalLink size={12} />
                            </Link>
                        </p>
                        <p>
                            <span className="font-medium">Tenant:</span>{' '}
                            <span className="px-2 py-0.5 bg-surface-elevated rounded text-xs">
                                {tenantId}
                            </span>
                        </p>
                        <p className="flex items-center gap-1 text-xs text-text-secondary/70">
                            <Clock size={12} />
                            Created: {createTime}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onApprove}
                    disabled={isApproving}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2
                        ${isApproving
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white'
                        }
                    `}
                >
                    <CheckCircle size={18} />
                    {isApproving ? 'Approving…' : 'Approve'}
                </button>
            </div>
        </div>
    );
});
