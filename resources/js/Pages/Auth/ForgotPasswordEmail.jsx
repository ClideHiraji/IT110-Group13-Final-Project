import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

/**
 * ForgotPasswordEmail Page
 * 
 * Step 1 of the password reset flow:
 * - Collects the user's email address.
 * - Submits to the password.send.otp route to send a verification code (OTP).
 * 
 * Features:
 * - Animated loading overlay while the OTP email is being sent.
 * - Status banner for success messages from the backend.
 * - Dark themed UI with gradient card and accent elements.
 */
export default function ForgotPasswordEmail({ status }) {
    // Inertia useForm hook to manage email field, errors, and submission state
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    /**
     * Form submit handler.
     * Prevents default browser form submission and sends a POST request
     * to the password.send.otp route to trigger sending the OTP code.
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('password.send.otp'));
    };

    return (
        <>
            {/* Set browser tab title for this page */}
            <Head title="Forgot Password" />
            
            {/* Full-screen black background with centered container */}
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 px-10 py-10 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-xl relative">
                    {/* Loading Overlay with Animation */}
                    {/* Appears on top of the card while the form is processing */}
                    {processing && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl z-50 flex flex-col items-center justify-center">
                            {/* Animated Envelope Icon */}
                            <div className="relative mb-6">
                                {/* Expanding ping circle behind the envelope */}
                                <div className="absolute inset-0 w-24 h-24 -m-2 bg-amber-400/20 rounded-full animate-ping"></div>
                                
                                {/* Main envelope icon with bounce animation */}
                                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                                    <svg
                                        className="w-10 h-10 text-black"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    
                                    {/* Small pinging mail accent in the corner */}
                                    <svg
                                        className="absolute w-6 h-6 text-amber-300 animate-ping"
                                        style={{ top: '-10px', right: '-10px' }}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Loading text and dot indicators */}
                            <div className="text-center space-y-3">
                                <p className="text-amber-400 font-ui text-lg font-semibold animate-pulse">
                                    Sending OTP Code
                                </p>
                                <p className="text-[#F8F7F3]/50 font-ui text-sm">
                                    Please wait while we send a verification code to your email
                                </p>
                                
                                <div className="flex items-center justify-center space-x-2 pt-2">
                                    <div
                                        className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '0ms' }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '150ms' }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                                        style={{ animationDelay: '300ms' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Decorative top accent bar */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Circular gradient icon with key/lock symbol */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <svg
                                    className="w-8 h-8 text-black"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                    />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Title and description */}
                        <h2 className="mt-6 text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            Reset Password
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            Enter your email address and we'll send you a verification code
                        </p>
                    </div>

                    {/* Status message from backend (e.g., email sent) */}
                    {status && (
                        <div className="mb-6 bg-green-500/10 border-l-4 border-green-400 p-4 rounded">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm font-ui text-green-200">{status}</p>
                            </div>
                        </div>
                    )}

                    {/* Main form for entering email */}
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            {/* Email label */}
                            <InputLabel
                                htmlFor="email"
                                value="Email Address"
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            {/* Email input field */}
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-2 block w-full px-4 py-3 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                placeholder="your.email@example.com"
                                required
                                autoFocus
                            />
                            {/* Validation error display for email field */}
                            <InputError message={errors.email} className="mt-2 text-amber-400" />
                        </div>

                        <div className="space-y-4">
                            {/* Submit button to request OTP */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                            >
                                {processing ? (
                                    <>
                                        {/* Inline spinner shown while request is in progress */}
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>

                            {/* Link to go back to login page */}
                            <Link
                                href={route('login')}
                                className="block text-center text-sm font-ui text-amber-400 hover:text-orange-400 transition-colors duration-200"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </form>

                    {/* Footer */}
                    {/* Small lock icon and message about secure recovery */}
                    <div className="pt-6 mt-6 border-t border-amber-500/20">
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-xs font-ui text-[#F8F7F3]/60">
                                Secure password recovery
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
