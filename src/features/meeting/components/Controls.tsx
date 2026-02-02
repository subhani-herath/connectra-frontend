import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';

interface ControlsProps {
    isMicMuted: boolean;
    isCamOff: boolean;
    isScreenSharing?: boolean;
    showScreenShare?: boolean;
    onToggleMic: () => void;
    onToggleCam: () => void;
    onToggleScreenShare?: () => void;
    onLeave: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
    isMicMuted,
    isCamOff,
    isScreenSharing = false,
    showScreenShare = false,
    onToggleMic,
    onToggleCam,
    onToggleScreenShare,
    onLeave,
}) => {
    return (
        <div className="flex items-center justify-center gap-4 p-4 bg-background-card/90 backdrop-blur-sm rounded-2xl border border-white/5">
            {/* Microphone Toggle */}
            <button
                onClick={onToggleMic}
                className={`p-4 rounded-full transition-all ${isMicMuted
                        ? 'bg-status-error/20 text-status-error hover:bg-status-error/30'
                        : 'bg-background-surface text-text-primary hover:bg-primary/20 hover:text-primary'
                    }`}
                title={isMicMuted ? 'Unmute' : 'Mute'}
            >
                {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Camera Toggle */}
            <button
                onClick={onToggleCam}
                className={`p-4 rounded-full transition-all ${isCamOff
                        ? 'bg-status-error/20 text-status-error hover:bg-status-error/30'
                        : 'bg-background-surface text-text-primary hover:bg-primary/20 hover:text-primary'
                    }`}
                title={isCamOff ? 'Turn on camera' : 'Turn off camera'}
            >
                {isCamOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            {/* Screen Share */}
            {showScreenShare && onToggleScreenShare && (
                <button
                    onClick={onToggleScreenShare}
                    className={`p-4 rounded-full transition-all ${isScreenSharing
                            ? 'bg-primary text-white hover:bg-primary-hover'
                            : 'bg-background-surface text-text-primary hover:bg-primary/20 hover:text-primary'
                        }`}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                    {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
                </button>
            )}

            {/* Leave Button */}
            <button
                onClick={onLeave}
                className="p-4 rounded-full bg-status-error hover:bg-status-error/80 text-white transition-all"
                title="Leave meeting"
            >
                <PhoneOff size={24} />
            </button>
        </div>
    );
};
