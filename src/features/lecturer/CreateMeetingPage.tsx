import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, Users, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Input } from '../../components/ui/Input';
import { meetingService, type CreateMeetingRequest } from '../../services/meetingService';
import { TopHeader } from '../../components/layout';

interface CreateMeetingFormData {
    title: string;
    description: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    degree: string;
    batch: string;
}

// Use short degree codes to match backend extraction from email (e.g., ict22099@std.uwu.ac.lk -> ICT)
const DEGREES = [
    { code: 'ICT', name: 'Information and Communication Technology' },
    { code: 'BBST', name: 'Bio Business Science and Technology' },
    { code: 'BET', name: 'Bio Engineering Technology' },
    { code: 'SCT', name: 'Science and Technology' },
    { code: 'IIT', name: 'Industrial Information Technology' },
    { code: 'CS', name: 'Computer Science' },
    { code: 'SE', name: 'Software Engineering' },
    { code: 'DS', name: 'Data Science' },
];

// Use 2-digit batch to match backend extraction (e.g., ict22099 -> batch 22)
const BATCHES = ['20', '21', '22', '23', '24', '25'];

export const CreateMeetingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<CreateMeetingFormData>();

    const startTime = watch('scheduledStartTime');

    const onSubmit = async (data: CreateMeetingFormData) => {
        // Validate end time is after start time
        if (data.scheduledEndTime <= data.scheduledStartTime) {
            toast.error('End time must be after start time');
            return;
        }

        setIsLoading(true);
        try {
            const payload: CreateMeetingRequest = {
                title: data.title,
                description: data.description || undefined,
                // Backend expects LocalDateTime format: 2026-01-12T10:00:00 (no timezone Z)
                scheduledStartTime: data.scheduledStartTime,
                scheduledEndTime: data.scheduledEndTime,
                targetDegree: data.degree,
                targetBatch: parseInt(data.batch, 10),
            };

            await meetingService.createMeeting(payload);
            toast.success('Meeting scheduled successfully!');
            navigate('/lecturer/dashboard');
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Failed to create meeting');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <TopHeader
                title="Schedule Meeting"
            />

            <main className="p-6">
                <div className="max-w-3xl mx-auto bg-background-card rounded-2xl border border-white/5 p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <Input
                            label="Meeting Title"
                            placeholder="e.g., Database Management - Lecture 5"
                            icon={<FileText size={18} />}
                            error={errors.title?.message}
                            {...register('title', {
                                required: 'Title is required',
                                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                            })}
                        />

                        {/* Description */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Description (Optional)
                            </label>
                            <textarea
                                placeholder="Brief description of the session topics..."
                                className="w-full bg-background-surface text-text-primary rounded-lg border border-transparent px-4 py-2.5 outline-none transition-all placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
                                {...register('description')}
                            />
                        </div>

                        {/* Date/Time Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    <span className="flex items-center gap-2">
                                        <Calendar size={14} /> Start Date & Time
                                    </span>
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-background-surface text-text-primary rounded-lg border border-transparent px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                    {...register('scheduledStartTime', {
                                        required: 'Start time is required',
                                    })}
                                />
                                {errors.scheduledStartTime && (
                                    <p className="mt-1 text-xs text-status-error animate-pulse">
                                        {errors.scheduledStartTime.message}
                                    </p>
                                )}
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    <span className="flex items-center gap-2">
                                        <Clock size={14} /> End Date & Time
                                    </span>
                                </label>
                                <input
                                    type="datetime-local"
                                    min={startTime}
                                    className="w-full bg-background-surface text-text-primary rounded-lg border border-transparent px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                    {...register('scheduledEndTime', {
                                        required: 'End time is required',
                                    })}
                                />
                                {errors.scheduledEndTime && (
                                    <p className="mt-1 text-xs text-status-error animate-pulse">
                                        {errors.scheduledEndTime.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Degree & Batch */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    <span className="flex items-center gap-2">
                                        <BookOpen size={14} /> Degree Program
                                    </span>
                                </label>
                                <select
                                    className="w-full bg-background-surface text-text-primary rounded-lg border border-transparent px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                    {...register('degree', { required: 'Degree is required' })}
                                >
                                    <option value="">Select Degree</option>
                                    {DEGREES.map((degree) => (
                                        <option key={degree.code} value={degree.code}>
                                            {degree.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.degree && (
                                    <p className="mt-1 text-xs text-status-error animate-pulse">
                                        {errors.degree.message}
                                    </p>
                                )}
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    <span className="flex items-center gap-2">
                                        <Users size={14} /> Batch
                                    </span>
                                </label>
                                <select
                                    className="w-full bg-background-surface text-text-primary rounded-lg border border-transparent px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                    {...register('batch', { required: 'Batch is required' })}
                                >
                                    <option value="">Select Batch</option>
                                    {BATCHES.map((batch) => (
                                        <option key={batch} value={batch}>
                                            {batch}
                                        </option>
                                    ))}
                                </select>
                                {errors.batch && (
                                    <p className="mt-1 text-xs text-status-error animate-pulse">
                                        {errors.batch.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => navigate('/lecturer/dashboard')}
                                className="flex-1 bg-background-surface hover:bg-background-surface/80 text-text-secondary font-medium py-3 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    'Schedule Meeting'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};
