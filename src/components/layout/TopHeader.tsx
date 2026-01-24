import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface TopHeaderProps {
    title: string;
    subtitle?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    actions?: React.ReactNode;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
    title,
    subtitle,
    onRefresh,
    isRefreshing,
    actions,
}) => {
    return (
        <header className="bg-background-card/80 backdrop-blur-sm border-b border-white/5 sticky top-0 z-30">
            <div className="px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">{title}</h1>
                    {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="p-2 rounded-lg bg-background-surface hover:bg-primary/20 text-text-secondary hover:text-primary transition-all disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw
                                size={20}
                                className={clsx(isRefreshing && 'animate-spin')}
                            />
                        </button>
                    )}
                    {actions}
                </div>
            </div>
        </header>
    );
};
