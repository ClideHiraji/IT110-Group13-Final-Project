import { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';

/**
 * VerifyOtp Component
 *
 * Handles email verification using a 6‑digit one-time password (OTP).
 *
 * Responsibilities:
 * - Displays the email address the OTP was sent to.
 * - Renders 6 individual inputs for the OTP digits with:
 *   - Auto-focus on the first input when the component mounts.
 *   - Numeric-only validation.
 *   - Auto-advance to the next input when a digit is typed.
 *   - Backspace navigation to the previous input when empty.
 *   - Paste support to fill all 6 digits at once.
 * - Submits the OTP to the verification.verify route using Inertia's useForm.
 * - Shows a verifying overlay while the request is in progress.
 * - Handles OTP resend flow with:
 *   - POST to verification.resend.
 *   - Success banner on successful resend.
 *   - 60-second cooldown timer disabling the resend button.
 *
 * Props:
 * - email {string}: Email address where the verification code was sent.
 *
 * Form shape (useForm):
 * - otp: string[6] – array of 6 characters, one per OTP digit.
 */
export default function VerifyOtp({ email }) {
    // Inertia form state for the 6-digit OTP and submission metadata
    const { data, setData, post, processing, errors } = useForm({
        otp: ['', '', '', '', '', ''],
    });

    // Refs to each OTP input for focus control (next/previous/initial)
    const inputRefs = useRef([]);

    // Whether a resend OTP request is currently in progress
    const [resending, setResending] = useState(false);

    // Whether a resend attempt recently succeeded (controls green alert)
    const [resendSuccess, setResendSuccess] = useState(false);

    // Seconds remaining before user can resend OTP again
    const [cooldown, setCooldown] = useState(0);

    // On first render: focus the first OTP input automatically
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Cooldown timer effect: counts down to 0 at 1-second intervals
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    /**
     * Handle changes to a single OTP input.
     * - Allows only numeric characters.
     * - Stores only the last typed digit at the given index.
     * - Automatically focuses the next input when a digit is entered.
     */
    const handleChange = (index, value) => {
        // Block non-numeric input
        if (!/^\d*$/.test(value)) return;

        // Copy current OTP array and update the target index
        const newOtp = [...data.otp];
        newOtp[index] = value.slice(-1);
        setData('otp', newOtp);

        // Move focus to the next input when a digit is entered (except last index)
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    /**
     * Handle key presses in OTP inputs.
     * - When Backspace is pressed on an empty field, moves focus back.
     */
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !data.otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    /**
     * Handle paste event across OTP inputs.
     * - Reads up to 6 characters from the clipboard.
     * - Validates numeric content.
     * - Fills the OTP array from the pasted digits.
     * - Focuses the first empty input or the last one if all are filled.
     */
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setData('otp', newOtp);

        const nextEmptyIndex = newOtp.findIndex(digit => !digit);
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    /**
     * Submit handler for verifying the OTP.
     * - Sends the current OTP array to the verification.verify route.
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('verification.verify'));
    };

    /**
     * Resend OTP handler.
     * - Prevents resend when cooldown is active or a resend is ongoing.
     * - Sends POST to verification.resend with CSRF protection.
     * - On success:
     *   - Shows a temporary success banner.
     *   - Starts a 60-second cooldown.
     */
    const resendOtp = async () => {
        // Prevent spamming resend while in cooldown or while request is in flight
        if (cooldown > 0 || resending) return;

        setResending(true);
        setResendSuccess(false);

        try {
            const response = await fetch(route('verification.resend'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            if (response.ok) {
                setResendSuccess(true);
                setCooldown(60);
                // Hide success message after 3 seconds
                setTimeout(() => setResendSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            {/* Sets the page title for this view */}
            <Head title="Verify OTP" />
            
            {/* Pure black background with centered verification card */}
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 px-10 py-10 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-xl relative">
                    {/* Verifying OTP animation overlay shown while processing is true */}
                    {processing && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl z-50 flex flex-col items-center justify-center">
                            {/* Animated Shield Icon */}
                            <div className="relative mb-6">
                                {/* Expanding ping circles behind the shield */}
                                <div className="absolute inset-0 w-24 h-24 -m-2 bg-amber-400/20 rounded-full animate-ping"></div>
                                <div
                                    className="absolute inset-0 w-24 h-24 -m-4 bg-orange-400/10 rounded-full animate-ping"
                                    style={{ animationDelay: '150ms' }}
                                ></div>
                                
                                {/* Central shield container with scanning bar */}
                                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                    <svg
                                        className="w-10 h-10 text-black animate-pulse"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                    
                                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Overlay text and bouncing dots */}
                            <div className="text-center space-y-3">
                                <p className="text-amber-400 font-ui text-lg font-semibold animate-pulse">
                                    Verifying OTP Code
                                </p>
                                <p className="text-[#F8F7F3]/50 font-ui text-sm">
                                    Please wait while we verify your code
                                </p>
                                
                                <div className="flex items-center justify-center space-x-2 pt-2">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Decorative top accent line above the card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header: icon, title, and email hint */}
                    <div className="text-center mb-8">
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
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                        
                        <h2 className="mt-6 text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            Verify Your Email
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            We've sent a 6-digit code to
                        </p>
                        <p className="mt-1 text-sm font-ui font-semibold text-amber-400">
                            {email}
                        </p>
                    </div>

                    {/* Resend success banner shown briefly after successful resend */}
                    {resendSuccess && (
                        <div className="mb-6 bg-green-500/10 border-l-4 border-green-400 p-4 rounded animate-fade-in">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p className="text-sm font-ui text-green-200">New code sent successfully!</p>
                            </div>
                        </div>
                    )}

                    {/* Main email verification form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* OTP Input group */}
                        <div>
                            <label className="block text-sm font-ui font-medium text-[#F8F7F3] mb-3 text-center">
                                Enter Verification Code
                            </label>
                            <div className="flex justify-center gap-3" onPaste={handlePaste}>
                                {data.otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-black/50 text-amber-400 border-2 border-amber-500/30 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all duration-200 outline-none"
                                        disabled={processing}
                                    />
                                ))}
                            </div>
                            <InputError message={errors.otp} className="mt-3 text-center text-amber-400" />
                        </div>

                        {/* Verify button, disabled when loading or when any digit is empty */}
                        <button
                            type="submit"
                            disabled={processing || data.otp.some(digit => !digit)}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                        >
                            {processing ? 'Verifying...' : 'Verify Code'}
                        </button>

                        {/* Resend control with cooldown countdown */}
                        <div className="text-center">
                            <p className="text-sm font-ui text-[#F8F7F3]/80">
                                Didn't receive the code?{' '}
                                {cooldown > 0 ? (
                                    // Show remaining seconds before resend is allowed
                                    <span className="text-amber-400/50 font-medium">
                                        Resend in {cooldown}s
                                    </span>
                                ) : (
                                    // Resend button when cooldown is finished
                                    <button
                                        type="button"
                                        onClick={resendOtp}
                                        disabled={resending}
                                        className="text-amber-400 hover:text-orange-400 font-medium transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {resending ? (
                                            <span className="inline-flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                                            </span>
                                        ) : 'Resend'}
                                    </button>
                                )}
                            </p>
                        </div>
                    </form>

                    {/* Footer note about code expiry */}
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
                                Code expires in 10 minutes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Local CSS animations for scan bar and fade-in effects */}
            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(80px); }
                }
                .animate-scan {
                    animation: scan 2s ease-in-out infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
