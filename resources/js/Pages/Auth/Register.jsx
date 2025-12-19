import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PasswordStrengthIndicator from '@/Components/PasswordStrengthIndicator';
import PasswordMatchIndicator from '@/Components/PasswordMatchIndicator';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Register Page
 * 
 * Handles user account creation with:
 * - Name, email, password, and password confirmation fields.
 * - Password strength and match indicators.
 * - Password visibility toggles for both password fields.
 * - Loading overlay while the registration request is processing.
 * 
 * Uses Inertia's useForm hook to manage form state and submission.
 */
export default function Register() {
    // Inertia form state for registration fields
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Toggle visibility for main password field
    const [showPassword, setShowPassword] = useState(false);
    // Toggle visibility for confirm password field
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Derived flag: true when both passwords match and confirmation is non-empty
    const passwordsMatch = data.password === data.password_confirmation && data.password_confirmation.length > 0;

    /**
     * Submit handler for the registration form.
     * Prevents default browser submission, posts to the "register" route,
     * and clears both password fields when the request finishes.
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            {/* Sets the HTML document title for this page */}
            <Head title="Register" />

            {/* Pure black full-screen background with centered registration card */}
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-black/60 px-10 py-10 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-xl relative">
                    <div className="absolute -top-8 left-0 right-0 flex justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-ui rounded-lg border border-white/30 backdrop-blur-sm transition-all"
                        >
                            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Go Back Home
                        </Link>
                    </div>
                    {/* Loading Overlay */}
                    {/* Covers the card while processing to prevent interaction */}
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
                                Creating your account...
                            </p>
                            <p className="mt-2 text-[#F8F7F3]/50 font-ui text-xs">
                                Sending verification code
                            </p>
                        </div>
                    )}

                    {/* Decorative top accent strip above the card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header with Icon */}
                    {/* Circular avatar icon and title for the registration page */}
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
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="mt-6 text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            Create Account
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            Join us to explore the world of classical art
                        </p>
                    </div>

                    {/* Registration form */}
                    <form onSubmit={submit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <InputLabel
                                htmlFor="name"
                                value="Full Name"
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-2 block w-full px-4 py-3 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                            <InputError message={errors.name} className="mt-2 text-amber-400" />
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email Address"
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full px-4 py-3 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="your.email@example.com"
                                required
                            />
                            <InputError message={errors.email} className="mt-2 text-amber-400" />
                        </div>

                        {/* Password with Strength Indicator */}
                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            <div className="relative mt-2">
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="block w-full px-4 py-3 pr-12 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Create a strong password"
                                    required
                                />
                                {/* Toggle button to show/hide password text */}
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
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full px-4 py-3 pr-12 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                />
                                {/* Toggle button to show/hide confirm password text */}
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
                            
                            {/* Password Match Indicator showing real-time match status */}
                            <PasswordMatchIndicator
                                password={data.password}
                                confirmPassword={data.password_confirmation}
                            />
                            
                            <InputError message={errors.password_confirmation} className="mt-2 text-amber-400" />
                        </div>

                        {/* Submit Button */}
                        <div className="space-y-4 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                            >
                                {processing ? 'Processing...' : 'Create Account'}
                            </button>

                            {/* Login Link */}
                            <div className="text-center">
                                <span className="text-sm font-ui text-[#F8F7F3]/80">
                                    Already have an account?{' '}
                                </span>
                                <Link
                                    href={route('login')}
                                    className="text-sm font-ui font-medium text-amber-400 hover:text-orange-400 transition-colors duration-200"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </form>

                    {/* Terms Notice */}
                    {/* Simple informational line about email verification */}
                    <div className="pt-6 mt-6 border-t border-amber-500/20">
                        <p className="text-xs text-center font-ui text-[#F8F7F3]/60">
                            By creating an account, you agree to receive email verification
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
