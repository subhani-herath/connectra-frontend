import React, { useEffect, useState } from 'react';
import { X, Monitor, AppWindow } from 'lucide-react';

interface DesktopSource {
    id: string;
    name: string;
    thumbnail: string;
}

interface ScreenPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (sourceId: string) => void;
}

export const ScreenPicker: React.FC<ScreenPickerProps> = ({ isOpen, onClose, onSelect }) => {
    const [sources, setSources] = useState<DesktopSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const hasFetchedRef = React.useRef(false);

    useEffect(() => {
        // Only fetch once when dialog opens
        if (isOpen && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            setLoading(true);
            setSelectedId(null);

            // Check if running in Electron with type guard
            const electronAPI = (window as { electronAPI?: { getDesktopSources?: () => Promise<DesktopSource[]> } }).electronAPI;

            if (electronAPI?.getDesktopSources) {
                electronAPI.getDesktopSources()
                    .then((fetchedSources: DesktopSource[]) => {
                        setSources(fetchedSources);
                        setLoading(false);
                    })
                    .catch((err: Error) => {
                        console.error('Failed to get desktop sources:', err);
                        setLoading(false);
                    });
            } else {
                // Not in Electron - use browser's native picker
                onSelect('browser-native');
                onClose();
            }
        }

        // Reset fetch flag when dialog closes
        if (!isOpen) {
            hasFetchedRef.current = false;
        }
    }, [isOpen, onSelect, onClose]);

    if (!isOpen) return null;

    const handleShare = () => {
        if (selectedId) {
            onSelect(selectedId);
            onClose();
        }
    };

    const screens = sources.filter(s => s.id.startsWith('screen:'));
    const windows = sources.filter(s => s.id.startsWith('window:'));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-background-card rounded-2xl border border-white/10 w-full max-w-3xl max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-text-primary">Choose what to share</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X size={20} className="text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            {/* Screens Section */}
                            {screens.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                                        <Monitor size={16} />
                                        Entire Screen
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {screens.map((source) => (
                                            <button
                                                key={source.id}
                                                onClick={() => setSelectedId(source.id)}
                                                className={`relative rounded-xl overflow-hidden border-2 transition-all ${selectedId === source.id
                                                    ? 'border-primary ring-2 ring-primary/30'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                <img
                                                    src={source.thumbnail}
                                                    alt={source.name}
                                                    className="w-full aspect-video object-cover"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <span className="text-xs text-white truncate block">
                                                        {source.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Windows Section */}
                            {windows.length > 0 && (
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
                                        <AppWindow size={16} />
                                        Application Windows
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {windows.map((source) => (
                                            <button
                                                key={source.id}
                                                onClick={() => setSelectedId(source.id)}
                                                className={`relative rounded-xl overflow-hidden border-2 transition-all ${selectedId === source.id
                                                    ? 'border-primary ring-2 ring-primary/30'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                <img
                                                    src={source.thumbnail}
                                                    alt={source.name}
                                                    className="w-full aspect-video object-cover bg-background-surface"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <span className="text-xs text-white truncate block">
                                                        {source.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-text-secondary hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={!selectedId}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedId
                            ? 'bg-primary hover:bg-primary-hover text-white'
                            : 'bg-white/10 text-text-muted cursor-not-allowed'
                            }`}
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};
