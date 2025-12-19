import React from "react";
import { Link } from "@inertiajs/react";
import ApplicationLogo from "./ApplicationLogo";
import { Palette } from "lucide-react";

/**
 * Header Component
 * 
 * Main navigation header with authentication-based menu items.
 * Displays different navigation options based on user auth state.
 * 
 * Features:
 * - Responsive navigation
 * - Conditional rendering based on auth state
 * - Inertia.js navigation
 * - Sticky positioning
 * - Logo/branding area
 * 
 * @param {Object} props - Component props
 * @param {Object} props.auth - Authentication object
 * @param {Object|null} props.auth.user - Current user object or null
 * 
 * Navigation Items:
 * - Authenticated: Dashboard, Timeline, Collection, Profile, Logout
 * - Guest: Home, Login, Register
 * 
 * @example
 * // In layout
 * <Header auth={auth} />
 * 
 * @example
 * // Usage in page
 * import Header from '@/Components/Header';
 * 
 * export default function MyPage({ auth }) {
 *   return (
 *     <>
 *       <Header auth={auth} />
 *       <main>...</main>
 *     </>
 *   );
 * }
 */
export default function Header({ auth }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-black to-black/95 backdrop-blur-xl border-b border-amber-500/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-amber-500/10 blur-md" />
            <Palette className="w-8 h-8 text-amber-400 group-hover:text-orange-400 transition-colors" />
          </div>
          <span className="text-2xl font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
            ArtVault
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {auth.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-[#F8F7F3]/80 hover:text-amber-300 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/timeline"
                className="text-[#F8F7F3]/80 hover:text-amber-300 transition-colors"
              >
                Timeline
              </Link>
              <Link
                href="/collection"
                className="text-[#F8F7F3]/80 hover:text-amber-300 transition-colors"
              >
                Collection
              </Link>
              <Link
                href="/profile"
                className="text-[#F8F7F3]/80 hover:text-amber-300 transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/logout"
                method="post"
                as="button"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-300 hover:to-orange-400 transition-all"
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="text-[#F8F7F3]/80 hover:text-amber-300 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="text-[#F8F7F3]/80 hover:text-amber-300 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-300 hover:to-orange-400 transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    </header>
  );
}
