import { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerificationSuccess() {
    useEffect(() => {
        // Redirect to home after 3 seconds
        const timer = setTimeout(() => {
            router.visit(route('home'));
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <GuestLayout>
            <Head title="Verification Success" />
            
            <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-gradient-to-br from-amber-950/20 via-orange-950/10 to-black p-10 rounded-lg shadow-2xl border border-amber-500/20 backdrop-blur-sm text-center">
                    {/* Success Icon with Animation */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {/* Pulsing ring */}
                            <div className="absolute inset-0 w-24 h-24 bg-green-500/20 rounded-full animate-ping"></div>
                            
                            {/* Success checkmark */}
                            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="space-y-3">
                        <h2 className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                            Verification Complete!
                        </h2>
                        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                        <p className="text-[#F8F7F3]/70 font-ui">
                            Your account has been successfully created and verified.
                        </p>
                    </div>

                    {/* Loading indicator */}
                    <div className="pt-6">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="mt-3 text-sm font-ui text-[#F8F7F3]/50">
                            Redirecting to homepage...
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
