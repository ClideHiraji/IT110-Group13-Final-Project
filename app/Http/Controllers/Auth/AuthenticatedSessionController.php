<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create()
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Check if user has 2FA enabled
        if ($user->two_factor_enabled && $user->two_factor_confirmed_at) {
            // Generate 2FA OTP
            $otpCode = $user->generateOtp();

            // Send 2FA OTP
            try {
                $user->notify(new \App\Notifications\SendOtpNotification($otpCode));
            } catch (\Exception $e) {
                \Log::error('Failed to send 2FA OTP: ' . $e->getMessage());
            }

            // Logout temporarily for 2FA verification
            Auth::logout();

            // Store email in session for 2FA
            session(['2fa_email' => $user->email]);

            return redirect()->route('2fa.challenge');
        }

        // Redirect to home page instead of dashboard
        return redirect('/')->with('status', 'Welcome back!');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
