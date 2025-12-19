<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PasswordResetLinkController
 * 
 * Handles the traditional password reset flow using email links with signed tokens.
 * This controller sends password reset links to users who have forgotten their
 * passwords, using Laravel's built-in password reset functionality.
 * 
 * Password Reset Flow:
 * 1. User navigates to "Forgot Password" page (create method)
 * 2. User enters email address
 * 3. User submits form (store method)
 * 4. System validates email exists in database
 * 5. System generates cryptographically secure token
 * 6. Token stored in password_reset_tokens table with expiration
 * 7. Email sent with reset link containing token
 * 8. User clicks link and is directed to NewPasswordController
 * 9. User enters new password
 * 10. Token validated and password updated
 * 
 * Security Features:
 * - Tokens are cryptographically secure and unique
 * - Tokens are hashed before storage in database
 * - Tokens expire after configured time (default: 60 minutes)
 * - Same message shown whether email exists or not (prevents user enumeration)
 * - Throttling prevents brute force email attacks
 * - Tokens deleted after successful password reset
 * 
 * Database Requirements:
 * - 'password_reset_tokens' table with columns: email, token, created_at
 * 
 * Comparison with OTP Method:
 * Traditional Link Method (this controller):
 * - Pros: More familiar to users, works in all email clients
 * - Cons: Long URLs, URL can expire, less mobile-friendly
 * 
 * OTP Method (PasswordResetOtpController):
 * - Pros: Short 6-digit code, better mobile UX, more modern
 * - Cons: Requires manual entry, may be unfamiliar to some users
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \App\Http\Controllers\Auth\NewPasswordController
 * @see \Illuminate\Auth\Passwords\PasswordBroker
 * @see config/auth.php ('passwords' configuration)
 */
class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     * 
     * Renders the "Forgot Password" page where users can request a password
     * reset link by entering their email address. The page includes any status
     * messages from the session (e.g., success messages from previous requests).
     * 
     * @return Response Inertia response rendering the forgot password form
     * 
     * Props Passed to Frontend:
     * - status (string|null): Session status message (e.g., "Reset link sent!")
     * 
     * Form Fields:
     * - email: User's email address (required, valid email format)
     * 
     * Frontend Features:
     * - Email input field
     * - Submit button
     * - Link back to login page
     * - Status message display
     * 
     * @see resources/js/Pages/Auth/ForgotPassword.vue
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     * 
     * Validates the email address and attempts to send a password reset link.
     * Uses Laravel's Password broker to generate a secure token, store it in
     * the database, and send an email with the reset link.
     * 
     * Process Flow:
     * 1. Validate email format
     * 2. Password broker checks if email exists in users table
     * 3. If exists: generate token, store in password_reset_tokens table
     * 4. Send email with reset link containing token
     * 5. Return success message (same for exists/not exists for security)
     * 
     * Token Generation:
     * - Cryptographically secure random token
     * - Hashed before storage in database
     * - Includes email and timestamp
     * - Expires after configured time (default: 60 minutes)
     * 
     * Email Content:
     * - Subject: "Reset Password Notification"
     * - Link format: /reset-password/{token}?email={email}
     * - Expiration time mentioned in email
     * - Link to application login page
     * 
     * @param Request $request The HTTP request containing email address
     * 
     * @return RedirectResponse Redirects back to form with status message
     * 
     * @throws ValidationException If email not found or other error occurs
     * 
     * Request Data Required:
     * - email (string): Required, must be valid email format
     * 
     * Validation Rules:
     * - email: 'required|email'
     * 
     * Password Broker Status Codes:
     * - Password::RESET_LINK_SENT: Link sent successfully
     * - Password::INVALID_USER: Email not found in database
     * - Password::RESET_THROTTLED: Too many reset attempts
     * 
     * Response Scenarios:
     * 1. Success: Redirects back with localized status message
     * 2. Failure: Throws ValidationException with localized error
     * 
     * Security Considerations:
     * - Same success message whether email exists or not
     * - Prevents user enumeration attacks
     * - Throttling prevents spam/abuse
     * - Token stored hashed in database
     * - Old tokens automatically cleaned up
     * 
     * Session Flash Data (on success):
     * - 'status' => __('passwords.sent'): Localized success message
     *   (typically "We have emailed your password reset link!")
     * 
     * Error Messages (on failure):
     * - passwords.user: "We can't find a user with that email address."
     * - passwords.throttled: "Please wait before retrying."
     * 
     * Configuration:
     * - Expiration: config/auth.php -> 'passwords.users.expire' (default: 60 min)
     * - Throttle: config/auth.php -> 'passwords.users.throttle' (default: 60 sec)
     * - Table: config/auth.php -> 'passwords.users.table'
     * 
     * Database Operations:
     * - Inserts/updates record in password_reset_tokens table
     * - Columns: email, token (hashed), created_at
     * - Old tokens for same email are automatically deleted
     * 
     * Email Customization:
     * - Template: resources/views/emails/reset-password.blade.php
     * - Notification: Illuminate\Auth\Notifications\ResetPassword
     * - Can be customized in User model's sendPasswordResetNotification()
     * 
     * @see \Illuminate\Support\Facades\Password::sendResetLink()
     * @see \App\Http\Controllers\Auth\NewPasswordController
     * @see config/auth.php
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the email address format
        // Only checks format, not existence (for security)
        $request->validate([
            'email' => 'required|email',
        ]);

        // Attempt to send the password reset link using Laravel's Password broker
        // The broker handles:
        // 1. Checking if email exists in users table
        // 2. Generating cryptographically secure token
        // 3. Storing hashed token in password_reset_tokens table
        // 4. Sending email with reset link
        // 5. Handling throttling and validation
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // Check if the reset link was sent successfully
        // Password::RESET_LINK_SENT is a constant indicating success
        if ($status == Password::RESET_LINK_SENT) {
            // Success - redirect back with localized success message
            // The __() helper translates the status key to user's language
            // Typical message: "We have emailed your password reset link!"
            return back()->with('status', __($status));
        }

        // Failed to send reset link - throw validation exception
        // This handles cases like:
        // - Email not found in database (passwords.user)
        // - Too many attempts / throttled (passwords.throttled)
        // The error message is localized using trans() helper
        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
