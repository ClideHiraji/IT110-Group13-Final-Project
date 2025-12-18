<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\SendOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class OtpVerificationController extends Controller
{
    /**
     * Show the OTP verification page
     */
    public function show()
    {
        $registrationData = session('registration_data');
        
        if (!$registrationData) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $registrationData['email'],
        ]);
    }

    /**
     * Verify the OTP code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|array|size:6',
            'otp.*' => 'required|numeric|digits:1',
        ]);

        $registrationData = session('registration_data');

        if (!$registrationData) {
            return back()->withErrors(['otp' => 'Session expired. Please register again.']);
        }

        // Combine OTP digits
        $otpCode = implode('', $request->otp);

        // Check if OTP matches and is not expired
        if ($registrationData['otp_code'] !== $otpCode) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        if (now()->greaterThan($registrationData['otp_expires_at'])) {
            return back()->withErrors(['otp' => 'OTP code has expired. Please request a new one.']);
        }

        // Create the user
        $user = \App\Models\User::create([
            'name' => $registrationData['name'],
            'email' => $registrationData['email'],
            'password' => $registrationData['password'],
            'is_verified' => true,
        ]);

        // Clear session data
        session()->forget('registration_data');

        // Auto-login
        Auth::login($user);

        // Redirect to home page instead of dashboard
        return redirect('/')->with('status', 'Welcome! Your account has been created successfully.');
    }

    /**
     * Resend OTP code
     */
    public function resend(Request $request)
    {
        // Rate limiting: 1 resend per minute
        $key = 'resend-otp:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Please wait {$seconds} seconds before requesting another code."
            ], 429);
        }

        $registrationData = session('registration_data');

        if (!$registrationData) {
            return response()->json([
                'message' => 'Session expired. Please register again.'
            ], 400);
        }

        // Generate new OTP
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addMinutes(10);

        // Update session with new OTP
        $registrationData['otp_code'] = $otpCode;
        $registrationData['otp_expires_at'] = $expiresAt;
        session(['registration_data' => $registrationData]);

        // Send new OTP via email
        try {
            \Notification::route('mail', $registrationData['email'])
                ->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            \Log::error('Failed to resend OTP: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send OTP. Please try again.'
            ], 500);
        }

        // Set rate limiter
        RateLimiter::hit($key, 60);

        return response()->json([
            'message' => 'New verification code sent successfully!'
        ], 200);
    }

    /**
     * Show verification success page (optional)
     */
    public function success()
    {
        return Inertia::render('Auth/VerificationSuccess');
    }
}
