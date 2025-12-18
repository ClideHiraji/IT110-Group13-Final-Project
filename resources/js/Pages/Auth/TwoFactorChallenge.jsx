import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';

export default function TwoFactorChallenge({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('2fa.verify.post'));
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Authentication" />
            
            <div className="min-h-screen flex items-center justify-center bg-cinematic-offwhite py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-2xl border border-gray-100">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-icy to-accent-amber rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    {/* Header */}
                    <div>
                        <h2 className="text-4xl font-display text-center text-gray-900 tracking-tight">
                            2FA Security
                        </h2>
                        <div className="mt-2 h-1 w-24 mx-auto bg-gradient-to-r from-accent-icy to-accent-amber rounded-full"></div>
                        <p className="mt-4 text-center text-sm font-ui text-gray-600">
                            Enter the 6-digit code sent to your registered email for additional security
                        </p>
                    </div>

                    {status && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                            <p className="text-sm font-ui text-green-800">{status}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-8 space-y-6">
                        <div>
                            <InputLabel 
                                htmlFor="otp" 
                                value="Authentication Code" 
                                className="font-ui text-gray-700 text-center block mb-3"
                            />
                            <TextInput
                                id="otp"
                                type="text"
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value)}
                                className="block w-full px-4 py-4 text-gray-900 font-ui text-center text-3xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-icy focus:border-accent-icy transition-all duration-200"
                                placeholder="● ● ● ● ● ●"
                                maxLength="6"
                                required
                                autoFocus
                            />
                            <InputError message={errors.otp} className="mt-2 text-center" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-ui font-medium text-white bg-gradient-to-r from-accent-icy to-accent-amber hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-icy transition-all duration-200 disabled:opacity-50"
                        >
                            Verify & Login
                        </button>
                    </form>

                    {/* Security badge */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs font-ui text-gray-500">
                            Protected by Two-Factor Authentication
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
