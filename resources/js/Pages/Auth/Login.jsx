import { useState } from 'react'; // Local state for UI-only behavior
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Login Page
 * 
 * Inertia-powered login form with:
 * - Email and password fields.
 * - "Remember me" option.
 * - Optional password reset link.
 * - Password visibility toggle.
 * - Support for return_url redirection after successful login.
 */
export default function Login({ status, canResetPassword }) {
    // Inertia form state for authentication fields
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        return_url: '',
    });

    // State to control whether password is shown as plain text or masked
    const [showPassword, setShowPassword] = useState(false);

    // On mount, read "return_url" from query string and store in form data
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('return_url');
        if (returnUrl) {
            setData('return_url', returnUrl);
        }
    }, []);

    /**
     * Submit handler for login form.
     * Prevents default HTML form submission and posts to the "login" route.
     * Resets only the password field after request finishes.
     */
    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            {/* Set HTML document title */}
            <Head title="Log in" />

            {/* Fullscreen black background with centered login card */}
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
                    {/* Decorative top accent line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header section: title and subtitle */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            Welcome Back
                        </h2>
                        <div className="mt-4 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-sm font-ui text-[#F8F7F3]/80">
                            Sign in to explore the classical art timeline
                        </p>
                    </div>

                    {/* Status message (for session-based notices like "Password reset successful") */}
                    {status && (
                        <div className="mb-6 bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded">
                            <p className="text-sm font-ui text-amber-200">{status}</p>
                        </div>
                    )}

                    {/* Login form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email field */}
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
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="your.email@example.com"
                            />
                            <InputError message={errors.email} className="mt-2 text-amber-400" />
                        </div>

                        {/* Password field with show/hide toggle */}
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
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                />
                                {/* Eye icon button to toggle password visibility */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8F7F3]/50 hover:text-amber-400 transition-colors"
                                >
                                    {showPassword ? (
                                        // "Eye off" icon
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        // "Eye" icon
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
                            <InputError message={errors.password} className="mt-2 text-amber-400" />
                        </div>

                        {/* Remember me checkbox and optionally "Forgot password?" link */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-amber-500/30 bg-black/50 text-amber-400 focus:ring-amber-400"
                                />
                                <span className="ms-2 text-sm font-ui text-[#F8F7F3]/80">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request.email')}
                                    className="text-sm font-ui text-amber-400 hover:text-orange-400 transition-colors duration-200"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {/* Submit button and link to registration */}
                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                            >
                                {processing ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="text-center">
                                <span className="text-sm font-ui text-[#F8F7F3]/80">
                                    Don't have an account?{' '}
                                </span>
                                <Link
                                    href={route('register')}
                                    className="text-sm font-ui font-medium text-amber-400 hover:text-orange-400 transition-colors duration-200"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </form>

                    {/* Footer note about security */}
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
                                Secure Authentication • Classical Art Timeline
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
