import { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';

/**
 * ResetPasswordOtp Component
 * 
 * Screen for verifying a 6-digit OTP code during the password reset flow.
 * 
 * Responsibilities:
 * - Displays the email address where the OTP was sent.
 * - Provides a 6-input OTP entry UI with:
 *   - Auto-focus on the first input on mount.
 *   - Numeric-only validation.
 *   - Auto-advance to the next input when a digit is entered.
 *   - Backspace navigation to the previous input when empty.
 *   - Paste support to fill all 6 digits at once.
 * - Submits the OTP to the password.verify.otp route using Inertia's useForm.
 * - Shows a full-screen overlay with animation while the verification request is processing.
 * - Handles OTP resend:
 *   - Sends a POST request to password.send.otp with the user's email.
 *   - Shows a short success message when resend succeeds.
 *   - Starts a 60-second cooldown timer before allowing another resend.
 *   - Disables the resend button and shows a countdown during cooldown.
 * 
 * Props:
 * - email {string}: The email address where the OTP code was sent.
 * 
 * Form shape (useForm):
 * - otp: string[6] – array of 6 characters representing the OTP digits.
 * 
 * State:
 * - inputRefs: Refs for each individual OTP input element for focus control.
 * - resending {boolean}: Indicates whether a resend request is currently in progress.
 * - resendSuccess {boolean}: Controls display of the "New code sent successfully" alert.
 * - cooldown {number}: Remaining seconds before resend is allowed again.
 */
export default function ResetPasswordOtp({ email }) {
    // Inertia form state: holds OTP as an array of 6 single-character strings
    const { data, setData, post, processing, errors } = useForm({
        otp: ['', '', '', '', '', ''],
    });

    // Refs to each input element so focus can be moved programmatically
    const inputRefs = useRef([]);

    // Whether a resend OTP request is currently being processed
    const [resending, setResending] = useState(false);

    // Whether the last resend attempt succeeded (controls green success banner)
    const [resendSuccess, setResendSuccess] = useState(false);

    // Cooldown timer in seconds before user can request another OTP resend
    const [cooldown, setCooldown] = useState(0);

    // On mount: focus the first OTP input automatically
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Cooldown timer effect:
    // Decreases cooldown by 1 every second until it reaches 0
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    /**
     * Handle changes in individual OTP inputs.
     * - Only allows numeric characters.
     * - Stores only the last typed digit in the corresponding index.
     * - Automatically focuses the next input when a digit is entered.
     */
    const handleChange = (index, value) => {
        // Reject non-numeric characters
        if (!/^\d*$/.test(value)) return;

        // Clone current otp array and update the specific index
        const newOtp = [...data.otp];
        newOtp[index] = value.slice(-1);
        setData('otp', newOtp);

        // If a digit was entered and this is not the last input, move focus to next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    /**
     * Handle key events in OTP inputs.
     * - When Backspace is pressed on an empty field, focus moves back to the previous input.
     */
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !data.otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    /**
     * Handle paste event across the OTP inputs.
     * - Reads up to 6 characters from clipboard.
     * - Validates that the pasted value is numeric.
     * - Splits into individual digits and fills the otp array.
     * - Focuses the first empty field or the last one if all are filled.
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
     * Submit handler for OTP verification.
     * Sends the current otp array to the password.verify.otp route.
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('password.verify.otp'));
    };

    /**
     * Resend OTP handler.
     * - Prevents resend if cooldown is active or a resend is already in progress.
     * - Sends POST request to password.send.otp with the current email.
     * - On success:
     *   - Shows success banner.
     *   - Starts a 60-second cooldown.
     *   - Hides success banner after 3 seconds.
     */
    const resendOtp = async () => {
        // Block if user is waiting for cooldown or already resending
        if (cooldown > 0 || resending) return;

        setResending(true);
        setResendSuccess(false);

        try {
            const response = await fetch(route('password.send.otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setResendSuccess(true);
                setCooldown(60);
                // Automatically hide success message after 3 seconds
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
            {/* Head: sets the page title in the browser tab */}
            <Head title="Verify OTP" />
            
            {/* Pure black full-screen background with centered OTP card */}
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 px-10 py-10 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-xl relative">
                    {/* Verifying OTP Animation Overlay */}
                    {/* Covers the card and shows animated lock while verifying */}
                    {processing && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-2xl z-50 flex flex-col items-center justify-center">
                            {/* Animated Lock Icon */}
                            <div className="relative mb-6">
                                {/* Expanding ping circles behind the lock */}
                                <div className="absolute inset-0 w-24 h-24 -m-2 bg-amber-400/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 w-24 h-24 -m-4 bg-orange-400/10 rounded-full animate-ping" style={{ animationDelay: '150ms' }}></div>
                                
                                {/* Central gradient lock container */}
                                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                    <svg className="w-10 h-10 text-black animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    
                                    {/* Scanning bar animation over the lock */}
                                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Text and bouncing dots while verifying */}
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

                    {/* Header section with icon and email info */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                        </div>
                        
                        <h2 className="mt-6 text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            Verify Code
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            We've sent a 6-digit code to
                        </p>
                        <p className="mt-1 text-sm font-ui font-semibold text-amber-400">
                            {email}
                        </p>
                    </div>

                    {/* Resend Success Message banner */}
                    {resendSuccess && (
                        <div className="mb-6 bg-green-500/10 border-l-4 border-green-400 p-4 rounded animate-fade-in">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-ui text-green-200">New code sent successfully!</p>
                            </div>
                        </div>
                    )}

                    {/* Main OTP verification form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* OTP Input */}
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

                        {/* Verify button, disabled until all digits are filled or while processing */}
                        <button
                            type="submit"
                            disabled={processing || data.otp.some(digit => !digit)}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                        >
                            {processing ? 'Verifying...' : 'Verify & Continue'}
                        </button>

                        {/* Resend Link with Cooldown logic */}
                        <div className="text-center">
                            <p className="text-sm font-ui text-[#F8F7F3]/80">
                                Didn't receive the code?{' '}
                                {cooldown > 0 ? (
                                    // Show cooldown countdown when active
                                    <span className="inline-flex items-center text-amber-400/50 font-medium">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Resend in {cooldown}s
                                    </span>
                                ) : (
                                    // Resend button when not in cooldown
                                    <button
                                        type="button"
                                        onClick={resendOtp}
                                        disabled={resending}
                                        className="text-amber-400 hover:text-orange-400 font-medium transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {resending ? (
                                            <span className="inline-flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : 'Resend'}
                                    </button>
                                )}
                            </p>
                        </div>

                        {/* Back to Login link */}
                        <div className="text-center">
                            <Link 
                                href={route('login')} 
                                className="text-sm font-ui text-amber-400 hover:text-orange-400 transition-colors duration-200"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </form>

                    {/* Footer note about code expiry */}
                    <div className="pt-6 mt-6 border-t border-amber-500/20">
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-ui text-[#F8F7F3]/60">
                                Code expires in 10 minutes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Local CSS animations for scanning bar and fade-in effect */}
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
