import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import logoWhite from '../../assets/logo-white.png';
import logo from '../../assets/logo.png';
import heroBg from '../../../public/hero-bg.png';

/**
 * OTP Verification Page Component
 * Allows users to verify their email address using a 6-digit OTP code
 */
export const OtpVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            toast.error('No email provided. Please register first.');
            navigate('/register');
        }
    }, [email, navigate]);

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Handle OTP input change
    const handleChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input on digit entry
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace key
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Check if pasted content is a 6-digit number
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs.current[5]?.focus();
        }
    };

    // Submit OTP verification
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyEmail({ email, otp: otpCode });
            toast.success('Email verified successfully! You are now logged in.');
            navigate('/'); // Redirect to home/dashboard
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Verification failed');
            // Clear OTP on error
            setOtp(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        try {
            await authService.resendOtp({ email });
            toast.success('A new verification code has been sent!');
            setResendCooldown(60); // 60 second cooldown
            setOtp(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroBg})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-transparent" />
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div>
                        <img src={logoWhite} alt="Connectra" className="h-10" />
                    </div>
                    <div className="mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            Verify Your Email
                        </h2>
                        <p className="text-lg text-white/80 max-w-md">
                            We've sent a verification code to your student email.
                            <br />
                            Enter the code to complete your registration.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - OTP Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <img src={logo} alt="Connectra" className="h-10 mx-auto" />
                    </div>

                    {/* Back Link */}
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to registration
                    </Link>

                    {/* Form Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-teal-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Check Your Email</h2>
                        <p className="text-slate-500">
                            We sent a verification code to
                            <br />
                            <span className="font-medium text-slate-700">{email}</span>
                        </p>
                    </div>

                    {/* OTP Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input Fields */}
                        <div className="flex gap-3 justify-center">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg 
                                             focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none transition-all
                                             bg-white text-slate-800"
                                    disabled={isLoading}
                                />
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || otp.join('').length !== 6}
                            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-lg 
                                     transition-all flex items-center justify-center gap-2 disabled:opacity-70 
                                     disabled:cursor-not-allowed shadow-lg shadow-teal-700/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </button>
                    </form>

                    {/* Resend Section */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 mb-3">
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || isResending}
                            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium 
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Sending...
                                </>
                            ) : resendCooldown > 0 ? (
                                <>
                                    <RefreshCw size={16} />
                                    Resend in {resendCooldown}s
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={16} />
                                    Resend Code
                                </>
                            )}
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 text-center">
                            The verification code expires in <strong>10 minutes</strong>.
                            <br />
                            If you don't see the email, check your spam folder.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
