import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-gradient-to-br from-amber-950/20 via-orange-950/10 to-black p-10 rounded-lg shadow-2xl border border-amber-500/20 backdrop-blur-sm">
                    {/* Decorative top accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

                    {/* Header */}
                    <div className="relative">
                        <h2 className="text-4xl font-display text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wide">
                            Welcome Back
                        </h2>
                        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="mt-4 text-center text-sm font-ui text-[#F8F7F3]/70">
                            Sign in to explore the classical art timeline
                        </p>
                    </div>

                    {status && (
                        <div className="bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded">
                            <p className="text-sm font-ui text-amber-200">{status}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-8 space-y-6">
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
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="your.email@example.com"
                            />
                            <InputError message={errors.email} className="mt-2 text-amber-400" />
                        </div>

                        {/* Password */}
                        <div>
                            <InputLabel 
                                htmlFor="password" 
                                value="Password" 
                                className="font-ui text-[#F8F7F3] font-medium"
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full px-4 py-3 bg-black/50 text-[#F8F7F3] font-ui border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 placeholder:text-[#F8F7F3]/30"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                            />
                            <InputError message={errors.password} className="mt-2 text-amber-400" />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-amber-500/30 bg-black/50 text-amber-400 focus:ring-amber-400"
                                />
                                <span className="ms-2 text-sm font-ui text-[#F8F7F3]/70">
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

                        {/* Submit Button */}
                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-ui font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                            >
                                Sign In
                            </button>

                            {/* Register Link */}
                            <div className="text-center">
                                <span className="text-sm font-ui text-[#F8F7F3]/70">
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

                    {/* Decorative Footer */}
                    <div className="pt-6 border-t border-amber-500/20">
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-ui text-[#F8F7F3]/50">
                                Secure Authentication • Classical Art Timeline
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
