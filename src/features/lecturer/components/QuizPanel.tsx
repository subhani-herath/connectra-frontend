import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Play, Square, BarChart3, Loader2, X, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { quizService, type Quiz, type CreateQuizRequest, type QuizResultsSummary } from '../../../services/quizService';
import { Input } from '../../../components/ui/Input';

interface QuizPanelProps {
    meetingId: string;
    isMeetingLive: boolean;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ meetingId, isMeetingLive }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedResults, setSelectedResults] = useState<{
        quizId: number;
        results: QuizResultsSummary;
    } | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateQuizRequest>();

    const fetchQuizzes = async () => {
        try {
            const data = await quizService.getQuizzes(meetingId);
            setQuizzes(data);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [meetingId]);

    const handleCreate = async (data: CreateQuizRequest) => {
        setIsCreating(true);
        try {
            await quizService.createQuiz(meetingId, data);
            toast.success('Quiz created!');
            reset();
            setShowCreateForm(false);
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to create quiz');
        } finally {
            setIsCreating(false);
        }
    };

    const handleLaunch = async (quizId: number) => {
        if (!isMeetingLive) {
            toast.error('Meeting must be live to launch quiz');
            return;
        }
        try {
            await quizService.launchQuiz(quizId);
            toast.success('Quiz launched!');
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to launch quiz');
        }
    };

    const handleEnd = async (quizId: number) => {
        try {
            await quizService.endQuiz(quizId);
            toast.success('Quiz ended');
            fetchQuizzes();
        } catch (error) {
            toast.error('Failed to end quiz');
        }
    };

    const handleViewResults = async (quizId: number) => {
        try {
            const results = await quizService.getQuizResults(quizId);
            setSelectedResults({ quizId, results });
        } catch (error) {
            toast.error('Failed to fetch results');
        }
    };

    return (
        <div className="bg-background-card rounded-xl border border-white/5 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Quiz Panel</h3>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-all"
                >
                    {showCreateForm ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <form onSubmit={handleSubmit(handleCreate)} className="space-y-3 mb-4 p-3 bg-background-surface rounded-lg">
                    <Input
                        placeholder="Question"
                        error={errors.questionText?.message}
                        {...register('questionText', { required: 'Required' })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            placeholder="Option A"
                            error={errors.optionA?.message}
                            {...register('optionA', { required: 'Required' })}
                        />
                        <Input
                            placeholder="Option B"
                            error={errors.optionB?.message}
                            {...register('optionB', { required: 'Required' })}
                        />
                        <Input
                            placeholder="Option C"
                            error={errors.optionC?.message}
                            {...register('optionC', { required: 'Required' })}
                        />
                        <Input
                            placeholder="Option D"
                            error={errors.optionD?.message}
                            {...register('optionD', { required: 'Required' })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="bg-background-dark text-text-primary rounded-lg px-3 py-2 text-sm border border-transparent focus:border-primary outline-none"
                            {...register('correctAnswer', { required: true })}
                        >
                            <option value="">Correct?</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                        <Input
                            type="number"
                            placeholder="Time (s)"
                            {...register('timeLimitSeconds', { required: true, valueAsNumber: true, min: 10 })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                        {isCreating ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Create Quiz'}
                    </button>
                </form>
            )}

            {/* Quiz List */}
            <div className="space-y-2 max-h-80 overflow-auto">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-primary" size={20} />
                    </div>
                ) : quizzes.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-4">No quizzes yet</p>
                ) : (
                    quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="p-3 bg-background-surface rounded-lg border border-white/5"
                        >
                            <p className="text-sm text-text-primary line-clamp-2 mb-2">{quiz.question}</p>
                            <div className="flex items-center gap-2">
                                {quiz.isActive ? (
                                    <>
                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-status-live/20 text-status-live animate-pulse">
                                            ACTIVE
                                        </span>
                                        <button
                                            onClick={() => handleEnd(quiz.id)}
                                            className="p-1.5 rounded bg-status-error/20 hover:bg-status-error/30 text-status-error transition-all"
                                            title="End Quiz"
                                        >
                                            <Square size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleLaunch(quiz.id)}
                                            disabled={!isMeetingLive}
                                            className="p-1.5 rounded bg-status-success/20 hover:bg-status-success/30 text-status-success transition-all disabled:opacity-50"
                                            title="Launch Quiz"
                                        >
                                            <Play size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleViewResults(quiz.id)}
                                            className="p-1.5 rounded bg-primary/20 hover:bg-primary/30 text-primary transition-all"
                                            title="View Results"
                                        >
                                            <BarChart3 size={14} />
                                        </button>
                                    </>
                                )}
                                <div className="flex items-center gap-1 ml-auto text-xs text-text-muted">
                                    <Clock size={12} />
                                    {quiz.timeLimitSeconds}s
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Results Modal */}
            {selectedResults && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-background-card rounded-2xl p-6 max-w-md w-full border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text-primary">Quiz Results</h3>
                            <button
                                onClick={() => setSelectedResults(null)}
                                className="p-1 rounded hover:bg-background-surface text-text-muted"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-background-surface rounded-lg">
                                <span className="text-text-secondary">Total Responses</span>
                                <span className="text-text-primary font-semibold">{selectedResults.results.totalResponses}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-status-success/10 rounded-lg">
                                <span className="text-status-success">Correct</span>
                                <span className="text-status-success font-semibold">{selectedResults.results.correctResponses}</span>
                            </div>

                            <div className="pt-2 space-y-2">
                                {['A', 'B', 'C', 'D'].map((option) => {
                                    const count = selectedResults.results[`option${option}Count` as keyof QuizResultsSummary] as number;
                                    const isCorrect = selectedResults.results.correctAnswer === option;
                                    const percentage = selectedResults.results.totalResponses
                                        ? Math.round((count / selectedResults.results.totalResponses) * 100)
                                        : 0;

                                    return (
                                        <div key={option} className="flex items-center gap-2">
                                            <span className={`w-6 text-sm font-medium ${isCorrect ? 'text-status-success' : 'text-text-secondary'}`}>
                                                {option}
                                            </span>
                                            <div className="flex-1 h-6 bg-background-surface rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${isCorrect ? 'bg-status-success' : 'bg-primary/50'} transition-all`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-12 text-right text-sm text-text-secondary">{count}</span>
                                            {isCorrect && <Check size={14} className="text-status-success" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
