import React from "react";
import { Link } from "@inertiajs/react";

export default function Header({auth}) {
  return (
    <header className="w-full fixed top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-orange-300 rounded-lg flex items-center justify-center font-bold text-black">
            C
          </div>
          <h1 className="text-white font-semibold text-lg">Chronicles</h1>
        </div>

        <div className="flex items-center gap-4">
          {!auth?.user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white hover:bg-white/20 transition-colors"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md text-white hover:bg-white/20 hover:border-white/50 transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-white/80">
                {auth.user.name}
              </span>

              <Link
                href="/dashboard"
                className="px-4 py-2 bg-white/10 rounded-md text-white hover:bg-white/20"
              >
                Dashboard
              </Link>

              <Link
                href="/collection"
                className="px-4 py-2 bg-white/10 rounded-md text-white hover:bg-white/20"
              >
                Collection
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}