<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ConfirmablePasswordController
 * 
 * Handles password confirmation for sensitive operations. This controller implements
 * Laravel's password confirmation feature, which requires users to re-enter their
 * password before accessing protected routes or performing critical actions.
 * 
 * This adds an extra layer of security for operations like:
 * - Changing account settings
 * - Viewing sensitive information
 * - Performing destructive actions
 * - Accessing admin areas
 * 
 * The confirmation is valid for a configurable time period (default: 3 hours)
 * as defined in config/auth.php under 'password_timeout'.
 * 
 * @package App\Http\Controllers\Auth
 */
class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password view.
     * 
     * Displays the password confirmation page where users must re-enter their
     * current password to proceed with a sensitive operation. The page is rendered
     * using Inertia.js.
     * 
     * This method is typically accessed when:
     * - A route is protected by the 'password.confirm' middleware
     * - The user's password confirmation has expired
     * - The user hasn't confirmed their password in the current session
     * 
     * @return Response Inertia response rendering the password confirmation form
     * 
     * @see resources/js/Pages/Auth/ConfirmPassword.vue
     */
    public function show(): Response
    {
        return Inertia::render('Auth/ConfirmPassword');
    }

    /**
     * Confirm the user's password.
     * 
     * Validates the user's password against their current credentials. If valid,
     * stores a timestamp in the session and redirects to the originally intended
     * destination. If invalid, throws a validation exception.
     * 
     * Security Flow:
     * 1. Validates the password against the authenticated user's credentials
     * 2. If invalid: throws ValidationException with localized error message
     * 3. If valid: stores confirmation timestamp in session
     * 4. Redirects to intended URL or dashboard as fallback
     * 
     * @param Request $request The HTTP request containing the password
     * 
     * @return RedirectResponse Redirects to intended URL or dashboard
     * 
     * @throws ValidationException If the provided password is incorrect
     * 
     * Request Data Expected:
     * - password (string): The user's current password to confirm
     * 
     * Session Variables Set:
     * - 'auth.password_confirmed_at' (int): Unix timestamp of confirmation
     * 
     * @see \Illuminate\Auth\Middleware\RequirePassword
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the password by checking it against the user's current credentials
        // Uses the web guard to verify email and password combination
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            // Password validation failed - throw a validation exception
            // Uses Laravel's localized auth messages from resources/lang
            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        // Password confirmed successfully
        // Store the current timestamp to track when password was last confirmed
        // This timestamp is used by the 'password.confirm' middleware to determine
        // if re-confirmation is needed based on the configured timeout period
        $request->session()->put('auth.password_confirmed_at', time());

        // Redirect to the originally intended URL (stored by password.confirm middleware)
        // Falls back to dashboard if no intended URL exists
        // The 'absolute: false' parameter generates a relative URL
        return redirect()->intended(route('dashboard', absolute: false));
    }
}
