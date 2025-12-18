<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class PasswordResetOtpController extends Controller
{
    /**
     * Show the email input form
     */
    public function showEmailForm()
    {
        return Inertia::render('Auth/ForgotPasswordEmail');
    }

    /**
     * Send OTP to email
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'We could not find a user with that email address.']);
        }

        // Generate OTP
        $otpCode = $user->generateOtp();

        // Send OTP via email
        try {
            $user->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset OTP: ' . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }

        // Store email in session
        session(['password_reset_email' => $request->email]);

        return redirect()->route('password.reset.otp')
            ->with('status', 'Verification code sent to your email!');
    }

    /**
     * Show OTP verification form
     */
    public function showOtpForm()
    {
        $email = session('password_reset_email');

        if (!$email) {
            return redirect()->route('password.request.email');
        }

        return Inertia::render('Auth/ResetPasswordOtp', [
            'email' => $email,
        ]);
    }

    /**
     * Verify OTP code
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|array|size:6',
            'otp.*' => 'required|numeric|digits:1',
        ]);

        $email = session('password_reset_email');

        if (!$email) {
            return back()->withErrors(['otp' => 'Session expired. Please start over.']);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['otp' => 'User not found.']);
        }

        // Combine OTP digits
        $otpCode = implode('', $request->otp);

        // Verify OTP
        if (!$user->verifyOtp($otpCode)) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP code.']);
        }

        // Store verified flag in session
        session(['password_reset_verified' => true]);

        return redirect()->route('password.reset.form');
    }

    /**
     * Show password reset form
     */
    public function showResetForm()
    {
        if (!session('password_reset_verified')) {
            return redirect()->route('password.request.email');
        }

        return Inertia::render('Auth/ResetPasswordForm');
    }

    /**
     * Reset the password
     */
    public function resetPassword(Request $request)
    {
        if (!session('password_reset_verified')) {
            return back()->withErrors(['password' => 'Unauthorized action.']);
        }

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $email = session('password_reset_email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['password' => 'User not found.']);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Clear OTP
        $user->clearOtp();

        // Clear session
        session()->forget(['password_reset_email', 'password_reset_verified']);

        return redirect()->route('login')
            ->with('status', 'Password reset successfully! You can now login.');
    }

    /**
     * Resend OTP for password reset
     */
    public function resendOtp(Request $request)
    {
        // Rate limiting: 1 resend per minute
        $key = 'resend-password-otp:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Please wait {$seconds} seconds before requesting another code."
            ], 429);
        }

        $email = session('password_reset_email');

        if (!$email) {
            return response()->json([
                'message' => 'Session expired. Please start over.'
            ], 400);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        // Generate new OTP
        $otpCode = $user->generateOtp();

        // Send OTP via email
        try {
            $user->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            \Log::error('Failed to resend password reset OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send verification code. Please try again.'
            ], 500);
        }

        // Set rate limiter
        RateLimiter::hit($key, 60);

        return response()->json([
            'message' => 'New verification code sent successfully!'
        ], 200);
    }
}
