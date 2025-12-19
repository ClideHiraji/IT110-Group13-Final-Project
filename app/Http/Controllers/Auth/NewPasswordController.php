<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * NewPasswordController
 * 
 * Handles the password reset process for users who have forgotten their passwords.
 * This controller works in conjunction with Laravel's built-in password reset system,
 * validating reset tokens and updating user passwords securely.
 * 
 * Password Reset Flow:
 * 1. User requests password reset (PasswordResetLinkController)
 * 2. System sends email with signed reset link containing token
 * 3. User clicks link and is directed to create() method (shows reset form)
 * 4. User submits new password via store() method
 * 5. Token is validated and password is updated
 * 6. User is redirected to login with success message
 * 
 * Security Features:
 * - Tokens are cryptographically secure and stored hashed in database
 * - Tokens expire after configured time (default: 60 minutes in config/auth.php)
 * - Remember tokens are regenerated to invalidate old sessions
 * - Passwords are hashed using bcrypt via Hash facade
 * - Password validation rules enforce complexity requirements
 * 
 * Database Requirements:
 * - 'password_reset_tokens' table with columns: email, token, created_at
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \App\Http\Controllers\Auth\PasswordResetLinkController
 * @see \Illuminate\Auth\Passwords\PasswordBroker
 * @see config/auth.php
 */
class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     * 
     * Renders the password reset form where users can enter their new password.
     * The form is pre-populated with the email address and includes the reset
     * token as a hidden field for validation during submission.
     * 
     * This method is accessed via the link sent in the password reset email,
     * which contains both the token and email as URL parameters.
     * 
     * URL Structure:
     * /reset-password/{token}?email={email}
     * 
     * @param Request $request The HTTP request containing email and token
     * 
     * @return Response Inertia response rendering the password reset form
     * 
     * Props Passed to Frontend:
     * - email (string): The user's email address from query parameters
     * - token (string): The password reset token from route parameter
     * 
     * Frontend Form Fields:
     * - email (pre-filled, read-only)
     * - password (new password input)
     * - password_confirmation (confirmation input)
     * - token (hidden field)
     * 
     * @see resources/js/Pages/Auth/ResetPassword.vue
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     * 
     * Validates the reset token and updates the user's password if valid.
     * This method performs several security checks and operations:
     * 
     * Process Flow:
     * 1. Validate request data (token, email, password with confirmation)
     * 2. Verify token is valid and not expired using Password facade
     * 3. Update user's password with bcrypt hash
     * 4. Regenerate remember token to invalidate existing sessions
     * 5. Dispatch PasswordReset event for logging/notifications
     * 6. Delete used token from database
     * 7. Redirect to login with success message or throw validation error
     * 
     * @param Request $request The HTTP request containing reset credentials
     * 
     * @return RedirectResponse Redirects to login page on success
     * 
     * @throws ValidationException If token is invalid, expired, or email not found
     * 
     * Request Data Required:
     * - token (string): The password reset token from the email link
     * - email (string): Must be valid email format
     * - password (string): Must pass complexity rules and be confirmed
     * - password_confirmation (string): Must match password field
     * 
     * Validation Rules:
     * - token: Required
     * - email: Required, valid email format
     * - password: Required, confirmed, must meet Rules\Password::defaults()
     *   (typically: min 8 chars, mixed case, numbers, symbols based on config)
     * 
     * Database Updates:
     * - users.password: Updated with bcrypt hash of new password
     * - users.remember_token: Regenerated (60 char random string)
     * - password_reset_tokens: Token deleted after successful reset
     * 
     * Events Dispatched:
     * - PasswordReset: Fired after successful password update
     * 
     * Response Scenarios:
     * 1. Success: Redirects to login with 'passwords.reset' status message
     * 2. Failure: Throws ValidationException with specific error:
     *    - passwords.token: Invalid or expired token
     *    - passwords.user: Email not found in database
     *    - passwords.throttled: Too many reset attempts
     * 
     * Session Flash Data (on success):
     * - 'status' => __('passwords.reset'): Localized success message
     * 
     * @see \Illuminate\Support\Facades\Password::reset()
     * @see \Illuminate\Auth\Events\PasswordReset
     * @see config/auth.php ('passwords' configuration)
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the incoming request data
        // Ensures all required fields are present and meet security requirements
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Attempt to reset the user's password using Laravel's Password broker
        // This validates the token, finds the user, and executes the callback
        // if validation succeeds
        $status = Password::reset(
            // Pass only the necessary credentials to the Password broker
            $request->only('email', 'password', 'password_confirmation', 'token'),
            
            // Callback executed only if token validation succeeds
            // $user parameter is the authenticated User model instance
            function ($user) use ($request) {
                // Force fill allows mass assignment of protected attributes
                $user->forceFill([
                    // Hash the new password using bcrypt (cost factor from config)
                    'password' => Hash::make($request->password),
                    
                    // Regenerate remember token to invalidate all existing
                    // "remember me" sessions across all devices for security
                    'remember_token' => Str::random(60),
                ])->save();

                // Dispatch the PasswordReset event
                // Listeners can use this for logging, notifications, or analytics
                event(new PasswordReset($user));
            }
        );

        // Check if the password reset was successful
        // Password::PASSWORD_RESET is a constant indicating success
        if ($status == Password::PASSWORD_RESET) {
            // Success - redirect to login page with localized success message
            // User must log in with their new password
            return redirect()->route('login')->with('status', __($status));
        }

        // Password reset failed - throw a validation exception
        // This handles cases like invalid/expired tokens, user not found, etc.
        // The $status variable contains the specific error key (e.g., 'passwords.token')
        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
