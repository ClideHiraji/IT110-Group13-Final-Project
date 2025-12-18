<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    /**
     * Show the 2FA challenge page
     */
    public function show()
    {
        $email = session('2fa_email');

        if (!$email) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge', [
            'status' => session('status'),
        ]);
    }

    /**
     * Verify the 2FA OTP code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $email = session('2fa_email');

        if (!$email) {
            return back()->withErrors(['otp' => 'Session expired. Please login again.']);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['otp' => 'User not found.']);
        }

        // Verify OTP
        if (!$user->verifyOtp($request->otp)) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP code.']);
        }

        // Clear OTP
        $user->clearOtp();

        // Log the user in
        Auth::login($user);

        // Clear session
        session()->forget('2fa_email');

        // Redirect to home page instead of dashboard
        return redirect('/')->with('status', 'Two-factor authentication successful!');
    }

    /**
     * Resend 2FA OTP
     */
    public function resend(Request $request)
    {
        // Rate limiting
        $key = 'resend-2fa-otp:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->with('status', "Please wait {$seconds} seconds before requesting another code.");
        }

        $email = session('2fa_email');

        if (!$email) {
            return back()->withErrors(['otp' => 'Session expired. Please login again.']);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['otp' => 'User not found.']);
        }

        // Generate new OTP
        $otpCode = $user->generateOtp();

        // Send OTP
        try {
            $user->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            \Log::error('Failed to resend 2FA OTP: ' . $e->getMessage());
            return back()->withErrors(['otp' => 'Failed to send verification code.']);
        }

        // Set rate limiter
        RateLimiter::hit($key, 60);

        return back()->with('status', 'New verification code sent!');
    }
}
