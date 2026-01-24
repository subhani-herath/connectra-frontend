import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    adminService,
    type Lecturer,
    type UpdateLecturerRequest,
} from '../../../services/adminService';
import { Input } from '../../../components/ui/Input';

interface EditLecturerModalProps {
    lecturer: Lecturer;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export const EditLecturerModal: React.FC<EditLecturerModalProps> = ({
    lecturer,
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
    } = useForm<UpdateLecturerRequest>({
        defaultValues: {
            firstName: lecturer.firstName,
            lastName: lecturer.lastName,
            email: lecturer.email,
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                firstName: lecturer.firstName,
                lastName: lecturer.lastName,
                email: lecturer.email,
            });
        }
    }, [lecturer, isOpen, reset]);

    const onSubmit = async (data: UpdateLecturerRequest) => {
        setIsSubmitting(true);
        try {
            await adminService.updateLecturer(lecturer.id, data);
            toast.success('Lecturer updated successfully');
            onUpdated();
            onClose();
        } catch (error) {
            console.error('Failed to update lecturer:', error);
            toast.error('Failed to update lecturer');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-background-card rounded-2xl p-6 max-w-md w-full border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary">Edit Lecturer</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-background-surface text-text-muted hover:text-text-primary transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                <User size={14} className="inline mr-1.5" />
                                First Name
                            </label>
                            <Input
                                placeholder="First name"
                                error={errors.firstName?.message}
                                {...register('firstName', { required: 'Required' })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Last Name
                            </label>
                            <Input
                                placeholder="Last name"
                                error={errors.lastName?.message}
                                {...register('lastName', { required: 'Required' })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            <Mail size={14} className="inline mr-1.5" />
                            Email
                        </label>
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Invalid email format',
                                },
                            })}
                        />
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
