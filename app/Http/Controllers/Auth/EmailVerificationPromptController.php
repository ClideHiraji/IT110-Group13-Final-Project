<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * EmailVerificationPromptController
 * 
 * Displays the email verification prompt page to users who have not yet verified
 * their email addresses. This is a single-action (invokable) controller that acts
 * as a gateway, either showing the verification notice or allowing access if the
 * email is already verified.
 * 
 * This controller is typically invoked by the 'verified' middleware when a user
 * attempts to access a protected route without having verified their email. It
 * serves as a friendly reminder page with options to:
 * - Resend the verification email
 * - Log out if they used the wrong account
 * - See their current verification status
 * 
 * Usage in Routes:
 * Route::get('/email/verify', [EmailVerificationPromptController::class, '__invoke'])
 *     ->middleware('auth')
 *     ->name('verification.notice');
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \Illuminate\Auth\Middleware\EnsureEmailIsVerified
 * @see \App\Http\Controllers\Auth\EmailVerificationNotificationController
 */
class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     * 
     * This invokable controller method determines whether to show the email
     * verification notice page or redirect the user to their intended destination.
     * It acts as a conditional gateway based on the user's email verification status.
     * 
     * Logic Flow:
     * 1. Check if the authenticated user has already verified their email
     * 2. If verified: redirect to the intended URL (or dashboard as fallback)
     * 3. If not verified: render the email verification notice page
     * 
     * The verification notice page typically displays:
     * - A message explaining email verification is required
     * - The email address that needs verification
     * - A button to resend the verification email
     * - A logout link for users who need to use a different account
     * 
     * @param Request $request The HTTP request instance with authenticated user
     * 
     * @return RedirectResponse|Response Either redirects to intended destination
     *                                   or renders the verification notice page
     * 
     * Return Type Details:
     * - RedirectResponse: When email is already verified, redirects to intended URL
     * - Response (Inertia): When email is not verified, renders the notice page
     * 
     * Prerequisites:
     * - User must be authenticated (enforced by 'auth' middleware)
     * - User model must implement the MustVerifyEmail interface
     * 
     * Session Data Used:
     * - 'status': Flash message from resend attempts (e.g., 'verification-link-sent')
     * - 'url.intended': The URL the user originally tried to access
     * 
     * Props Passed to Frontend (when rendering):
     * - status (string|null): Session status message for display
     * 
     * @see \Illuminate\Foundation\Auth\User::hasVerifiedEmail()
     * @see resources/js/Pages/Auth/VerifyEmail.vue
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        // Use ternary operator to conditionally return based on verification status
        return $request->user()->hasVerifiedEmail()
                    // Email is verified - redirect to the intended destination
                    // or fall back to the dashboard route
                    // The 'absolute: false' generates a relative URL path
                    ? redirect()->intended(route('dashboard', absolute: false))
                    
                    // Email is not verified - render the verification notice page
                    // Pass the session status (e.g., 'verification-link-sent')
                    // so the frontend can display success/info messages
                    : Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
}
