import React from 'react';
import { NavLink } from 'react-router-dom';
import { TenantSelector } from '../common/TenantSelector';
import { ThemeSelector } from '../ThemeSelector';
import { ModeToggle } from '../ModeToggle';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const AVATAR_STYLE = {
    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCvVEipwgB4VxjAKAjICvMaPfVlBgwSNfu76jlBEV2e_kVQeCtlehsSR0CopvXnqGebf5hAMTrXmkiY8oLhFwqJw0wduQEZTjTpCC8A-0VCO05A7FH1TOU4-MG68PFwoqUgnrfBaNBZX_gVOGEuwgucFngK_oQtRAbA4slNpcDpAWpvZYBzNLd9viUUO__OuNBtOGVniQWmJc4B_kgKkn-AH1_pCnkUC4S8vrhcl9oPibkUjGHx_MY8-SDlw0vQ0A69boWBT3Lr4dY")'
};

export const Sidebar: React.FC = () => {
    const { isAdmin } = useCurrentUser();

    // Helper for NavLink classes
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive
            ? 'bg-primary/20 text-primary'
            : 'text-text-secondary hover:bg-surface-elevated'
        }`;

    const getIconClass = ({ isActive }: { isActive: boolean }) =>
        `material-symbols-outlined ${isActive ? 'text-primary' : 'text-text-primary'}`;

    const getTextClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium leading-normal ${isActive ? '' : 'text-text-primary'}`;

    return (
        <aside className="flex w-64 flex-col gap-y-6 border-r border-surface-border bg-surface p-4 font-display">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={AVATAR_STYLE}
                />
                <div className="flex flex-col">
                    <h1 className="text-text-primary text-base font-medium leading-normal">Data Integrator</h1>
                    <p className="text-text-secondary text-sm font-normal leading-normal">Workspace</p>
                </div>
            </div>

            {/* Selectors */}
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

            {/* Navigation using NavLink */}
            <nav className="flex flex-col gap-2" role="navigation" aria-label="Main navigation">
                <NavLink to="/" className={getNavLinkClass}>
                    {({ isActive }: { isActive: boolean }) => (
                        <>
                            <span className={getIconClass({ isActive })} aria-hidden="true">link</span>
                            <span className={getTextClass({ isActive })}>Data Connectors</span>
                        </>
                    )}
                </NavLink>
                <NavLink to="/endpoints" className={getNavLinkClass}>
                    {({ isActive }: { isActive: boolean }) => (
                        <>
                            <span className={getIconClass({ isActive })} aria-hidden="true">webhook</span>
                            <span className={getTextClass({ isActive })}>Endpoints</span>
                        </>
                    )}
                </NavLink>
                <NavLink to="/tenants" className={getNavLinkClass}>
                    {({ isActive }: { isActive: boolean }) => (
                        <>
                            <span className={getIconClass({ isActive })} aria-hidden="true">group</span>
                            <span className={getTextClass({ isActive })}>Tenants</span>
                        </>
                    )}
                </NavLink>
                <NavLink to="/explorer" className={getNavLinkClass}>
                    {({ isActive }: { isActive: boolean }) => (
                        <>
                            <span className={getIconClass({ isActive })} aria-hidden="true">table_view</span>
                            <span className={getTextClass({ isActive })}>Data Explorer</span>
                        </>
                    )}
                </NavLink>

                {/* Workflow Menu - Admin Only */}
                {isAdmin && (
                    <NavLink to="/workflow/tasks" className={getNavLinkClass}>
                        {({ isActive }: { isActive: boolean }) => (
                            <>
                                <span className={getIconClass({ isActive })} aria-hidden="true">task_alt</span>
                                <span className={getTextClass({ isActive })}>Task Inbox</span>
                            </>
                        )}
                    </NavLink>
                )}

                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-surface-elevated" href="#">
                    <span className="material-symbols-outlined text-text-primary" aria-hidden="true">history</span>
                    <span className="text-text-primary text-sm font-medium leading-normal">Logs</span>
                </a>
                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-surface-elevated" href="#">
                    <span className="material-symbols-outlined text-text-primary" aria-hidden="true">settings</span>
                    <span className="text-text-primary text-sm font-medium leading-normal">Settings</span>
                </a>
            </nav>

            {/* Help */}
            <div className="mt-auto flex flex-col gap-1">
                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-surface-elevated" href="#">
                    <span className="material-symbols-outlined text-text-primary" aria-hidden="true">help</span>
                    <span className="text-text-primary text-sm font-medium leading-normal">Help</span>
                </a>
            </div>
        </aside>
    );
};
