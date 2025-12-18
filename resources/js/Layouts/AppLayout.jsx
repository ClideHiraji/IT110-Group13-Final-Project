import React from "react";

export default function AppLayout({ children }) {
  return (
    <div className="relative min-h-screen text-white bg-black">
      <main className="relative z-20">
        {children}
      </main>
    </div>
  );
}
