import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff, MicOff as MicOffIcon, MessageCircle, Hand } from 'lucide-react';

interface ControlsProps {
    isMicMuted: boolean;
    isCamOff: boolean;
    isScreenSharing?: boolean;
    showScreenShare?: boolean;
    isMutedAll?: boolean;
    isLecturer?: boolean;
    unreadChat?: number;
    raisedHandsCount?: number;
    onToggleMic: () => void;
    onToggleCam: () => void;
    onToggleScreenShare?: () => void;
    onMuteAll?: () => void;
    onOpenChat?: () => void;
    onOpenHand?: () => void;
    onLeave: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
    isMicMuted,
    isCamOff,
    isScreenSharing = false,
    showScreenShare = false,
    isMutedAll = false,
    isLecturer = false,
    unreadChat = 0,
    raisedHandsCount = 0,
    onToggleMic,
    onToggleCam,
    onToggleScreenShare,
    onMuteAll,
    onOpenChat,
    onOpenHand,
    onLeave,
}) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Main Controls */}
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

                {/* Mute All (Lecturer only) */}
                {isLecturer && onMuteAll && (
                    <button
                        onClick={onMuteAll}
                        className={`p-4 rounded-full transition-all ${isMutedAll
                                ? 'bg-status-error text-white hover:bg-status-error/80'
                                : 'bg-background-surface text-text-primary hover:bg-status-error/20 hover:text-status-error'
                            }`}
                        title={isMutedAll ? 'All participants muted' : 'Mute all participants'}
                    >
                        <MicOffIcon size={24} />
                    </button>
                )}

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

            {/* Feature Controls */}
            <div className="flex items-center justify-center gap-3 px-4 py-2">
                {/* Chat */}
                <button
                    onClick={onOpenChat}
                    className="relative p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
                    title="Open chat"
                >
                    <MessageCircle size={18} />
                    {unreadChat > 0 && (
                        <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadChat}
                        </span>
                    )}
                </button>

                {/* Raise Hand */}
                <button
                    onClick={onOpenHand}
                    className="relative p-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-all"
                    title="Raise hand"
                >
                    <Hand size={18} />
                    {raisedHandsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {raisedHandsCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};
