import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TenantSelector } from '../common/TenantSelector';
import { ThemeSelector } from '../ThemeSelector';
import { ModeToggle } from '../ModeToggle';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-surface">
            <div className="flex h-full flex-1">
                {/* Sidebar */}
                <aside className="flex w-64 flex-col gap-y-6 border-r border-surface-border bg-surface p-4 font-display">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCvVEipwgB4VxjAKAjICvMaPfVlBgwSNfu76jlBEV2e_kVQeCtlehsSR0CopvXnqGebf5hAMTrXmkiY8oLhFwqJw0wduQEZTjTpCC8A-0VCO05A7FH1TOU4-MG68PFwoqUgnrfBaNBZX_gVOGEuwgucFngK_oQtRAbA4slNpcDpAWpvZYBzNLd9viUUO__OuNBtOGVniQWmJc4B_kgKkn-AH1_pCnkUC4S8vrhcl9oPibkUjGHx_MY8-SDlw0vQ0A69boWBT3Lr4dY")' }}
                        />
                        <div className="flex flex-col">
                            <h1 className="text-text-primary text-base font-medium leading-normal">Data Integrator</h1>
                            <p className="text-text-secondary text-sm font-normal leading-normal">Workspace</p>
                        </div>
                    </div>

                    {/* Tenant Selector */}
                    <div className="px-1">
                        <TenantSelector />
                    </div>

                    {/* Theme Selector */}
                    <div className="px-1">
                        <ThemeSelector />
                    </div>

                    {/* Mode Toggle */}
                    <div className="px-1">
                        <ModeToggle />
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        <Link
                            to="/"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isActive('/') ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-surface-elevated'}`}
                        >
                            <span className={`material-symbols-outlined ${isActive('/') ? 'text-primary' : 'text-text-primary'}`}>link</span>
                            <p className={`text-sm font-medium leading-normal ${isActive('/') ? '' : 'text-text-primary'}`}>Data Connectors</p>
                        </Link>
                        <Link
                            to="/endpoints"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isActive('/endpoints') ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-surface-elevated'}`}
                        >
                            <span className={`material-symbols-outlined ${isActive('/endpoints') ? 'text-primary' : 'text-text-primary'}`}>webhook</span>
                            <p className={`text-sm font-medium leading-normal ${isActive('/endpoints') ? '' : 'text-text-primary'}`}>Endpoints</p>
                        </Link>
                        <Link
                            to="/tenants"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isActive('/tenants') ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-surface-elevated'}`}
                        >
                            <span className={`material-symbols-outlined ${isActive('/tenants') ? 'text-primary' : 'text-text-primary'}`}>group</span>
                            <p className={`text-sm font-medium leading-normal ${isActive('/tenants') ? '' : 'text-text-primary'}`}>Tenants</p>
                        </Link>
                        <Link
                            to="/explorer"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isActive('/explorer') ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-surface-elevated'}`}
                        >
                            <span className={`material-symbols-outlined ${isActive('/explorer') ? 'text-primary' : 'text-text-primary'}`}>table_view</span>
                            <p className={`text-sm font-medium leading-normal ${isActive('/explorer') ? '' : 'text-text-primary'}`}>Data Explorer</p>
                        </Link>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-surface-elevated" href="#">
                            <span className="material-symbols-outlined text-text-primary">history</span>
                            <p className="text-text-primary text-sm font-medium leading-normal">Logs</p>
                        </a>
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-surface-elevated" href="#">
                            <span className="material-symbols-outlined text-text-primary">settings</span>
                            <p className="text-text-primary text-sm font-medium leading-normal">Settings</p>
                        </a>
                    </nav>

                    {/* Help */}
                    <div className="mt-auto flex flex-col gap-1">
                        <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-surface-elevated" href="#">
                            <span className="material-symbols-outlined text-text-primary">help</span>
                            <p className="text-text-primary text-sm font-medium leading-normal">Help</p>
                        </a>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="flex max-w-7xl flex-col gap-6 mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
