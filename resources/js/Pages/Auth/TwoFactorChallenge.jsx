import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';

/**
 * TwoFactorChallenge Component
 *
 * Handles the second step of authentication (Two-Factor Authentication).
 *
 * Responsibilities:
 * - Renders a 6‑digit OTP input used for 2FA verification.
 * - Submits the OTP to the 2fa.verify.post route using Inertia's useForm.
 * - Shows a loading overlay while the verification request is processing.
 * - Displays an optional status message from the backend (e.g., resend info).
 *
 * Props:
 * - status {string|undefined}: Optional status message passed from the server.
 *
 * Form shape (useForm):
 * - otp {string}: Six‑digit one‑time password entered by the user.
 */
export default function TwoFactorChallenge({ status }) {
    // Inertia form state for the OTP value and request meta (processing/errors)
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    /**
     * Submit handler for the 2FA form.
     * Prevents default form submission and posts data to 2fa.verify.post.
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('2fa.verify.post'));
    };

    return (
        <>
            {/* Set the document title in the browser tab */}
            <Head title="Two-Factor Authentication" />
            
            {/* Pure black background with centered 2FA card */}
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 px-10 py-10 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-xl relative">
                    {/* Loading overlay while verifying the 2FA code */}
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
                                Verifying code...
                            </p>
                        </div>
                    )}

                    {/* Decorative gradient line at the top of the card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header: icon, title, and description for 2FA */}
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
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                        </div>
                        
                        <h2 className="mt-6 text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            2FA Security
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            Enter the 6-digit code sent to your registered email for additional security
                        </p>
                    </div>

                    {/* Optional status message (e.g., info from backend) */}
                    {status && (
                        <div className="mb-6 bg-green-500/10 border-l-4 border-green-400 p-4 rounded">
                            <p className="text-sm font-ui text-green-200">{status}</p>
                        </div>
                    )}

                    {/* Main 2FA verification form */}
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            {/* Label for the OTP input */}
                            <InputLabel 
                                htmlFor="otp" 
                                value="Authentication Code" 
                                className="font-ui text-[#F8F7F3] font-medium text-center block mb-3"
                            />
                            {/* Single text input styled like spaced 6-digit code */}
                            <TextInput
                                id="otp"
                                type="text"
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value)}
                                className="block w-full px-4 py-4 text-amber-400 font-ui text-center text-3xl tracking-[0.5em] font-bold bg-black/50 border-2 border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/20"
                                placeholder="● ● ● ● ● ●"
                                maxLength="6"
                                required
                                autoFocus
                            />
                            {/* Validation error message for the OTP field */}
                            <InputError message={errors.otp} className="mt-2 text-center text-amber-400" />
                        </div>

                        {/* Submit button to verify the code and complete login */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                        >
                            {processing ? 'Verifying...' : 'Verify & Login'}
                        </button>
                    </form>

                    {/* Security badge footer text */}
                    <div className="pt-6 mt-6 border-t border-amber-500/20">
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-xs font-ui text-[#F8F7F3]/60">
                                Protected by Two-Factor Authentication
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
