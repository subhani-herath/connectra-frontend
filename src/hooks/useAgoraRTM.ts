import { useState, useEffect, useCallback, useRef } from 'react';
import AgoraRTM from 'agora-rtm-sdk';

// Use the same App ID as the RTC SDK
const APP_ID = import.meta.env.VITE_AGORA_APP_ID || '82fa855761c14d5eafb7f8cfece45c74';

export interface ParticipantInfo {
    displayName: string;
    isHost: boolean;
    uid: number;
}

export interface MuteAllState {
    isMuted: boolean;
    timestamp: number;
    mutedBy: string;
}

interface RTMMessage {
    type: 'MUTE_ALL' | 'PARTICIPANT_INFO';
    payload: MuteAllState | ParticipantInfo;
}

/**
 * Custom hook for Agora RTM (Real-Time Messaging) integration
 * Uses Agora RTM SDK v2 API
 */
export const useAgoraRTM = (meetingId: string, uniqueUserId?: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<Map<number, ParticipantInfo>>(new Map());
    const [muteAllState, setMuteAllState] = useState<MuteAllState | null>(null);

    const rtmClientRef = useRef<InstanceType<typeof AgoraRTM.RTM> | null>(null);
    const participantsRef = useRef<Map<number, ParticipantInfo>>(new Map());
    const isInitializedRef = useRef(false);
    const rtmUserIdRef = useRef<string>(uniqueUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const channelNameRef = useRef<string>(`meeting_${meetingId}`);

    // Handle incoming messages
    const handleMessage = useCallback((event: { channelType: string; channelName: string; publisher: string; message: string | Uint8Array }) => {
        if (event.channelName !== channelNameRef.current) return;

        try {
            const messageStr = typeof event.message === 'string' ? event.message : new TextDecoder().decode(event.message);
            const parsed: RTMMessage = JSON.parse(messageStr);
            console.log('RTM message received from', event.publisher, ':', parsed);

            if (parsed.type === 'MUTE_ALL') {
                const state = parsed.payload as MuteAllState;
                setMuteAllState(state);
            } else if (parsed.type === 'PARTICIPANT_INFO') {
                const info = parsed.payload as ParticipantInfo;
                participantsRef.current.set(info.uid, info);
                setParticipants(new Map(participantsRef.current));
            }
        } catch (error) {
            console.warn('Failed to parse RTM message:', error);
        }
    }, []);

    // Connect to RTM
    useEffect(() => {
        if (isInitializedRef.current || !meetingId) return;
        isInitializedRef.current = true;

        const initRTM = async () => {
            try {
                // Create RTM client (v2 API)
                const rtmClient = new AgoraRTM.RTM(APP_ID, rtmUserIdRef.current);
                rtmClientRef.current = rtmClient;

                // Set up event listeners
                rtmClient.addEventListener('message', handleMessage);

                // Login to RTM
                await rtmClient.login();
                console.log('RTM logged in as:', rtmUserIdRef.current);

                // Subscribe to channel
                await rtmClient.subscribe(channelNameRef.current);
                console.log('RTM subscribed to channel:', channelNameRef.current);

                setIsConnected(true);
            } catch (error) {
                console.warn('RTM initialization failed:', error);
                setIsConnected(false);
            }
        };

        initRTM();

        return () => {
            // Cleanup on unmount
            const cleanup = async () => {
                try {
                    if (rtmClientRef.current) {
                        await rtmClientRef.current.unsubscribe(channelNameRef.current);
                        await rtmClientRef.current.logout();
                        rtmClientRef.current.removeEventListener('message', handleMessage);
                    }
                } catch (error) {
                    console.debug('RTM cleanup error:', error);
                }
            };
            cleanup();
            participantsRef.current.clear();
            isInitializedRef.current = false;
        };
    }, [meetingId, handleMessage]);

    // Broadcast participant info
    const broadcastParticipantInfo = useCallback(
        async (uid: number, isHost: boolean, displayName: string = '') => {
            if (!isConnected || !rtmClientRef.current) return;

            try {
                const info: ParticipantInfo = {
                    uid,
                    displayName: displayName || (isHost ? 'Lecturer' : `Participant ${uid}`),
                    isHost,
                };

                const message: RTMMessage = {
                    type: 'PARTICIPANT_INFO',
                    payload: info,
                };

                await rtmClientRef.current.publish(channelNameRef.current, JSON.stringify(message));

                // Also store locally
                participantsRef.current.set(uid, info);
                setParticipants(new Map(participantsRef.current));

                console.log('Broadcasted participant info:', info);
            } catch (error) {
                console.warn('Failed to broadcast participant info:', error);
            }
        },
        [isConnected]
    );

    // Broadcast mute all command (lecturer only)
    const broadcastMuteAll = useCallback(
        async (isMuted: boolean, mutedBy: string) => {
            if (!isConnected || !rtmClientRef.current) return;

            try {
                const state: MuteAllState = {
                    isMuted,
                    timestamp: Date.now(),
                    mutedBy,
                };

                const message: RTMMessage = {
                    type: 'MUTE_ALL',
                    payload: state,
                };

                await rtmClientRef.current.publish(channelNameRef.current, JSON.stringify(message));

                // Also update local state
                setMuteAllState(state);

                console.log('Broadcasted mute all:', state);
            } catch (error) {
                console.warn('Failed to broadcast mute all:', error);
            }
        },
        [isConnected]
    );

    // Clear mute all state
    const clearMuteAllState = useCallback(() => {
        setMuteAllState(null);
    }, []);

    return {
        isConnected,
        participants,
        muteAllState,
        broadcastParticipantInfo,
        broadcastMuteAll,
        clearMuteAllState,
    };
};
