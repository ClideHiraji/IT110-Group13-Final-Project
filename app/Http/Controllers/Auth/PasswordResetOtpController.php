<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

/**
 * PasswordResetOtpController
 * 
 * Handles password reset via OTP (One-Time Password) verification instead of
 * traditional email reset links. This provides an alternative password recovery
 * method with a more modern, mobile-friendly approach using 6-digit codes.
 * 
 * Password Reset Flow:
 * 1. User submits email on forgot password page (sendOtp method)
 * 2. System generates OTP and stores in user record
 * 3. OTP sent to user's email
 * 4. User redirected to OTP verification page (showOtpForm method)
 * 5. User enters 6-digit OTP (verifyOtp method)
 * 6. If valid: set verification flag in session
 * 7. User redirected to password reset form (showResetForm method)
 * 8. User enters new password (resetPassword method)
 * 9. Password updated, OTP cleared, user redirected to login
 * 
 * Security Features:
 * - OTP expires after configured time (typically 10 minutes)
 * - Rate limiting on OTP resend (1 per minute per IP)
 * - Session-based verification flag prevents skipping steps
 * - OTP stored in database on user record
 * - OTP cleared immediately after use
 * - Email validation ensures user exists
 * - Password confirmation required
 * 
 * Session Data Structure:
 * - 'password_reset_email': User's email address
 * - 'password_reset_verified': Boolean flag indicating OTP verification
 * 
 * Advantages over Token-based Reset:
 * - Shorter, more memorable codes (6 digits vs long URL)
 * - Better mobile experience
 * - No URL expiration issues
 * - More familiar to users (similar to 2FA)
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \App\Models\User::generateOtp()
 * @see \App\Models\User::verifyOtp()
 * @see \App\Models\User::clearOtp()
 * @see \App\Notifications\SendOtpNotification
 */
class PasswordResetOtpController extends Controller
{
    /**
     * Send OTP for password reset.
     * 
     * Validates the user's email, generates an OTP code, sends it via email,
     * and redirects to the OTP verification page. This is the entry point for
     * the OTP-based password reset flow.
     * 
     * Process:
     * 1. Validate email format and existence in database
     * 2. Find user by email
     * 3. Generate OTP via User model method
     * 4. Send OTP to user's email
     * 5. Store email in session for subsequent steps
     * 6. Redirect to OTP verification page
     * 
     * @param Request $request The HTTP request containing email
     * 
     * @return \Illuminate\Http\RedirectResponse Redirects to OTP form or back with errors
     * 
     * Request Data Required:
     * - email (string): Must be valid email format and exist in users table
     * 
     * Validation Rules:
     * - email: 'required|email|exists:users,email'
     * 
     * Error Scenarios:
     * 1. Invalid email format: "The email field must be a valid email address."
     * 2. Email not found: "The selected email is invalid." (validation)
     * 3. User query failed: "We could not find a user with that email address."
     * 4. Email sending failed: "Failed to send verification code. Please try again."
     * 
     * Session Data Set:
     * - 'password_reset_email': User's email for verification steps
     * 
     * Session Flash Data (on success):
     * - 'status' => 'Verification code sent to your email!'
     * 
     * Database Operations:
     * - Queries users table by email
     * - Updates user record with OTP and expiration via generateOtp()
     * 
     * @see \App\Models\User::generateOtp()
     */
    public function sendOtp(Request $request)
    {
        // Validate email format and ensure it exists in users table
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Find user by email address
        $user = User::where('email', $request->email)->first();

        // Double-check user exists (should always pass due to validation)
        if (!$user) {
            return back()->withErrors(['email' => 'We could not find a user with that email address.']);
        }

        // Generate OTP code and store in user record
        // This method creates a 6-digit OTP with expiration time
        $otpCode = $user->generateOtp();

        // Send OTP to user's email via notification
        try {
            $user->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            // Log error details for debugging
            \Log::error('Failed to send password reset OTP: ' . $e->getMessage());

            // Return user-friendly error message
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }

        // Store email in session for OTP verification and password reset steps
        session(['password_reset_email' => $request->email]);

        // Redirect to OTP verification page with success message
        return redirect()->route('password.reset.otp')
            ->with('status', 'Verification code sent to your email!');
    }

    /**
     * Show OTP verification form.
     * 
     * Displays the page where users enter the 6-digit OTP code sent to their email.
     * If no email is stored in the session, redirects back to the email entry page.
     * 
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     *         Redirects to email page if session expired,
     *         otherwise renders OTP verification form
     * 
     * Session Requirements:
     * - 'password_reset_email': Must contain user's email
     * 
     * Props Passed to Frontend:
     * - email (string): User's email address for display
     * 
     * @see resources/js/Pages/Auth/ResetPasswordOtp.vue
     */
    public function showOtpForm()
    {
        // Retrieve email from session
        $email = session('password_reset_email');

        // Check if session data exists
        if (!$email) {
            // No session - redirect to email entry page
            return redirect()->route('password.request.email');
        }

        // Render OTP verification page with user's email
        return Inertia::render('Auth/ResetPasswordOtp', [
            'email' => $email,
        ]);
    }

    /**
     * Verify OTP code.
     * 
     * Validates the OTP code entered by the user. If valid, sets a verification
     * flag in the session and redirects to the password reset form. If invalid
     * or expired, returns an error message.
     * 
     * Process:
     * 1. Validate OTP format (6 individual digits)
     * 2. Retrieve email from session
     * 3. Find user by email
     * 4. Combine OTP digits into string
     * 5. Verify OTP is valid and not expired
     * 6. Set verification flag in session
     * 7. Redirect to password reset form
     * 
     * @param Request $request The HTTP request containing OTP digits
     * 
     * @return \Illuminate\Http\RedirectResponse Redirects to password form or back with errors
     * 
     * Request Data Expected:
     * - otp (array): Array of 6 digits, e.g., ['1', '2', '3', '4', '5', '6']
     * 
     * Validation Rules:
     * - otp: 'required|array|size:6'
     * - otp.*: 'required|numeric|digits:1'
     * 
     * Error Scenarios:
     * 1. Session expired: "Session expired. Please start over."
     * 2. User not found: "User not found."
     * 3. Invalid OTP: "Invalid or expired OTP code."
     * 
     * Session Data Set:
     * - 'password_reset_verified' => true: Allows access to reset form
     * 
     * Security Notes:
     * - OTP verification flag prevents skipping to reset form
     * - OTP not cleared yet (cleared after password reset)
     * - Session required for all subsequent steps
     * 
     * @see \App\Models\User::verifyOtp()
     */
    public function verifyOtp(Request $request)
    {
        // Validate OTP input format
        // Expects array of 6 individual numeric digits
        $request->validate([
            'otp' => 'required|array|size:6',
            'otp.*' => 'required|numeric|digits:1',
        ]);

        // Retrieve email from session
        $email = session('password_reset_email');

        // Check if session still contains email
        if (!$email) {
            return back()->withErrors(['otp' => 'Session expired. Please start over.']);
        }

        // Find user by email address
        $user = User::where('email', $email)->first();

        // Verify user exists in database
        if (!$user) {
            return back()->withErrors(['otp' => 'User not found.']);
        }

        // Combine the 6 individual OTP digits into a single string
        // Example: ['1', '2', '3', '4', '5', '6'] becomes '123456'
        $otpCode = implode('', $request->otp);

        // Verify the OTP code is valid and not expired
        if (!$user->verifyOtp($otpCode)) {
            return back()->withErrors(['otp' => 'Invalid or expired OTP code.']);
        }

        // OTP is valid - set verification flag in session
        // This flag allows access to the password reset form
        session(['password_reset_verified' => true]);

        // Redirect to password reset form
        return redirect()->route('password.reset.form');
    }

    /**
     * Show password reset form.
     * 
     * Displays the form where users can enter their new password. This page
     * is only accessible after successful OTP verification. If the verification
     * flag is not present in the session, redirects back to email entry.
     * 
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     *         Redirects to email page if not verified,
     *         otherwise renders password reset form
     * 
     * Session Requirements:
     * - 'password_reset_verified' => true: Must be set by verifyOtp()
     * 
     * Security:
     * - Prevents direct access to reset form without OTP verification
     * - Session-based authorization for multi-step flow
     * 
     * @see resources/js/Pages/Auth/ResetPasswordForm.vue
     */
    public function showResetForm()
    {
        // Check if OTP has been verified (flag set in session)
        if (!session('password_reset_verified')) {
            // Not verified - redirect to email entry page
            return redirect()->route('password.request.email');
        }

        // Render password reset form
        return Inertia::render('Auth/ResetPasswordForm');
    }

    /**
     * Reset the password.
     * 
     * Updates the user's password after validating the new password and ensuring
     * proper OTP verification. Clears the OTP, cleans up session data, and
     * redirects to login with a success message.
     * 
     * Process:
     * 1. Verify session has verification flag
     * 2. Validate new password and confirmation
     * 3. Retrieve email from session
     * 4. Find user by email
     * 5. Update password with bcrypt hash
     * 6. Clear OTP from user record
     * 7. Clear session data
     * 8. Redirect to login
     * 
     * @param Request $request The HTTP request containing new password
     * 
     * @return \Illuminate\Http\RedirectResponse Redirects to login or back with errors
     * 
     * Request Data Required:
     * - password (string): New password, min 8 characters
     * - password_confirmation (string): Must match password
     * 
     * Validation Rules:
     * - password: 'required|string|min:8|confirmed'
     * 
     * Error Scenarios:
     * 1. Not verified: "Unauthorized action."
     * 2. User not found: "User not found."
     * 3. Validation failed: Standard password validation errors
     * 
     * Database Operations:
     * - Updates users.password with bcrypt hash
     * - Clears OTP fields via clearOtp()
     * 
     * Session Operations:
     * - Clears 'password_reset_email'
     * - Clears 'password_reset_verified'
     * 
     * Session Flash Data (on success):
     * - 'status' => 'Password reset successfully! You can now login.'
     * 
     * Security Notes:
     * - Verification flag required to prevent unauthorized resets
     * - Password hashed with bcrypt before storage
     * - OTP cleared to prevent reuse
     * - Session cleaned to prevent replay attacks
     * 
     * Recommended Enhancements:
     * - Send email notification of password change
     * - Invalidate all user sessions
     * - Log password reset event for audit
     * 
     * @see \App\Models\User::clearOtp()
     */
    public function resetPassword(Request $request)
    {
        // Verify OTP has been verified (authorization check)
        if (!session('password_reset_verified')) {
            return back()->withErrors(['password' => 'Unauthorized action.']);
        }

        // Validate new password and confirmation
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Retrieve email from session
        $email = session('password_reset_email');

        // Find user by email
        $user = User::where('email', $email)->first();

        // Verify user exists
        if (!$user) {
            return back()->withErrors(['password' => 'User not found.']);
        }

        // Update user's password with bcrypt hash
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Clear OTP from database
        // Prevents OTP reuse and cleanup
        $user->clearOtp();

        // Clear all session data related to password reset
        // Prevents replay attacks and cleanup
        session()->forget(['password_reset_email', 'password_reset_verified']);

        // Redirect to login page with success message
        return redirect()->route('login')
            ->with('status', 'Password reset successfully! You can now login.');
    }

    /**
     * Resend OTP for password reset.
     * 
     * Generates a new OTP and sends it via email. This endpoint is rate-limited
     * to prevent abuse and returns JSON responses suitable for AJAX requests.
     * 
     * Rate Limiting:
     * - 1 request per minute per IP address
     * - Uses Laravel's RateLimiter facade
     * - Returns 429 status code when limit exceeded
     * 
     * Process:
     * 1. Check rate limit
     * 2. Verify session data exists
     * 3. Find user by email
     * 4. Generate new OTP
     * 5. Send OTP via email
     * 6. Set rate limiter
     * 7. Return JSON success response
     * 
     * @param Request $request The HTTP request (typically AJAX)
     * 
     * @return \Illuminate\Http\JsonResponse JSON response with status message
     * 
     * Response Status Codes:
     * - 200: Success - new OTP sent
     * - 400: Bad request - session expired
     * - 404: Not found - user not found
     * - 429: Too many requests - rate limit exceeded
     * - 500: Server error - failed to send email
     * 
     * Response JSON Structure:
     * {
     *     "message": "Status or error message"
     * }
     * 
     * Rate Limiting Key:
     * - Format: 'resend-password-otp:{ip_address}'
     * - Duration: 60 seconds
     * 
     * @see \App\Models\User::generateOtp()
     * @see \App\Notifications\SendOtpNotification
     * @see \Illuminate\Support\Facades\RateLimiter
     */
    public function resendOtp(Request $request)
    {
        // Create unique rate limiting key based on IP address
        $key = 'resend-password-otp:' . $request->ip();

        // Check if rate limit has been exceeded
        if (RateLimiter::tooManyAttempts($key, 1)) {
            // Get remaining seconds until next attempt
            $seconds = RateLimiter::availableIn($key);

            // Return 429 Too Many Requests with countdown
            return response()->json([
                'message' => "Please wait {$seconds} seconds before requesting another code."
            ], 429);
        }

        // Retrieve email from session
        $email = session('password_reset_email');

        // Verify session data exists
        if (!$email) {
            return response()->json([
                'message' => 'Session expired. Please start over.'
            ], 400);
        }

        // Find user by email
        $user = User::where('email', $email)->first();

        // Verify user exists
        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        // Generate new OTP code
        // This invalidates any previous OTP
        $otpCode = $user->generateOtp();

        // Send OTP via email notification
        try {
            $user->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            // Log error for debugging
            \Log::error('Failed to resend password reset OTP: ' . $e->getMessage());

            // Return 500 Internal Server Error
            return response()->json([
                'message' => 'Failed to send verification code. Please try again.'
            ], 500);
        }

        // Record this resend attempt in rate limiter
        // Blocks further attempts for 60 seconds
        RateLimiter::hit($key, 60);

        // Return success response
        return response()->json([
            'message' => 'New verification code sent successfully!'
        ], 200);
    }
}
