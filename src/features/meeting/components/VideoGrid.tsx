import React, { useEffect, useRef, useState } from 'react';
import { User, MicOff, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import type { ICameraVideoTrack, IRemoteVideoTrack, ILocalVideoTrack } from '../../../types/agora.types';

interface Participant {
    uid: number | string;
    name?: string;
    hasVideo: boolean;
    hasAudio: boolean;
    isLocal?: boolean;
    isScreenShare?: boolean;
    videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | ILocalVideoTrack;
}

interface VideoGridProps {
    participants: Participant[];
    localVideoTrack?: ICameraVideoTrack | ILocalVideoTrack | null;
    screenShareTrack?: ILocalVideoTrack | IRemoteVideoTrack | null;
    isScreenSharing?: boolean;
}

interface VideoTileProps {
    participant: Participant;
    className?: string;
    onMaximize?: () => void;
    onMinimize?: () => void;
    isMaximized?: boolean;
    showMaximizeButton?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({
    participant,
    className = '',
    onMaximize,
    onMinimize,
    isMaximized = false,
    showMaximizeButton = true,
}) => {
    const videoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = participant.videoTrack;
        const container = videoRef.current;

        if (track && container && participant.hasVideo) {
            track.play(container);
            return () => {
                track.stop();
            };
        }
    }, [participant.videoTrack, participant.hasVideo]);

    return (
        <div className={`relative bg-background-surface rounded-xl overflow-hidden border border-white/10 group ${className}`}>
            {/* Video container */}
            {participant.hasVideo && participant.videoTrack ? (
                <div
                    ref={videoRef}
                    className="absolute inset-0 bg-black"
                    style={{ width: '100%', height: '100%' }}
                />
            ) : (
                <div className="absolute inset-0 bg-background-dark flex items-center justify-center">
                    <div className={`${isMaximized ? 'w-24 h-24 md:w-32 md:h-32' : 'w-16 h-16 md:w-20 md:h-20'} rounded-full bg-background-surface flex items-center justify-center`}>
                        <User className={`${isMaximized ? 'w-12 h-12 md:w-16 md:h-16' : 'w-8 h-8 md:w-10 md:h-10'} text-text-muted`} />
                    </div>
                </div>
            )}

            {/* Maximize/Minimize button */}
            {showMaximizeButton && (
                <button
                    onClick={isMaximized ? onMinimize : onMaximize}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title={isMaximized ? 'Minimize' : 'Maximize'}
                >
                    {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            )}

            {/* Name & Status */}
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                    <span className={`${isMaximized ? 'text-sm md:text-base' : 'text-xs md:text-sm'} font-medium text-white truncate max-w-[70%]`}>
                        {participant.name || `User ${participant.uid}`}
                        {participant.isLocal && ' (You)'}
                    </span>
                    <div className="flex items-center gap-1">
                        {!participant.hasAudio && (
                            <div className="p-1 rounded-full bg-red-500/30">
                                <MicOff size={isMaximized ? 14 : 10} className="text-red-400" />
                            </div>
                        )}
                        {!participant.hasVideo && (
                            <div className="p-1 rounded-full bg-red-500/30">
                                <VideoOff size={isMaximized ? 14 : 10} className="text-red-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Local indicator */}
            {participant.isLocal && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/20 text-white text-xs font-medium">
                    You
                </div>
            )}
        </div>
    );
};

// Thumbnail component for the focused view
const ThumbnailTile: React.FC<{ participant: Participant; onClick: () => void }> = ({
    participant,
    onClick,
}) => {
    const videoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = participant.videoTrack;
        const container = videoRef.current;

        if (track && container && participant.hasVideo) {
            track.play(container);
            return () => {
                track.stop();
            };
        }
    }, [participant.videoTrack, participant.hasVideo]);

    return (
        <div
            onClick={onClick}
            className="relative bg-background-surface rounded-lg overflow-hidden border border-white/10 h-20 w-28 flex-shrink-0 cursor-pointer hover:border-primary/50 transition-colors group"
        >
            {/* Video container */}
            {participant.hasVideo && participant.videoTrack ? (
                <div
                    ref={videoRef}
                    className="absolute inset-0 bg-black"
                    style={{ width: '100%', height: '100%' }}
                />
            ) : (
                <div className="absolute inset-0 bg-background-dark flex items-center justify-center">
                    <User className="w-6 h-6 text-text-muted" />
                </div>
            )}

            {/* Maximize icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={16} className="text-white" />
            </div>

            {/* Name at bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-xs font-medium text-white truncate block">
                    {participant.name || `User ${participant.uid}`}
                </span>
            </div>

            {/* Status indicators */}
            {(!participant.hasAudio || !participant.hasVideo) && (
                <div className="absolute top-1 right-1 flex items-center gap-0.5">
                    {!participant.hasAudio && (
                        <div className="p-0.5 rounded-full bg-red-500/30">
                            <MicOff size={8} className="text-red-400" />
                        </div>
                    )}
                    {!participant.hasVideo && (
                        <div className="p-0.5 rounded-full bg-red-500/30">
                            <VideoOff size={8} className="text-red-400" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const VideoGrid: React.FC<VideoGridProps> = ({
    participants,
    localVideoTrack,
}) => {
    const [focusedUid, setFocusedUid] = useState<number | string | null>(null);
    const count = participants.length;

    // Inject local video track into local participant
    const participantsWithTracks = participants.map((p) => {
        if (p.isLocal && localVideoTrack) {
            return { ...p, videoTrack: localVideoTrack };
        }
        return p;
    });

    // Grid layout based on participant count - fills available space
    const getGridLayout = () => {
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2 grid-rows-2';
        if (count <= 6) return 'grid-cols-3 grid-rows-2';
        if (count <= 9) return 'grid-cols-3 grid-rows-3';
        return 'grid-cols-4 grid-rows-3';
    };

    // Find the focused participant
    const focusedParticipant = focusedUid 
        ? participantsWithTracks.find(p => p.uid === focusedUid) 
        : null;
    
    // Other participants (not focused)
    const thumbnailParticipants = focusedUid 
        ? participantsWithTracks.filter(p => p.uid !== focusedUid)
        : [];

    // Focused/Maximized view
    if (focusedParticipant) {
        return (
            <div className="w-full h-full flex flex-col bg-black">
                {/* Main Focused View */}
                <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                    <VideoTile
                        participant={focusedParticipant}
                        className="w-full h-full max-w-full max-h-full"
                        isMaximized={true}
                        onMinimize={() => setFocusedUid(null)}
                        showMaximizeButton={true}
                    />
                </div>

                {/* Thumbnail Strip */}
                {thumbnailParticipants.length > 0 && (
                    <div className="bg-background-card border-t border-white/5 px-4 py-3 flex items-center gap-2 overflow-x-auto">
                        <span className="text-xs text-text-secondary whitespace-nowrap mr-2">
                            Other participants:
                        </span>
                        <div className="flex gap-2">
                            {thumbnailParticipants.map((participant) => (
                                <ThumbnailTile
                                    key={participant.uid}
                                    participant={participant}
                                    onClick={() => setFocusedUid(participant.uid)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Normal Grid view
    return (
        <div className={`grid ${getGridLayout()} gap-2 md:gap-3 p-2 md:p-4 h-full w-full`}>
            {participantsWithTracks.map((participant) => (
                <VideoTile
                    key={participant.uid}
                    participant={participant}
                    className="w-full h-full min-h-0"
                    onMaximize={() => setFocusedUid(participant.uid)}
                    showMaximizeButton={count > 1}
                />
            ))}
        </div>
    );
};
