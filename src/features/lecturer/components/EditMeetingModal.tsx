import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Calendar, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    meetingService,
    type Meeting,
    type UpdateMeetingRequest,
} from '../../../services/meetingService';
import { Input } from '../../../components/ui/Input';

interface EditMeetingModalProps {
    meeting: Meeting;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const formatDateTimeLocal = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const EditMeetingModal: React.FC<EditMeetingModalProps> = ({
    meeting,
    isOpen,
    onClose,
    onUpdated,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdateMeetingRequest>({
        defaultValues: {
            title: meeting.title,
            description: meeting.description || '',
            scheduledStartTime: formatDateTimeLocal(meeting.scheduledStartTime),
            scheduledEndTime: formatDateTimeLocal(meeting.scheduledEndTime),
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                title: meeting.title,
                description: meeting.description || '',
                scheduledStartTime: formatDateTimeLocal(meeting.scheduledStartTime),
                scheduledEndTime: formatDateTimeLocal(meeting.scheduledEndTime),
            });
        }
    }, [meeting, isOpen, reset]);

    const onSubmit = async (data: UpdateMeetingRequest) => {
        setIsSubmitting(true);
        try {
            await meetingService.updateMeeting(meeting.meetingId, {
                ...data,
                scheduledStartTime: data.scheduledStartTime
                    ? new Date(data.scheduledStartTime).toISOString()
                    : undefined,
                scheduledEndTime: data.scheduledEndTime
                    ? new Date(data.scheduledEndTime).toISOString()
                    : undefined,
            });
            toast.success('Meeting updated successfully');
            onUpdated();
            onClose();
        } catch (error) {
            console.error('Failed to update meeting:', error);
            toast.error('Failed to update meeting');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-background-card rounded-2xl p-6 max-w-lg w-full border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Edit Meeting</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-background-surface text-text-muted hover:text-text-primary transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            <FileText size={14} className="inline mr-1.5" />
                            Title
                        </label>
                        <Input
                            placeholder="Meeting title"
                            error={errors.title?.message}
                            {...register('title', { required: 'Title is required' })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Description
                        </label>
                        <textarea
                            placeholder="Optional description..."
                            className="w-full bg-background-surface text-text-primary rounded-xl px-4 py-3 text-sm border border-transparent focus:border-primary outline-none resize-none h-20"
                            {...register('description')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                <Calendar size={14} className="inline mr-1.5" />
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full bg-background-surface text-text-primary rounded-xl px-4 py-3 text-sm border border-transparent focus:border-primary outline-none"
                                {...register('scheduledStartTime', { required: 'Start time is required' })}
                            />
                            {errors.scheduledStartTime && (
                                <p className="text-status-error text-xs mt-1">{errors.scheduledStartTime.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                <Clock size={14} className="inline mr-1.5" />
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full bg-background-surface text-text-primary rounded-xl px-4 py-3 text-sm border border-transparent focus:border-primary outline-none"
                                {...register('scheduledEndTime', { required: 'End time is required' })}
                            />
                            {errors.scheduledEndTime && (
                                <p className="text-status-error text-xs mt-1">{errors.scheduledEndTime.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-background-surface hover:bg-background-dark text-text-secondary font-medium py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
