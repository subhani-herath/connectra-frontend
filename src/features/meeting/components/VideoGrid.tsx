import React, { useEffect, useRef } from 'react';
import { User, MicOff, VideoOff } from 'lucide-react';
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

const VideoTile: React.FC<{ participant: Participant; className?: string }> = ({
    participant,
    className = '',
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
        <div className={`relative bg-background-surface rounded-xl overflow-hidden border border-white/10 ${className}`}>
            {/* Video container */}
            {participant.hasVideo && participant.videoTrack ? (
                <div
                    ref={videoRef}
                    className="absolute inset-0 bg-black"
                    style={{ width: '100%', height: '100%' }}
                />
            ) : (
                <div className="absolute inset-0 bg-background-dark flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-background-surface flex items-center justify-center">
                        <User className="w-8 h-8 md:w-10 md:h-10 text-text-muted" />
                    </div>
                </div>
            )}

            {/* Name & Status */}
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium text-white truncate max-w-[70%]">
                        {participant.name || `User ${participant.uid}`}
                        {participant.isLocal && ' (You)'}
                    </span>
                    <div className="flex items-center gap-1">
                        {!participant.hasAudio && (
                            <div className="p-1 rounded-full bg-red-500/30">
                                <MicOff size={10} className="text-red-400" />
                            </div>
                        )}
                        {!participant.hasVideo && (
                            <div className="p-1 rounded-full bg-red-500/30">
                                <VideoOff size={10} className="text-red-400" />
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

export const VideoGrid: React.FC<VideoGridProps> = ({
    participants,
    localVideoTrack,
    isScreenSharing = false,
}) => {
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

    return (
        <div className={`grid ${getGridLayout()} gap-2 md:gap-3 p-2 md:p-4 h-full w-full`}>
            {participantsWithTracks.map((participant) => (
                <VideoTile
                    key={participant.uid}
                    participant={participant}
                    className="w-full h-full min-h-0"
                />
            ))}
        </div>
    );
};
