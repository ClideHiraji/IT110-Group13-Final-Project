import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PasswordStrengthIndicator from '@/Components/PasswordStrengthIndicator';
import PasswordMatchIndicator from '@/Components/PasswordMatchIndicator';

/**
 * ResetPasswordForm Component
 * 
 * Handles the "create new password" step in the password reset flow.
 * 
 * Features:
 * - New password and confirmation fields.
 * - Password visibility toggles for both fields.
 * - Password strength and match indicators.
 * - Loading overlay while the reset request is being processed.
 */
export default function ResetPasswordForm({ status }) {
    // Inertia form state for new password fields
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    // State to toggle visibility of the new password field
    const [showPassword, setShowPassword] = useState(false);
    // State to toggle visibility of the confirm password field
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Submit handler for reset password form.
     * Prevents default form submission and posts to password.reset.post route.
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('password.reset.post'));
    };

    return (
        <>
            {/* Set page title in browser tab */}
            <Head title="Create New Password" />
            
            {/* Pure black full-screen background with centered card */}
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 px-10 py-10 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-xl relative">
                    {/* Loading Overlay */}
                    {/* Blocks interaction and shows spinner while processing */}
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
                                Resetting your password...
                            </p>
                            <p className="mt-2 text-[#F8F7F3]/50 font-ui text-xs">
                                Please wait
                            </p>
                        </div>
                    )}

                    {/* Decorative top accent line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header */}
                    {/* Icon, title, and short description for the reset page */}
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
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                    />
                                </svg>
                            </div>
                        </div>
                        
                        <h2 className="mt-6 text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            New Password
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            Create a strong password for your account
                        </p>
                    </div>

                    {/* Optional status message (e.g., success notice from backend) */}
                    {status && (
                        <div className="mb-6 bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded">
                            <p className="text-sm font-ui text-amber-200">{status}</p>
                        </div>
                    )}

                    {/* Reset password form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* New Password with Strength Indicator */}
                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="New Password"
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            <div className="relative mt-2">
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full px-4 py-3 pr-12 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                    placeholder="Create a strong password"
                                    required
                                    autoFocus
                                />
                                {/* Toggle button to show/hide new password */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8F7F3]/50 hover:text-amber-400 transition-colors"
                                >
                                    {showPassword ? (
                                        // Eye-off icon
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        // Eye icon
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            {/* Password Strength Indicator */}
                            {data.password && (
                                <div className="mt-3">
                                    <PasswordStrengthIndicator password={data.password} />
                                </div>
                            )}
                            
                            <InputError message={errors.password} className="mt-2 text-amber-400" />
                        </div>

                        {/* Confirm Password with Match Indicator */}
                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            <div className="relative mt-2">
                                <TextInput
                                    id="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="block w-full px-4 py-3 pr-12 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                    placeholder="Confirm your password"
                                    required
                                />
                                {/* Toggle button to show/hide confirm password */}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8F7F3]/50 hover:text-amber-400 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        // Eye-off icon
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        // Eye icon
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            
                            {/* Password Match Indicator */}
                            <PasswordMatchIndicator
                                password={data.password}
                                confirmPassword={data.password_confirmation}
                            />
                            
                            <InputError message={errors.password_confirmation} className="mt-2 text-amber-400" />
                        </div>

                        {/* Submit and navigation actions */}
                        <div className="space-y-4">
                            {/* Reset password button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                            >
                                {processing ? 'Resetting...' : 'Reset Password'}
                            </button>

                            {/* Back to login link */}
                            <Link
                                href={route('login')}
                                className="block text-center text-sm font-ui text-amber-400 hover:text-orange-400 transition-colors duration-200"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </form>

                    {/* Security note */}
                    {/* Small footer text emphasizing secure reset */}
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
                                Secure password reset
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
