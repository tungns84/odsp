import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SavedEndpointsView } from './SavedEndpointsView';
import { AdHocQueryView } from './AdHocQueryView';
import { Database, Zap } from 'lucide-react';

type ExplorerMode = 'endpoints' | 'adhoc';

export function DataExplorer() {
    const [searchParams, setSearchParams] = useSearchParams();
    const modeParam = searchParams.get('mode') as ExplorerMode || 'endpoints';
    const [activeMode, setActiveMode] = useState<ExplorerMode>(modeParam);

    const handleModeChange = (mode: ExplorerMode) => {
        setActiveMode(mode);
        setSearchParams({ mode });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Data Explorer</h1>
                <p className="text-text-tertiary">Query and analyze data from your data sources</p>
            </div>

            {/* Mode Tabs */}
            <div className="border-b border-surface-border">
                <nav className="flex gap-4">
                    <button
                        onClick={() => handleModeChange('endpoints')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeMode === 'endpoints'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-surface-border'
                            }`}
                    >
                        <Database size={18} />
                        <span className="font-medium">Saved Endpoints</span>
                    </button>
                    <button
                        onClick={() => handleModeChange('adhoc')}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeMode === 'adhoc'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-surface-border'
                            }`}
                    >
                        <Zap size={18} />
                        <span className="font-medium">Ad-Hoc Query</span>
                    </button>
                </nav>
            </div>

            {/* Mode Content */}
            <div>
                {activeMode === 'endpoints' && <SavedEndpointsView />}
                {activeMode === 'adhoc' && <AdHocQueryView />}
            </div>
        </div>
    );
}
