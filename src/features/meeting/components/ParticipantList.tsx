import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { meetingService, type Participant } from '../../../services/meetingService';

interface ParticipantListProps {
    meetingId: string;
    isLive: boolean;
    currentUserUid?: number;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ meetingId, isLive, currentUserUid = 0 }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLive || !meetingId) {
            setParticipants([]);
            return;
        }

        const fetchParticipants = async () => {
            try {
                const data = await meetingService.getActiveParticipants(meetingId);
                setParticipants(data);
            } catch (error) {
                console.error('Failed to fetch participants:', error);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchParticipants();

        // Poll every 2 seconds for real-time updates
        const interval = setInterval(fetchParticipants, 2000);

        return () => clearInterval(interval);
    }, [meetingId, isLive]);

    if (!isLive) {
        return null;
    }

    // Sort: hosts first, then by name
    const sorted = [...participants].sort((a, b) => {
        if (a.host !== b.host) return a.host ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
    });

    return (
        <div className="bg-background-card rounded-lg border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-white/5">
                <Users size={16} className="text-accent-blue" />
                <h3 className="font-semibold text-text-primary text-sm">
                    Participants ({participants.length})
                </h3>
            </div>

            {/* Participants List */}
            <div className="max-h-80 overflow-y-auto">
                {loading && participants.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-text-secondary">
                        <Loader2 size={16} className="animate-spin" />
                    </div>
                ) : participants.length === 0 ? (
                    <div className="p-3 text-center text-text-secondary text-xs">
                        No participants yet
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {sorted.map((participant) => {
                            // Check if this is the current user by UID
                            const isCurrentUser = participant.agoraUid === currentUserUid;
                            
                            let displayLabel = '';
                            if (participant.host) {
                                displayLabel = ' (Host)';
                            } else if (isCurrentUser) {
                                displayLabel = ' (you)';
                            }

                            return (
                                <div
                                    key={participant.agoraUid}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                                    <p className="text-xs text-text-primary truncate flex-1">
                                        {participant.displayName}
                                        <span className="text-accent-blue">{displayLabel}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
