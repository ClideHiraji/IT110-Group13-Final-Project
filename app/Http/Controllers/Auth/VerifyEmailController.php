<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

/**
 * VerifyEmailController
 * 
 * Handles email verification via signed URL links sent to users' email addresses.
 * This controller works with Laravel's built-in email verification system, validating
 * signed URLs and marking user accounts as verified.
 * 
 * Email Verification Flow:
 * 1. User registers account (unverified state)
 * 2. System sends verification email with signed URL
 * 3. User clicks link in email (routes to this controller)
 * 4. Controller validates signed URL and user ID
 * 5. If already verified: redirect to dashboard with verified flag
 * 6. If not verified: mark as verified, fire event, redirect to dashboard
 * 
 * Security Features:
 * - Signed URLs prevent tampering with verification links
 * - URLs expire after configured time (default: 60 minutes)
 * - User ID must match signed URL payload
 * - Hash validation ensures link authenticity
 * - Duplicate verification attempts are handled gracefully
 * 
 * URL Structure:
 * /email/verify/{id}/{hash}?expires={timestamp}&signature={signature}
 * 
 * Middleware Requirements:
 * - 'auth': User must be authenticated
 * - 'signed': URL must have valid signature
 * - 'throttle:6,1': Rate limit to 6 attempts per minute
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \Illuminate\Foundation\Auth\EmailVerificationRequest
 * @see \Illuminate\Auth\Events\Verified
 * @see \Illuminate\Contracts\Auth\MustVerifyEmail
 */
class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     * 
     * This invokable controller method processes email verification link clicks.
     * It checks if the email is already verified and either redirects immediately
     * or marks the email as verified, fires the Verified event, and then redirects.
     * 
     * Request Validation:
     * - EmailVerificationRequest handles:
     *   - User authentication check
     *   - Signed URL validation
     *   - User ID and hash matching
     *   - Expiration time verification
     * 
     * Process Flow:
     * 1. Check if email is already verified
     * 2. If verified: redirect to dashboard with verified=1 query param
     * 3. If not verified: call markEmailAsVerified()
     * 4. If marking succeeded: fire Verified event
     * 5. Redirect to dashboard with verified=1 query param
     * 
     * @param EmailVerificationRequest $request Specialized request with signature validation
     * 
     * @return RedirectResponse Redirects to intended URL or dashboard
     * 
     * Query Parameters Added:
     * - verified=1: Indicates successful verification for frontend display
     * 
     * Event Dispatched:
     * - Verified: Fired when email is successfully marked as verified
     *   Listeners can use this for:
     *   - Sending welcome emails
     *   - Granting access to features
     *   - Analytics/logging
     *   - Awarding points/badges
     * 
     * Database Updates:
     * - users.email_verified_at: Set to current timestamp
     * 
     * Frontend Handling:
     * - Check for 'verified=1' query parameter
     * - Display success message (e.g., "Email verified successfully!")
     * - Update UI to reflect verified status
     * - Grant access to features requiring verification
     * 
     * Edge Cases Handled:
     * 1. Already verified: Silently redirect (idempotent)
     * 2. Expired link: Caught by EmailVerificationRequest (403 response)
     * 3. Invalid signature: Caught by EmailVerificationRequest (403 response)
     * 4. Wrong user: Caught by EmailVerificationRequest (403 response)
     * 
     * Response Scenarios:
     * - Success: Redirects to intended URL or dashboard with verified=1
     * - Already verified: Redirects to dashboard with verified=1
     * - Invalid: 403 Forbidden (handled by request validation)
     * 
     * Configuration:
     * - Expiration: config/auth.php -> 'verification.expire' (default: 60 min)
     * - Model: User must implement MustVerifyEmail interface
     * 
     * @see \Illuminate\Foundation\Auth\User::markEmailAsVerified()
     * @see \Illuminate\Foundation\Auth\User::hasVerifiedEmail()
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // Check if the user's email is already verified
        // This prevents duplicate processing and event firing
        if ($request->user()->hasVerifiedEmail()) {
            // Email already verified - redirect to dashboard with verified flag
            // The '?verified=1' query parameter helps frontend show success message
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        // Email not verified yet - mark it as verified
        // markEmailAsVerified() updates email_verified_at timestamp
        // Returns true if the update was successful
        if ($request->user()->markEmailAsVerified()) {
            // Successfully marked as verified - fire the Verified event
            // Event listeners can perform additional actions like:
            // - Sending welcome email
            // - Logging verification event
            // - Granting access to features
            // - Updating user permissions
            event(new Verified($request->user()));
        }

        // Redirect to the intended URL or dashboard
        // The 'intended' method checks for a stored intended URL
        // Falls back to dashboard if no intended URL exists
        // Appends '?verified=1' to show success message on frontend
        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}
