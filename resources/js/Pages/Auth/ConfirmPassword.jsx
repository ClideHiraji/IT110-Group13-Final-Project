import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

/**
 * ConfirmPassword Page
 * 
 * Inertia page used to confirm the user's password before allowing access
 * to sensitive or secure actions (e.g., changing email, enabling 2FA).
 * 
 * Features:
 * - Uses Inertia's useForm hook to manage form state and submission.
 * - Shows a loading overlay while the confirmation request is processing.
 * - Styled with a dark, cinematic look and gradient accents.
 */
export default function ConfirmPassword() {
    // Initialize Inertia form state with a single "password" field
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    /**
     * Form submit handler.
     * Prevents default browser submission and sends a POST request to
     * the Laravel route 'password.confirm'. Resets password field after finish.
     */
    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            {/* Sets the <title> of the page in the browser tab */}
            <Head title="Confirm Password" />

            {/* Full-screen black background with centered card */}
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 px-10 py-10 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-xl relative">
                    {/* Loading Overlay */}
                    {/* Covers the card while the request is processing to prevent interaction */}
                    {processing && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl z-50 flex flex-col items-center justify-center">
                            <div className="relative">
                                {/* Outer spinner ring */}
                                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
                                {/* Inner reversed spinner ring */}
                                <div
                                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-orange-400 rounded-full animate-spin"
                                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                                ></div>
                            </div>
                            <p className="mt-4 text-amber-400 font-ui text-sm animate-pulse">
                                Verifying password...
                            </p>
                        </div>
                    )}

                    {/* Decorative top accent bar above the card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Circular gradient icon with lock symbol */}
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
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Title and description */}
                        <h2 className="mt-6 text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            Confirm Password
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            This is a secure area of the application. Please confirm your password before continuing.
                        </p>
                    </div>

                    {/* Form for password confirmation */}
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            {/* Password label */}
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            {/* Password input field */}
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full px-4 py-3 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                isFocused={true}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            {/* Validation error display for password */}
                            <InputError message={errors.password} className="mt-2 text-amber-400" />
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                        >
                            {processing ? 'Confirming...' : 'Confirm'}
                        </button>
                    </form>

                    {/* Footer */}
                    {/* Small lock icon with explanatory text about secure confirmation */}
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
                                Secure confirmation required
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
