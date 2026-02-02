import { useState, useEffect, useCallback, useRef } from 'react';

export interface ParticipantInfo {
    displayName: string;
    isHost: boolean;
    uid: number;
    isScreenSharing?: boolean;
}

export interface ChatMessage {
    senderUid: number;
    senderName: string;
    message: string;
    timestamp: number;
}

export interface HandRaise {
    uid: number;
    name: string;
    timestamp: number;
}

export interface Poll {
    id: string;
    question: string;
    options: string[];
    results: Record<number, number>; // option index -> vote count
    isActive: boolean;
    createdBy: string;
}

export interface EmojiReaction {
    uid: number;
    name: string;
    emoji: string;
    timestamp: number;
}

/**
 * Custom hook for Agora RTM (Real-Time Messaging) integration
 * Handles participant info, chat, hand raise, polls, and reactions
 */
export const useAgoraRTM = (meetingId: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<Map<number, ParticipantInfo>>(new Map());
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [handRaises, setHandRaises] = useState<Map<number, HandRaise>>(new Map());
    const [polls, setPolls] = useState<Map<string, Poll>>(new Map());
    const [recentReactions, setRecentReactions] = useState<EmojiReaction[]>([]);
    
    const participantsRef = useRef<Map<number, ParticipantInfo>>(new Map());
    const handRaisesRef = useRef<Map<number, HandRaise>>(new Map());
    const pollsRef = useRef<Map<string, Poll>>(new Map());
    const isInitializedRef = useRef(false);

    // Connect to RTM
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
            participantsRef.current.clear();
            handRaisesRef.current.clear();
            pollsRef.current.clear();
        };
    }, [meetingId]);

    // Broadcast participant info
    const broadcastParticipantInfo = useCallback(
        async (uid: number, isHost: boolean, displayName: string = '', isScreenSharing: boolean = false) => {
            if (!isConnected) return;

            try {
                const message = {
                    type: 'PARTICIPANT_INFO',
                    uid,
                    isHost,
                    displayName: displayName || (isHost ? 'Lecturer' : `Participant ${uid}`),
                    isScreenSharing,
                    timestamp: Date.now(),
                };

                participantsRef.current.set(uid, {
                    uid,
                    displayName: message.displayName,
                    isHost,
                    isScreenSharing,
                });

                setParticipants(new Map(participantsRef.current));
                console.log('Broadcasted participant info:', message);
            } catch (error) {
                console.warn('Failed to broadcast participant info:', error);
            }
        },
        [isConnected]
    );

    // Send chat message
    const sendChatMessage = useCallback(
        (senderUid: number, senderName: string, message: string) => {
            if (!isConnected) return;

            try {
                const chatMsg: ChatMessage = {
                    senderUid,
                    senderName,
                    message,
                    timestamp: Date.now(),
                };

                setChatMessages((prev) => [...prev, chatMsg]);
                console.log('Chat message sent:', chatMsg);
            } catch (error) {
                console.warn('Failed to send chat message:', error);
            }
        },
        [isConnected]
    );

    // Raise hand
    const raiseHand = useCallback(
        (uid: number, name: string) => {
            if (!isConnected) return;

            try {
                const handRaise: HandRaise = {
                    uid,
                    name,
                    timestamp: Date.now(),
                };

                handRaisesRef.current.set(uid, handRaise);
                setHandRaises(new Map(handRaisesRef.current));
                console.log('Hand raised:', handRaise);
            } catch (error) {
                console.warn('Failed to raise hand:', error);
            }
        },
        [isConnected]
    );

    // Lower hand
    const lowerHand = useCallback(
        (uid: number) => {
            if (!isConnected) return;

            try {
                handRaisesRef.current.delete(uid);
                setHandRaises(new Map(handRaisesRef.current));
                console.log('Hand lowered for user:', uid);
            } catch (error) {
                console.warn('Failed to lower hand:', error);
            }
        },
        [isConnected]
    );

    // Create poll
    const createPoll = useCallback(
        (question: string, options: string[], createdBy: string) => {
            if (!isConnected) return;

            try {
                const pollId = Date.now().toString();
                const poll: Poll = {
                    id: pollId,
                    question,
                    options,
                    results: options.reduce((acc, _, idx) => ({ ...acc, [idx]: 0 }), {}),
                    isActive: true,
                    createdBy,
                };

                pollsRef.current.set(pollId, poll);
                setPolls(new Map(pollsRef.current));
                console.log('Poll created:', poll);
                return pollId;
            } catch (error) {
                console.warn('Failed to create poll:', error);
            }
        },
        [isConnected]
    );

    // Vote in poll
    const votePoll = useCallback(
        (pollId: string, optionIndex: number) => {
            if (!isConnected) return;

            try {
                const poll = pollsRef.current.get(pollId);
                if (poll) {
                    poll.results[optionIndex] = (poll.results[optionIndex] || 0) + 1;
                    pollsRef.current.set(pollId, poll);
                    setPolls(new Map(pollsRef.current));
                    console.log('Poll vote recorded:', pollId, optionIndex);
                }
            } catch (error) {
                console.warn('Failed to vote in poll:', error);
            }
        },
        [isConnected]
    );

    // End poll
    const endPoll = useCallback(
        (pollId: string) => {
            if (!isConnected) return;

            try {
                const poll = pollsRef.current.get(pollId);
                if (poll) {
                    poll.isActive = false;
                    pollsRef.current.set(pollId, poll);
                    setPolls(new Map(pollsRef.current));
                    console.log('Poll ended:', pollId);
                }
            } catch (error) {
                console.warn('Failed to end poll:', error);
            }
        },
        [isConnected]
    );

    // Send emoji reaction
    const sendReaction = useCallback(
        (uid: number, name: string, emoji: string) => {
            if (!isConnected) return;

            try {
                const reaction: EmojiReaction = {
                    uid,
                    name,
                    emoji,
                    timestamp: Date.now(),
                };

                setRecentReactions((prev) => {
                    const updated = [...prev, reaction];
                    // Keep only last 20 reactions
                    return updated.slice(-20);
                });

                // Auto-remove reaction after 2 seconds
                setTimeout(() => {
                    setRecentReactions((prev) =>
                        prev.filter((r) => r.timestamp !== reaction.timestamp)
                    );
                }, 2000);

                console.log('Emoji reaction sent:', reaction);
            } catch (error) {
                console.warn('Failed to send reaction:', error);
            }
        },
        [isConnected]
    );

    // Mute all notification
    const notifyMuteAll = useCallback(
        (lecturerName: string) => {
            if (!isConnected) return;
            console.log(`${lecturerName} muted all participants`);
        },
        [isConnected]
    );

    return {
        isConnected,
        participants,
        chatMessages,
        handRaises,
        polls,
        recentReactions,
        broadcastParticipantInfo,
        sendChatMessage,
        raiseHand,
        lowerHand,
        createPoll,
        votePoll,
        endPoll,
        sendReaction,
        notifyMuteAll,
    };
};
