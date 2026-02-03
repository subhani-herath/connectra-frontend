import { useState, useEffect, useCallback, useRef } from 'react';

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

/**
 * Custom hook for Agora RTM (Real-Time Messaging) integration
 * Used to sync participant information across the meeting
 * 
 * Note: For now, this is a placeholder that uses local storage
 * RTM requires proper token setup in the backend
 */
export const useAgoraRTM = (meetingId: string, _uniqueUserId?: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<Map<number, ParticipantInfo>>(new Map());
    const [muteAllState, setMuteAllState] = useState<MuteAllState | null>(null);
    
    const participantsRef = useRef<Map<number, ParticipantInfo>>(new Map());
    const isInitializedRef = useRef(false);

    // Connect to RTM (using local state for now)
    useEffect(() => {
        if (isInitializedRef.current || !meetingId) return;
        isInitializedRef.current = true;

        try {
            console.log('RTM initialized for meeting:', meetingId);
            setIsConnected(true);
        } catch (error) {
            console.warn('RTM initialization failed:', error);
            setIsConnected(false);
        }

        return () => {
            // Cleanup
            participantsRef.current.clear();
        };
    }, [meetingId]);

    // Broadcast participant info
    const broadcastParticipantInfo = useCallback(
        async (uid: number, isHost: boolean, displayName: string = '') => {
            if (!isConnected) return;

            try {
                const message = {
                    type: 'PARTICIPANT_INFO',
                    uid,
                    isHost,
                    displayName: displayName || (isHost ? 'Lecturer' : `Participant ${uid}`),
                    timestamp: Date.now(),
                };

                // Store in local ref
                participantsRef.current.set(uid, {
                    uid,
                    displayName: message.displayName,
                    isHost,
                });

                // Update state
                setParticipants(new Map(participantsRef.current));

                console.log('Broadcasted participant info:', message);
            } catch (error) {
                console.warn('Failed to broadcast participant info:', error);
            }
        },
        [isConnected]
    );

    // Broadcast mute all state
    const broadcastMuteAll = useCallback(
        async (isMuted: boolean, mutedBy: string) => {
            if (!isConnected) return;

            try {
                const state: MuteAllState = {
                    isMuted,
                    timestamp: Date.now(),
                    mutedBy,
                };
                setMuteAllState(state);
                console.log('Broadcasted mute all:', state);
            } catch (error) {
                console.warn('Failed to broadcast mute all:', error);
            }
        },
        [isConnected]
    );

    return {
        isConnected,
        participants,
        broadcastParticipantInfo,
        muteAllState,
        broadcastMuteAll,
    };
};
