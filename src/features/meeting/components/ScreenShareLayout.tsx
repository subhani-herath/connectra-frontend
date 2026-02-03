import React, { useEffect, useRef } from 'react';
import { User, MicOff, VideoOff, Monitor } from 'lucide-react';
import type { ICameraVideoTrack, IRemoteVideoTrack, ILocalVideoTrack, RemoteUser } from '../../../types/agora.types';

interface Participant {
    uid: number | string;
    name?: string;
    hasVideo: boolean;
    hasAudio: boolean;
    isLocal?: boolean;
    videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | ILocalVideoTrack;
    isScreenSharing?: boolean;
}

interface ScreenShareLayoutProps {
    participants: Participant[];
    localVideoTrack?: ICameraVideoTrack | ILocalVideoTrack | null;
    isScreenSharing?: boolean;
    remoteScreenSharer?: RemoteUser | null;
}

const ParticipantThumb: React.FC<{ participant: Participant }> = ({ participant }) => {
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
        <div className="relative bg-background-surface rounded-lg overflow-hidden border border-white/10 h-20 w-28 flex-shrink-0">
            {/* Video container */}
            {participant.hasVideo && participant.videoTrack ? (
                <div
                    ref={videoRef}
                    className="absolute inset-0 bg-black"
                    style={{ width: '100%', height: '100%' }}
                />
            ) : (
                <div className="absolute inset-0 bg-background-dark flex items-center justify-center">
                    <User className="w-4 h-4 text-text-muted" />
                </div>
            )}

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

export const ScreenShareLayout: React.FC<ScreenShareLayoutProps> = ({
    participants,
    localVideoTrack,
}) => {
    // Inject local video track into local participant
    const participantsWithTracks = participants.map((p) => {
        if (p.isLocal && localVideoTrack) {
            return { ...p, videoTrack: localVideoTrack };
        }
        return p;
    });

    const mainParticipant = participantsWithTracks[0];
    const thumbnailParticipants = participantsWithTracks.slice(1);

    return (
        <div className="w-full h-full flex flex-col bg-black">
            {/* Main Screen Share Area */}
            <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
                {mainParticipant ? (
                    <MainScreenView participant={mainParticipant} />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-background-surface flex items-center justify-center">
                            <User className="w-12 h-12 text-text-muted" />
                        </div>
                        <p className="text-text-secondary">Waiting for screen share...</p>
                    </div>
                )}
            </div>

            {/* Participant Thumbnails Bar */}
            {thumbnailParticipants.length > 0 && (
                <div className="bg-background-card border-t border-white/5 px-4 py-3 flex items-center gap-2 overflow-x-auto">
                    <span className="text-xs text-text-secondary whitespace-nowrap mr-2">Other participants:</span>
                    <div className="flex gap-2">
                        {thumbnailParticipants.map((participant) => (
                            <ParticipantThumb key={participant.uid} participant={participant} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const MainScreenView: React.FC<{ participant: Participant }> = ({ participant }) => {
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
        <>
            {participant.hasVideo && participant.videoTrack ? (
                <div
                    ref={videoRef}
                    className="w-full h-full bg-black"
                    style={{ width: '100%', height: '100%' }}
                />
            ) : (
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-background-surface flex items-center justify-center">
                        <User className="w-16 h-16 text-text-muted" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium text-white">{participant.name || `User ${participant.uid}`}</p>
                        <p className="text-sm text-text-secondary mt-1">
                            {participant.isLocal && ' (You)'}
                        </p>
                    </div>
                </div>
            )}

            {/* Name overlay */}
            <div className="absolute bottom-4 left-4 px-3 py-2 bg-black/60 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-white">
                    {participant.name || `User ${participant.uid}`}
                    {participant.isLocal && ' (You)'}
                </p>
            </div>

            {/* Status indicators */}
            {(!participant.hasAudio || !participant.hasVideo) && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {!participant.hasAudio && (
                        <div className="p-2 rounded-full bg-red-500/20 border border-red-500/50">
                            <MicOff size={16} className="text-red-400" />
                        </div>
                    )}
                    {!participant.hasVideo && (
                        <div className="p-2 rounded-full bg-red-500/20 border border-red-500/50">
                            <VideoOff size={16} className="text-red-400" />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
