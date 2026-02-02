import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
    senderUid: number;
    senderName: string;
    message: string;
    timestamp: number;
}

interface LiveChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
}

export const LiveChatPanel: React.FC<LiveChatPanelProps> = ({ messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-text-secondary text-sm">
                        No messages yet
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className="text-sm">
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-accent-blue text-xs">
                                    {msg.senderName}
                                </span>
                                <span className="text-text-secondary text-xs">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <p className="text-text-primary mt-1 break-words">{msg.message}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2 mt-auto">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-background-input text-text-primary rounded-lg border border-white/5 text-sm focus:outline-none focus:border-accent-blue/50 placeholder-text-secondary"
                />
                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="p-2 bg-accent-blue hover:bg-accent-blue/80 disabled:bg-text-secondary/30 text-white rounded-lg transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};
