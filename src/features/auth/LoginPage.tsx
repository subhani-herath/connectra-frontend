import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService, type LoginRequest } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import logoWhite from '../../assets/logo-white.png';
import logo from '../../assets/logo.png';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>();

    const onSubmit = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            const firstName = response.email.split('@')[0].split('.')[0];
            login({ email: response.email, role: response.role, firstName }, response.accessToken);
            toast.success(`Welcome back, ${firstName}!`);

            switch (response.role) {
                case 'STUDENT':
                    navigate('/student/dashboard');
                    break;
                case 'LECTURER':
                    navigate('/lecturer/dashboard');
                    break;
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

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
                        <img src={logoWhite} alt="Connectra" className="h-10" />
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            Welcome to Connectra
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            Your University's Secure Meeting Platform.
                            <br />
                            Connecting Minds. Digitally.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <img src={logo} alt="Connectra" className="h-10 mx-auto" />
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign In</h2>
                        <p className="text-slate-500">Secure access for verified users.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                University Email
                            </label>
                            <input
                                type="email"
                                placeholder="example@uwu.ac.lk"
                                className={`w-full px-4 py-3 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all ${errors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                                    }`}
                                {...register('email', { required: 'Email is required' })}
                            />
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
                                    placeholder="Enter your password"
                                    className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all ${errors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                            : 'border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                                        }`}
                                    {...register('password', { required: 'Password is required' })}
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

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Forgot Password?
                            </button>
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
                                    Signing in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-4">
                        <div className="flex items-center justify-center gap-4 text-sm">
                            <button className="text-teal-600 hover:text-teal-700 font-medium">
                                Help
                            </button>
                            <span className="text-slate-300">•</span>
                            <button className="text-teal-600 hover:text-teal-700 font-medium">
                                Support
                            </button>
                        </div>

                        <p className="text-sm text-slate-500">
                            New Student?{' '}
                            <Link
                                to="/register"
                                className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
