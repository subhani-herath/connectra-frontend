import { Hand, Check } from 'lucide-react';

interface HandRaise {
    uid: number;
    name: string;
    timestamp: number;
}

interface RaiseHandPanelProps {
    handRaises: Map<number, HandRaise>;
    isLecturer: boolean;
    onRaiseHand: () => void;
    onLowerHand: (uid: number) => void;
    hasRaisedHand: boolean;
    currentUserUid?: number;
}

export const RaiseHandPanel: React.FC<RaiseHandPanelProps> = ({
    handRaises,
    isLecturer,
    onRaiseHand,
    onLowerHand,
    hasRaisedHand,
    currentUserUid = 0,
}) => {
    const handRaisesList = Array.from(handRaises.values());

    return (
        <div className="flex flex-col gap-4">
            {/* Student/Participant Controls */}
            {!isLecturer && (
                <div className="flex gap-2">
                    {!hasRaisedHand ? (
                        <button
                            onClick={onRaiseHand}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            <Hand size={16} />
                            Raise Hand
                        </button>
                    ) : (
                        <button
                            onClick={() => onLowerHand(currentUserUid)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium border border-red-500/30"
                        >
                            <Hand size={16} />
                            Lower Hand
                        </button>
                    )}
                </div>
            )}

            {/* Hands Raised List */}
            <div className="flex flex-col gap-2">
                {handRaisesList.length === 0 ? (
                    <div className="text-center py-4 text-text-secondary text-sm">
                        {isLecturer ? 'No hands raised' : 'Raise your hand to ask a question'}
                    </div>
                ) : (
                    <>
                        <h4 className="text-sm font-semibold text-text-primary mb-2">
                            Hands Raised ({handRaisesList.length})
                        </h4>
                        {handRaisesList.map((hand, idx) => (
                            <div key={idx} className="p-2 bg-background-input rounded-lg border border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Hand size={14} className="text-accent-orange" />
                                        <span className="text-sm text-text-primary">{hand.name}</span>
                                    </div>
                                    {isLecturer && (
                                        <button
                                            onClick={() => onLowerHand(hand.uid)}
                                            className="text-xs px-2 py-1 bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue rounded transition-colors"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-text-secondary">
                                    {new Date(hand.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
