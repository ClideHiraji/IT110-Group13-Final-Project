<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\SendOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

/**
 * OtpVerificationController
 * 
 * Handles One-Time Password (OTP) verification during user registration.
 * This controller implements a secure email-based verification flow where users
 * must verify their email address with a 6-digit OTP code before account creation.
 * 
 * Registration Flow:
 * 1. User submits registration form (RegisteredUserController)
 * 2. System generates 6-digit OTP and stores in session with expiration
 * 3. OTP is sent via email (SendOtpNotification)
 * 4. User is redirected to OTP verification page (show method)
 * 5. User enters OTP code and submits (verify method)
 * 6. If valid: User account is created, auto-logged in, redirected to home
 * 7. If invalid/expired: Error shown, user can resend OTP (resend method)
 * 
 * Security Features:
 * - OTP expires after 10 minutes
 * - Rate limiting on resend (1 request per minute per IP)
 * - Session-based storage prevents database pollution
 * - OTP is 6 digits (000000-999999) providing 1 million combinations
 * - Session expires if user navigates away or refreshes browser
 * 
 * Session Data Structure:
 * 'registration_data' => [
 *     'name' => string,
 *     'email' => string,
 *     'password' => string (hashed),
 *     'otp_code' => string (6 digits),
 *     'otp_expires_at' => Carbon datetime
 * ]
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \App\Http\Controllers\Auth\RegisteredUserController
 * @see \App\Notifications\SendOtpNotification
 */
class OtpVerificationController extends Controller
{
    /**
     * Show the OTP verification page.
     * 
     * Displays the OTP input form where users enter the 6-digit code sent to
     * their email. This page is only accessible if registration data exists in
     * the session. If no session data is found, the user is redirected back to
     * the registration page.
     * 
     * Page Features:
     * - 6 individual input boxes for each OTP digit
     * - Email address display (masked or full)
     * - Resend OTP button
     * - OTP expiration countdown timer (optional)
     * 
     * @return \Illuminate\Http\RedirectResponse|\Inertia\Response
     *         Redirects to registration if session expired,
     *         otherwise renders OTP verification page
     * 
     * Session Requirements:
     * - 'registration_data': Must contain user registration info and OTP
     * 
     * Props Passed to Frontend:
     * - email (string): User's email address for display and context
     * 
     * @see resources/js/Pages/Auth/VerifyOtp.vue
     */
    public function show()
    {
        // Retrieve registration data from session
        // This was set during the registration process
        $registrationData = session('registration_data');
        
        // Check if session data exists
        // Session may be lost due to timeout, browser refresh, or manual clearing
        if (!$registrationData) {
            // No session data - redirect back to registration page
            return redirect()->route('register');
        }

        // Render the OTP verification page with user's email
        return Inertia::render('Auth/VerifyOtp', [
            'email' => $registrationData['email'],
        ]);
    }

    /**
     * Verify the OTP code.
     * 
     * Validates the user-submitted OTP code against the stored code in the session.
     * If valid and not expired, creates the user account, auto-logs them in, and
     * redirects to the home page with a welcome message.
     * 
     * Validation Process:
     * 1. Validate OTP format (6 individual digits)
     * 2. Check session data exists
     * 3. Combine OTP digits into single string
     * 4. Verify OTP matches stored code
     * 5. Check OTP hasn't expired (10-minute window)
     * 6. Create user account with verified status
     * 7. Clear session data
     * 8. Auto-login user
     * 9. Redirect to home page
     * 
     * @param Request $request The HTTP request containing OTP digits
     * 
     * @return \Illuminate\Http\RedirectResponse Redirects to home on success,
     *                                           back to form with errors on failure
     * 
     * Request Data Expected:
     * - otp (array): Array of 6 digits, e.g., ['1', '2', '3', '4', '5', '6']
     * 
     * Validation Rules:
     * - otp: Required, must be array, must have exactly 6 elements
     * - otp.*: Each element must be required, numeric, single digit (0-9)
     * 
     * Error Scenarios:
     * 1. Session expired: "Session expired. Please register again."
     * 2. Invalid OTP: "Invalid OTP code."
     * 3. Expired OTP: "OTP code has expired. Please request a new one."
     * 
     * Database Operations:
     * - Creates new user in 'users' table with:
     *   - name, email, password (from session)
     *   - is_verified = true (OTP verified)
     * 
     * Session Operations:
     * - Clears 'registration_data' after successful verification
     * - Sets 'status' flash message for welcome notification
     * 
     * @see \App\Models\User::create()
     */
    public function verify(Request $request)
    {
        // Validate the OTP input format
        // Ensures we receive exactly 6 individual numeric digits
        $request->validate([
            'otp' => 'required|array|size:6',
            'otp.*' => 'required|numeric|digits:1',
        ]);

        // Retrieve registration data from session
        $registrationData = session('registration_data');

        // Check if session still contains registration data
        // Session may have expired or been cleared
        if (!$registrationData) {
            return back()->withErrors(['otp' => 'Session expired. Please register again.']);
        }

        // Combine the 6 individual OTP digits into a single string
        // Example: ['1', '2', '3', '4', '5', '6'] becomes '123456'
        $otpCode = implode('', $request->otp);

        // Verify the OTP code matches the one stored in session
        // Uses strict comparison for security
        if ($registrationData['otp_code'] !== $otpCode) {
            return back()->withErrors(['otp' => 'Invalid OTP code.']);
        }

        // Check if the OTP has expired (10-minute validity window)
        // Uses Carbon's greaterThan for datetime comparison
        if (now()->greaterThan($registrationData['otp_expires_at'])) {
            return back()->withErrors(['otp' => 'OTP code has expired. Please request a new one.']);
        }

        // OTP is valid and not expired - create the user account
        $user = \App\Models\User::create([
            'name' => $registrationData['name'],
            'email' => $registrationData['email'],
            'password' => $registrationData['password'], // Already hashed during registration
            'is_verified' => true, // Mark as verified since OTP was validated
        ]);

        // Clear registration data from session
        // Prevents reuse of OTP or registration data
        session()->forget('registration_data');

        // Automatically log in the newly created user
        // User doesn't need to manually login after registration
        Auth::login($user);

        // Redirect to home page with welcome message
        // Using '/' instead of route name for explicit home redirect
        return redirect('/')->with('status', 'Welcome! Your account has been created successfully.');
    }

    /**
     * Resend OTP code.
     * 
     * Generates a new OTP code and sends it via email. This endpoint is rate-limited
     * to prevent abuse, allowing only 1 resend request per minute per IP address.
     * Returns JSON responses suitable for AJAX requests from the frontend.
     * 
     * Rate Limiting:
     * - 1 request per minute per IP address
     * - Uses Laravel's RateLimiter facade
     * - Returns 429 status code when limit exceeded
     * - Includes seconds to wait in error message
     * 
     * Process Flow:
     * 1. Check rate limit (1 per minute)
     * 2. Verify session data exists
     * 3. Generate new 6-digit OTP code
     * 4. Set new expiration time (10 minutes)
     * 5. Update session with new OTP data
     * 6. Send OTP via email notification
     * 7. Set rate limiter for 60 seconds
     * 8. Return JSON success response
     * 
     * @param Request $request The HTTP request (typically AJAX)
     * 
     * @return \Illuminate\Http\JsonResponse JSON response with status message
     * 
     * Response Status Codes:
     * - 200: Success - new OTP sent
     * - 400: Bad request - session expired
     * - 429: Too many requests - rate limit exceeded
     * - 500: Server error - failed to send email
     * 
     * Response JSON Structure (Success):
     * {
     *     "message": "New verification code sent successfully!"
     * }
     * 
     * Response JSON Structure (Error):
     * {
     *     "message": "Error description"
     * }
     * 
     * Rate Limiting Key:
     * - Format: 'resend-otp:{ip_address}'
     * - Duration: 60 seconds per attempt
     * 
     * Session Updates:
     * - registration_data.otp_code: New 6-digit code
     * - registration_data.otp_expires_at: New expiration timestamp
     * 
     * @see \App\Notifications\SendOtpNotification
     * @see \Illuminate\Support\Facades\RateLimiter
     */
    public function resend(Request $request)
    {
        // Create unique rate limiting key based on IP address
        // This allows different users to resend independently
        $key = 'resend-otp:' . $request->ip();
        
        // Check if rate limit has been exceeded (1 attempt allowed)
        if (RateLimiter::tooManyAttempts($key, 1)) {
            // Get remaining seconds until next attempt is allowed
            $seconds = RateLimiter::availableIn($key);
            
            // Return 429 Too Many Requests with countdown message
            return response()->json([
                'message' => "Please wait {$seconds} seconds before requesting another code."
            ], 429);
        }

        // Retrieve registration data from session
        $registrationData = session('registration_data');

        // Verify session data still exists
        if (!$registrationData) {
            return response()->json([
                'message' => 'Session expired. Please register again.'
            ], 400);
        }

        // Generate a new random 6-digit OTP code
        // random_int(0, 999999) generates 0-999999
        // str_pad ensures leading zeros (e.g., 000042)
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Set new expiration time (10 minutes from now)
        $expiresAt = now()->addMinutes(10);

        // Update session with new OTP code and expiration
        $registrationData['otp_code'] = $otpCode;
        $registrationData['otp_expires_at'] = $expiresAt;
        session(['registration_data' => $registrationData]);

        // Send the new OTP via email notification
        try {
            // Use on-demand notification without requiring a User model
            \Notification::route('mail', $registrationData['email'])
                ->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Failed to resend OTP: ' . $e->getMessage());
            
            // Return 500 Internal Server Error
            return response()->json([
                'message' => 'Failed to send OTP. Please try again.'
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

    /**
     * Show verification success page (optional).
     * 
     * Displays a success page after OTP verification. This is an optional feature
     * that can be used to show a custom success message or onboarding information
     * before redirecting to the main application.
     * 
     * Note: Currently, the verify() method redirects directly to home page,
     * so this method may not be used in the current flow. It can be activated
     * by changing the verify() redirect to route('otp.success').
     * 
     * Potential Uses:
     * - Display welcome message and next steps
     * - Show onboarding tutorial
     * - Collect additional user information
     * - Display promotional content for new users
     * 
     * @return \Inertia\Response Renders verification success page
     * 
     * @see resources/js/Pages/Auth/VerificationSuccess.vue
     */
    public function success()
    {
        return Inertia::render('Auth/VerificationSuccess');
    }
}
