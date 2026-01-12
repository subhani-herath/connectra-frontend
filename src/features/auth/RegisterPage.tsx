import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterFormData>();

    const emailValue = watch('email');

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await authService.register(data);

            toast.success('Account created! Please login.');
            navigate('/login');
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const isValidEmail = emailValue?.endsWith('@std.uwu.ac.lk');

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
            <div className="w-full max-w-md space-y-6 bg-background-card p-8 rounded-2xl shadow-xl border border-white/5">
                {/* Back Link */}
                <Link
                    to="/login"
                    className="text-text-secondary hover:text-primary inline-flex items-center gap-2 text-sm transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-status-success/10 mb-4">
                        <User className="w-7 h-7 text-status-success" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary">Create Student Account</h1>
                    <p className="text-text-secondary mt-2">Join your batch on Connectra</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            placeholder="John"
                            error={errors.firstName?.message}
                            {...register('firstName', { required: 'Required' })}
                        />
                        <Input
                            label="Last Name"
                            placeholder="Doe"
                            error={errors.lastName?.message}
                            {...register('lastName', { required: 'Required' })}
                        />
                    </div>

                    {/* Email with Validation Indicator */}
                    <div className="relative">
                        <Input
                            label="Student Email"
                            type="email"
                            placeholder="ict22001@std.uwu.ac.lk"
                            icon={<Mail size={18} />}
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@std\.uwu\.ac\.lk$/,
                                    message: 'Must be a valid student email (@std.uwu.ac.lk)',
                                },
                            })}
                        />
                        {/* Visual Helper for Email Validity */}
                        {emailValue && isValidEmail && (
                            <span className="absolute right-3 top-[38px] text-status-success text-xs font-bold">
                                ✓ Valid
                            </span>
                        )}
                    </div>

                    {/* Password */}
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        icon={<Lock size={18} />}
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Min 6 characters' },
                        })}
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Terms */}
                <p className="text-xs text-text-muted text-center">
                    By creating an account, you agree to the Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};
