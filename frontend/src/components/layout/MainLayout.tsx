import React from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-surface">
            {/* Skip to main content link for keyboard navigation */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <div className="flex h-full flex-1">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main id="main-content" className="flex-1 p-8" tabIndex={-1}>
                    <div className="flex max-w-7xl flex-col gap-6 mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
