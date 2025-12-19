<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * AuthenticatedSessionController
 * 
 * Handles user authentication sessions including login, logout, and two-factor
 * authentication (2FA) flow. This controller manages the complete authentication
 * lifecycle for web-based users.
 * 
 * @package App\Http\Controllers\Auth
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     * 
     * Renders the login page using Inertia.js with the ability to reset password
     * and any session status messages (e.g., password reset confirmations).
     * 
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     * 
     * This method processes user login attempts with the following flow:
     * 1. Authenticates user credentials via LoginRequest
     * 2. Regenerates session to prevent session fixation attacks
     * 3. Checks if user has 2FA enabled and confirmed
     *    - If 2FA is enabled: generates OTP, sends notification, logs out temporarily,
     *      stores email in session, and redirects to 2FA challenge page
     *    - If 2FA is disabled: redirects to return_url or home page
     * 
     * @param LoginRequest $request The validated login request containing credentials
     * 
     * @return \Illuminate\Http\RedirectResponse
     * 
     * @throws \Illuminate\Validation\ValidationException If authentication fails
     * 
     * Session Variables Set:
     * - '2fa_email': User's email when 2FA is required
     * - 'url.intended': Return URL for post-authentication redirect
     * 
     * @see \App\Http\Requests\Auth\LoginRequest::authenticate()
     * @see \App\Models\User::generateOtp()
     */
    public function store(LoginRequest $request)
    {
        // Authenticate the user using credentials from the request
        $request->authenticate();

        // Regenerate session ID to prevent session fixation attacks
        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Check if user has two-factor authentication enabled and confirmed
        if ($user->two_factor_enabled && $user->two_factor_confirmed_at) {
            // Generate a new one-time password (OTP) for 2FA
            $otpCode = $user->generateOtp();

            // Attempt to send the OTP via email notification
            try {
                $user->notify(new \App\Notifications\SendOtpNotification($otpCode));
            } catch (\Exception $e) {
                // Log any errors that occur during OTP sending
                // User can still proceed to 2FA page but may not receive the code
                Log::error('Failed to send 2FA OTP: ' . $e->getMessage());
            }

            // Temporarily logout the user until 2FA is completed
            // This ensures the user must verify their identity via OTP
            Auth::logout();

            // Store user's email in session for 2FA verification step
            session(['2fa_email' => $user->email]);
            
            // Preserve the return URL if provided in the request
            if ($request->has('return_url')) {
                session(['url.intended' => $request->return_url]);
            }

            // Redirect to the 2FA challenge page
            return redirect()->route('2fa.challenge');
        }

        // Handle redirect for users without 2FA enabled
        
        // Check if a return URL was provided in the login request
        if ($request->has('return_url')) {
            Log::info('Redirecting to return_url: ' . $request->return_url);
            return redirect()->to($request->return_url);
        }

        // Default redirect: send user to the home page
        Log::info('No return_url found. Redirecting to Home.');
        return redirect()->to('/');
    }

    /**
     * Destroy an authenticated session (logout).
     * 
     * Performs a complete logout by:
     * 1. Logging out the user from the web guard
     * 2. Invalidating the current session
     * 3. Regenerating the CSRF token to prevent token reuse
     * 4. Redirecting to the home page
     * 
     * This ensures all session data is cleared and the user is fully logged out.
     * 
     * @param Request $request The HTTP request instance
     * 
     * @return \Illuminate\Http\RedirectResponse Redirects to home page ('/')
     * 
     * @see \Illuminate\Support\Facades\Auth::logout()
     */
    public function destroy(Request $request)
    {
        // Logout the currently authenticated user from the web guard
        Auth::guard('web')->logout();

        // Invalidate the current session to destroy all session data
        $request->session()->invalidate();

        // Regenerate CSRF token to prevent reuse of old tokens
        $request->session()->regenerateToken();

        // Redirect to the home page
        return redirect()->to('/');
    }
}
