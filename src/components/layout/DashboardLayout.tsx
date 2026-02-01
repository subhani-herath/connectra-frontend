import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { clsx } from 'clsx';

export const DashboardLayout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background-dark">
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <main
                className={clsx(
                    'min-h-screen transition-all duration-300 ease-in-out',
                    isCollapsed ? 'ml-16' : 'ml-60'
                )}
            >
                <Outlet />
            </main>
        </div>
    );
};
