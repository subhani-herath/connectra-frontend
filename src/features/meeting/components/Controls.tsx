import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff, VolumeX, Volume2 } from 'lucide-react';

interface ControlsProps {
    isMicMuted: boolean;
    isCamOff: boolean;
    isScreenSharing?: boolean;
    showScreenShare?: boolean;
    isLecturer?: boolean;
    isAllMuted?: boolean;
    isMutedByHost?: boolean;
    onToggleMic: () => void;
    onToggleCam: () => void;
    onToggleScreenShare?: () => void;
    onMuteAll?: () => void;
    onLeave: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
    isMicMuted,
    isCamOff,
    isScreenSharing = false,
    showScreenShare = false,
    isLecturer = false,
    isAllMuted = false,
    isMutedByHost = false,
    onToggleMic,
    onToggleCam,
    onToggleScreenShare,
    onMuteAll,
    onLeave,
}) => {
    return (
        <div className="flex items-center justify-center gap-4 p-4 bg-background-card/90 backdrop-blur-sm rounded-2xl border border-white/5">
            {/* Microphone Toggle */}
            <div className="relative">
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
                {/* Muted by host indicator */}
                {isMutedByHost && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                        HOST
                    </span>
                )}
            </div>

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

            {/* Mute All Button (Lecturer only) */}
            {isLecturer && onMuteAll && (
                <button
                    onClick={onMuteAll}
                    className={`p-4 rounded-full transition-all ${isAllMuted
                            ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                            : 'bg-background-surface text-text-primary hover:bg-amber-500/20 hover:text-amber-500'
                        }`}
                    title={isAllMuted ? 'Unmute all participants' : 'Mute all participants'}
                >
                    {isAllMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
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
