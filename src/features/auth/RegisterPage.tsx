import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterFormData>();

    const emailValue = watch('email');
    const passwordValue = watch('password');

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
        <div className="min-h-screen flex">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(/hero-bg.png)' }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Connectra</h1>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            Join Connectra
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Create your student account and connect with your batch.
                            <br />
                            Your Academic Journey Starts Here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Connectra</h1>
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
                        <p className="text-slate-500">Join your batch on Connectra</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all ${errors.firstName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                                        }`}
                                    {...register('firstName', { required: 'First name is required' })}
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all ${errors.lastName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                                        }`}
                                    {...register('lastName', { required: 'Last name is required' })}
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Student Email
                            </label>
                            <input
                                type="email"
                                placeholder="ict22001@std.uwu.ac.lk"
                                className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all ${errors.email
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                                    }`}
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
                                <span className="absolute right-3 top-[38px] text-green-600 text-xs font-bold">
                                    ✓ Valid
                                </span>
                            )}
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all ${errors.password
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                                        }`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Min 6 characters' },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Re-enter your password"
                                    className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all ${errors.confirmPassword
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                                        }`}
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (value) =>
                                            value === passwordValue || 'Passwords do not match',
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-teal-700/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-xs text-slate-400">
                            By creating an account, you agree to the Terms of Service and Privacy Policy.
                        </p>

                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
