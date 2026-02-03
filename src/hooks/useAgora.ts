import { useState, useEffect, useCallback, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';
import type { UseAgoraReturn, RemoteUser, CurrentUserInfo } from '../types/agora.types';
import { meetingService } from '../services/meetingService';

// Configure Agora SDK
AgoraRTC.setLogLevel(3); // Warning level

/**
 * Custom hook for Agora Video Call integration
 */
export const useAgora = (meetingId: string): UseAgoraReturn => {
    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Refs for Agora resources
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
    const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
    const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
    const isInitializedRef = useRef(false);
    const wasVideoOnBeforeScreenShare = useRef(false);
    const userAttributesRef = useRef<Record<string | number, { userName: string; isHost: boolean }>>({});

    // State for tracks (to trigger re-renders)
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | ILocalVideoTrack | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [currentUserInfo, setCurrentUserInfo] = useState<CurrentUserInfo | null>(null);

    // Initialize and join meeting
    useEffect(() => {
        // Prevent double initialization in React StrictMode
        if (isInitializedRef.current) {
            console.log('Agora already initialized, skipping...');
            return;
        }

        // Set immediately to prevent duplicate calls
        isInitializedRef.current = true;

        let isCancelled = false;

        const initAgora = async () => {
            try {
                setIsLoading(true);
                setError(null);

                console.log('Starting Agora initialization for meeting:', meetingId);

                // Get Agora token from backend
                const response = await meetingService.joinMeeting(meetingId);

                if (isCancelled) {
                    console.log('Initialization cancelled');
                    isInitializedRef.current = false;
                    return;
                }

                console.log('Agora config received:', {
                    appId: response.appId,
                    channelName: response.channelName,
                    uid: response.uid,
                });

                // Create Agora client
                const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                clientRef.current = client;

                // Store current user's info from the join response for RTM sharing
                userAttributesRef.current[response.uid] = {
                    userName: response.userName,
                    isHost: response.isHost
                };

                // Set current user info state for the component
                setCurrentUserInfo({
                    uid: response.uid,
                    userName: response.userName,
                    isHost: response.isHost
                });

                // Set up remote user event handlers
                client.on('user-published', async (user, mediaType) => {
                    if (isCancelled) return;

                    try {
                        await client.subscribe(user, mediaType);
                        console.log('Subscribed to user:', user.uid, mediaType);

                        setRemoteUsers((prev) => {
                            const existing = prev.find((u) => u.uid === user.uid);
                            if (existing) {
                                return prev.map((u) =>
                                    u.uid === user.uid
                                        ? {
                                            ...u,
                                            hasVideo: mediaType === 'video' ? true : u.hasVideo,
                                            hasAudio: mediaType === 'audio' ? true : u.hasAudio,
                                            videoTrack: mediaType === 'video' ? user.videoTrack : u.videoTrack,
                                            audioTrack: mediaType === 'audio' ? user.audioTrack : u.audioTrack,
                                        }
                                        : u
                                );
                            }
                            return [
                                ...prev,
                                {
                                    uid: user.uid,
                                    hasVideo: mediaType === 'video',
                                    hasAudio: mediaType === 'audio',
                                    videoTrack: user.videoTrack,
                                    audioTrack: user.audioTrack,
                                },
                            ];
                        });

                        // Auto-play remote audio
                        if (mediaType === 'audio' && user.audioTrack) {
                            user.audioTrack.play();
                        }
                    } catch (subError) {
                        console.error('Failed to subscribe to user:', subError);
                    }
                });

                client.on('user-unpublished', (user, mediaType) => {
                    console.log('User unpublished:', user.uid, mediaType);
                    setRemoteUsers((prev) =>
                        prev.map((u) =>
                            u.uid === user.uid
                                ? {
                                    ...u,
                                    hasVideo: mediaType === 'video' ? false : u.hasVideo,
                                    hasAudio: mediaType === 'audio' ? false : u.hasAudio,
                                    videoTrack: mediaType === 'video' ? undefined : u.videoTrack,
                                    audioTrack: mediaType === 'audio' ? undefined : u.audioTrack,
                                }
                                : u
                        )
                    );
                });

                client.on('user-joined', (user) => {
                    console.log('User joined the channel:', user.uid);
                    setRemoteUsers((prev) => {
                        // Only add if not already in the list
                        if (prev.find((u) => u.uid === user.uid)) {
                            return prev;
                        }
                        return [
                            ...prev,
                            {
                                uid: user.uid,
                                hasVideo: false,
                                hasAudio: false,
                            },
                        ];
                    });
                });

                client.on('user-left', (user) => {
                    console.log('User left:', user.uid);
                    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
                });

                // Join channel
                console.log('Joining Agora channel...');
                await client.join(response.appId, response.channelName, response.agoraToken, response.uid);
                console.log('Joined channel successfully');

                if (isCancelled) {
                    await client.leave();
                    return;
                }

                // Create local tracks
                try {
                    console.log('Creating local media tracks...');
                    const [audioTrack, videoTrack] = await Promise.all([
                        AgoraRTC.createMicrophoneAudioTrack(),
                        AgoraRTC.createCameraVideoTrack(),
                    ]);

                    if (isCancelled) {
                        audioTrack.close();
                        videoTrack.close();
                        return;
                    }

                    localAudioTrackRef.current = audioTrack;
                    localVideoTrackRef.current = videoTrack;
                    setLocalAudioTrack(audioTrack);
                    setLocalVideoTrack(videoTrack);

                    // Publish tracks
                    await client.publish([audioTrack, videoTrack]);
                    console.log('Published local tracks');
                } catch (mediaError) {
                    console.warn('Could not access media devices:', mediaError);
                    // Continue without local tracks - user can still see others
                }

                if (!isCancelled) {
                    setIsJoined(true);
                    setIsLoading(false);
                }
            } catch (err: unknown) {
                console.error('Failed to initialize Agora:', err);

                // Extract meaningful error message
                let errorMessage = 'Failed to join meeting.';
                if (err instanceof Error) {
                    if (err.message.includes('Network')) {
                        errorMessage = 'Network error. Please check your internet connection.';
                    } else if (err.message.includes('permission') || err.message.includes('Permission')) {
                        errorMessage = 'Permission denied. Please allow camera/microphone access.';
                    } else if (err.message.includes('UID_CONFLICT')) {
                        errorMessage = 'You are already in this meeting in another window.';
                    } else {
                        errorMessage = `Connection failed: ${err.message}`;
                    }
                }

                if (!isCancelled) {
                    setError(errorMessage);
                    setIsLoading(false);
                    isInitializedRef.current = false;
                }
            }
        };

        if (meetingId) {
            initAgora();
        }

        // Cleanup on unmount
        return () => {
            isCancelled = true;
            console.log('Cleaning up Agora resources...');

            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.close();
                localAudioTrackRef.current = null;
            }
            if (localVideoTrackRef.current) {
                localVideoTrackRef.current.close();
                localVideoTrackRef.current = null;
            }
            if (screenTrackRef.current) {
                screenTrackRef.current.close();
                screenTrackRef.current = null;
            }
            if (clientRef.current) {
                clientRef.current.leave().catch(console.error);
                clientRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, [meetingId]);

    const toggleMic = useCallback(async () => {
        try {
            if (localAudioTrackRef.current) {
                await localAudioTrackRef.current.setEnabled(isMicMuted);
                setIsMicMuted(!isMicMuted);
            }
        } catch (err) {
            console.error('Failed to toggle microphone:', err);
        }
    }, [isMicMuted]);

    const toggleCam = useCallback(async () => {
        try {
            if (localVideoTrackRef.current) {
                await localVideoTrackRef.current.setEnabled(isCamOff);
                setIsCamOff(!isCamOff);
            }
        } catch (err) {
            console.error('Failed to toggle camera:', err);
        }
    }, [isCamOff]);

    const startScreenShare = useCallback(async (sourceId?: string) => {
        try {
            const client = clientRef.current;
            if (!client || isScreenSharing) return;

            console.log('Starting screen share with sourceId:', sourceId);

            // Remember if video was on before screen share
            wasVideoOnBeforeScreenShare.current = !isCamOff && localVideoTrackRef.current !== null;

            // Create screen share track
            let screenTrack: ILocalVideoTrack;

            if (sourceId && sourceId !== 'browser-native') {
                // Electron: use specific source (this uses navigator.mediaDevices under the hood)
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        // @ts-expect-error - Electron chromium supports mandatory constraints
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: sourceId,
                        },
                    },
                });
                screenTrack = AgoraRTC.createCustomVideoTrack({
                    mediaStreamTrack: stream.getVideoTracks()[0],
                });
            } else {
                // Browser: use native screen picker
                const track = await AgoraRTC.createScreenVideoTrack({}, 'disable');
                screenTrack = Array.isArray(track) ? track[0] : track;
            }

            screenTrackRef.current = screenTrack;

            // Unpublish camera if it was on
            if (localVideoTrackRef.current && wasVideoOnBeforeScreenShare.current) {
                await client.unpublish(localVideoTrackRef.current);
            }

            // Publish screen track
            await client.publish(screenTrack);
            setLocalVideoTrack(screenTrack);
            setIsScreenSharing(true);

            console.log('Screen share started successfully');

            // Handle when user stops sharing via browser UI
            screenTrack.on('track-ended', async () => {
                console.log('Screen share track ended');
                await stopScreenShareInternal();
            });
        } catch (err) {
            console.error('Failed to start screen share:', err);
        }
    }, [isScreenSharing, isCamOff]);

    const stopScreenShareInternal = async () => {
        const client = clientRef.current;
        if (!client) return;

        if (screenTrackRef.current) {
            await client.unpublish(screenTrackRef.current);
            screenTrackRef.current.close();
            screenTrackRef.current = null;
        }

        // Restore camera if it was on before
        if (localVideoTrackRef.current && wasVideoOnBeforeScreenShare.current) {
            await client.publish(localVideoTrackRef.current);
            setLocalVideoTrack(localVideoTrackRef.current);
        } else {
            setLocalVideoTrack(null);
        }

        setIsScreenSharing(false);
        console.log('Screen share stopped');
    };

    const stopScreenShare = useCallback(async () => {
        try {
            await stopScreenShareInternal();
        } catch (err) {
            console.error('Failed to stop screen share:', err);
        }
    }, []);

    const leave = useCallback(async () => {
        try {
            // Notify backend about leaving
            await meetingService.leaveMeeting(meetingId);

            // Close local tracks
            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.close();
                localAudioTrackRef.current = null;
            }
            if (localVideoTrackRef.current) {
                localVideoTrackRef.current.close();
                localVideoTrackRef.current = null;
            }
            if (screenTrackRef.current) {
                screenTrackRef.current.close();
                screenTrackRef.current = null;
            }

            // Leave channel
            if (clientRef.current) {
                await clientRef.current.leave();
                clientRef.current = null;
            }

            setLocalAudioTrack(null);
            setLocalVideoTrack(null);
            setIsJoined(false);
            setRemoteUsers([]);
            isInitializedRef.current = false;
        } catch (err) {
            console.error('Failed to leave meeting:', err);
        }
    }, [meetingId]);

    // Find remote screen sharer (user with isScreenSharing flag)
    const remoteScreenSharer = remoteUsers.find(u => u.isScreenSharing) || null;

    return {
        isJoined,
        isLoading,
        error,
        localVideoTrack,
        localAudioTrack,
        remoteUsers,
        isMicMuted,
        isCamOff,
        isScreenSharing,
        remoteScreenSharer,
        toggleMic,
        toggleCam,
        startScreenShare,
        stopScreenShare,
        leave,
        currentUserInfo,
    };
};
