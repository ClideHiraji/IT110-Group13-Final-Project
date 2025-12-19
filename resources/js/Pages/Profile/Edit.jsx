import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import Header from '@/Components/Header';
import { ShieldCheck, ShieldOff } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const twoFactorEnabled = !!auth?.user?.two_factor_enabled;
    return (
        <>
            <Head title="Profile" />
            <Header auth={auth} />

            <div className="min-h-screen bg-black pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                            Profile
                        </h1>
                        <p className="text-[#F8F7F3]/70 font-ui mt-2">Manage your account settings</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-xl p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className=""
                            />
                        </div>

                        <div className="bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-xl p-6">
                            <UpdatePasswordForm className="" />
                        </div>
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-display text-amber-300">Two‑Factor Authentication (2FA)</h2>
                                <p className="text-amber-400/80 font-ui">
                                    Protect your account with one-time codes when performing sensitive actions.
                                </p>
                            </div>
                            {twoFactorEnabled ? (
                                <Link
                                    href="/profile/2fa/disable"
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                                >
                                    <ShieldOff className="w-4 h-4" />
                                    Disable 2FA
                                </Link>
                            ) : (
                                <Link
                                    href="/profile/2fa/enable"
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Enable 2FA
                                </Link>
                            )}
                        </div>
                        {status && (
                            <p className="mt-3 text-sm text-amber-400">{status}</p>
                        )}
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/20 rounded-xl p-6">
                        <DeleteUserForm className="" />
                    </div>
                </div>
            </div>
        </>
    );
}
