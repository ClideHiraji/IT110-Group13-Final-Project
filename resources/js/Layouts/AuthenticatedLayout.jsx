// resources/js/Layouts/AuthenticatedLayout.jsx

import { Link, router, usePage } from '@inertiajs/react';
import { Palette, LogOut } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Fixed Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-950/95 via-orange-950/95 to-black/95 backdrop-blur-xl border-b border-amber-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <Palette className="w-8 h-8 text-amber-400 group-hover:text-orange-400 transition-colors" />
                            <span className="text-2xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                ClassicArt
                            </span>
                        </Link>

                        <div className="flex items-center space-x-6">
                            <Link href="/" className="text-[#F8F7F3]/80 hover:text-amber-400 transition-colors font-ui">
                                Timeline
                            </Link>
                            <Link href="/dashboard" className="text-[#F8F7F3]/80 hover:text-amber-400 transition-colors font-ui">
                                Dashboard
                            </Link>
                            <Link href="/collection" className="text-[#F8F7F3]/80 hover:text-amber-400 transition-colors font-ui">
                                Collection
                            </Link>
                            
                            {auth.user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold hover:from-amber-300 hover:to-orange-400 transition-all"
                                    >
                                        {auth.user.name}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all"
                                        title="Log Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold hover:from-amber-300 hover:to-orange-400 transition-all"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content with padding for fixed nav */}
            <div className="pt-16">
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
