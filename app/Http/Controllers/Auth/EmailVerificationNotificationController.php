<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * EmailVerificationNotificationController
 * 
 * Handles the sending of email verification notifications to users who have
 * registered but not yet verified their email addresses. This controller works
 * in conjunction with Laravel's built-in email verification system.
 * 
 * Email verification is typically used to:
 * - Confirm the user owns the email address they registered with
 * - Prevent spam registrations with fake email addresses
 * - Ensure communication channels are valid before granting full access
 * - Comply with security best practices for user authentication
 * 
 * This controller is usually accessed when:
 * - Users click "Resend verification email" on the verification notice page
 * - The initial verification email was not received or expired
 * - Users need a new verification link after changing their email
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \Illuminate\Contracts\Auth\MustVerifyEmail
 * @see \Illuminate\Auth\Notifications\VerifyEmail
 */
class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     * 
     * Resends the email verification notification to the authenticated user.
     * This method performs a check to prevent sending verification emails to
     * users who have already verified their email address.
     * 
     * Flow:
     * 1. Check if the user's email is already verified
     *    - If verified: redirect to intended destination (usually dashboard)
     * 2. If not verified: send a new verification email notification
     * 3. Return to the previous page with a success status message
     * 
     * The verification email contains a signed URL that expires after a
     * configured time period (default: 60 minutes) as defined in
     * config/auth.php under 'verification.expire'.
     * 
     * @param Request $request The HTTP request instance with authenticated user
     * 
     * @return RedirectResponse Redirects to dashboard if already verified,
     *                          or back to previous page with status message
     * 
     * Prerequisites:
     * - User must be authenticated (typically via 'auth' middleware)
     * - User model must implement MustVerifyEmail interface
     * 
     * Session Flash Data Set:
     * - 'status' => 'verification-link-sent': Indicates successful email dispatch
     * 
     * Response Scenarios:
     * 1. Email already verified: Redirects to intended URL or dashboard
     * 2. Verification sent: Returns to previous page with 'verification-link-sent' status
     * 
     * @see \Illuminate\Foundation\Auth\User::hasVerifiedEmail()
     * @see \Illuminate\Foundation\Auth\User::sendEmailVerificationNotification()
     * @see \Illuminate\Auth\Middleware\EnsureEmailIsVerified
     */
    public function store(Request $request): RedirectResponse
    {
        // Check if the user has already verified their email address
        // This prevents unnecessary email sends and potential abuse
        if ($request->user()->hasVerifiedEmail()) {
            // Email is already verified - redirect to the intended destination
            // or fall back to the dashboard
            // The 'absolute: false' parameter generates a relative URL
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // Email is not verified - send a new verification notification
        // This generates a signed, time-limited URL and sends it via email
        // The notification uses the VerifyEmail notification class by default
        $request->user()->sendEmailVerificationNotification();

        // Return to the previous page (usually the email verification notice page)
        // with a status message that can be displayed to the user
        // The frontend can check for this status to show a success message
        return back()->with('status', 'verification-link-sent');
    }
}
