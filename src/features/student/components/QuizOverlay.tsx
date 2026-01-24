import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService, type ActiveQuiz } from '../../../services/quizService';

interface QuizOverlayProps {
    meetingId: string;
}

export const QuizOverlay: React.FC<QuizOverlayProps> = ({ meetingId }) => {
    const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
    const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    // Get answered quiz IDs from session storage
    const getAnsweredQuizIds = (): number[] => {
        try {
            const stored = sessionStorage.getItem('answeredQuizIds');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const markQuizAsAnswered = (quizId: number) => {
        const answered = getAnsweredQuizIds();
        if (!answered.includes(quizId)) {
            sessionStorage.setItem('answeredQuizIds', JSON.stringify([...answered, quizId]));
        }
    };

    // Poll for active quiz
    const checkActiveQuiz = useCallback(async () => {
        try {
            const quiz = await quizService.getActiveQuiz(meetingId);

            if (quiz) {
                const answeredIds = getAnsweredQuizIds();
                if (answeredIds.includes(quiz.id)) {
                    // Already answered this quiz
                    setActiveQuiz(null);
                    return;
                }

                setActiveQuiz(quiz);
                setTimeRemaining(quiz.timeRemainingSeconds);
                setSelectedOption(null);
                setHasAnswered(false);
            } else {
                setActiveQuiz(null);
            }
        } catch (error) {
            console.error('Failed to check active quiz:', error);
        }
    }, [meetingId]);

    // Poll every 5 seconds
    useEffect(() => {
        checkActiveQuiz();
        const interval = setInterval(checkActiveQuiz, 5000);
        return () => clearInterval(interval);
    }, [checkActiveQuiz]);

    // Timer countdown
    useEffect(() => {
        if (!activeQuiz || hasAnswered) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    // Time's up
                    setActiveQuiz(null);
                    toast.error("Time's up!");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [activeQuiz, hasAnswered]);

    const handleSubmit = async () => {
        if (!activeQuiz || !selectedOption) return;

        setIsSubmitting(true);
        try {
            await quizService.submitResponse(activeQuiz.id, selectedOption);
            markQuizAsAnswered(activeQuiz.id);
            setHasAnswered(true);
            toast.success('Answer submitted!');

            // Close overlay after a short delay
            setTimeout(() => {
                setActiveQuiz(null);
            }, 2000);
        } catch (error) {
            toast.error('Failed to submit answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!activeQuiz) return null;

    const options: { key: 'A' | 'B' | 'C' | 'D'; value: string }[] = [
        { key: 'A', value: activeQuiz.optionA },
        { key: 'B', value: activeQuiz.optionB },
        { key: 'C', value: activeQuiz.optionC },
        { key: 'D', value: activeQuiz.optionD },
    ];

    const timerPercentage = activeQuiz.timeRemainingSeconds
        ? (timeRemaining / activeQuiz.timeRemainingSeconds) * 100
        : 0;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-background-card rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl">
                {hasAnswered ? (
                    // Success State
                    <div className="text-center py-8">
                        <CheckCircle className="w-20 h-20 text-status-success mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Answer Submitted!</h2>
                        <p className="text-text-secondary">Your response has been recorded.</p>
                    </div>
                ) : (
                    <>
                        {/* Timer Bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-text-secondary">Time Remaining</span>
                                <div className="flex items-center gap-2 text-status-warning">
                                    <Clock size={16} />
                                    <span className="font-mono font-semibold">{timeRemaining}s</span>
                                </div>
                            </div>
                            <div className="h-2 bg-background-surface rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${timerPercentage > 30 ? 'bg-primary' : 'bg-status-warning'
                                        } ${timerPercentage <= 10 ? 'animate-pulse bg-status-error' : ''}`}
                                    style={{ width: `${timerPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Question */}
                        <div className="mb-6">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Quiz Question</span>
                            <h2 className="text-xl font-semibold text-text-primary mt-2">{activeQuiz.question}</h2>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            {options.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => setSelectedOption(option.key)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedOption === option.key
                                        ? 'border-primary bg-primary/10 text-text-primary'
                                        : 'border-white/5 bg-background-surface text-text-secondary hover:border-white/20 hover:bg-background-surface/80'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${selectedOption === option.key
                                                ? 'bg-primary text-white'
                                                : 'bg-background-dark text-text-muted'
                                                }`}
                                        >
                                            {option.key}
                                        </span>
                                        <span className="flex-1">{option.value}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOption || isSubmitting}
                            className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Answer'
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
