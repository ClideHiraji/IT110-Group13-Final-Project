<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureOtpVerified Middleware
 * 
 * Middleware that ensures users have verified their account via OTP before
 * accessing protected routes. This provides an additional layer of email
 * verification beyond Laravel's standard email verification.
 * 
 * Verification Flow:
 * 1. User registers and receives OTP
 * 2. User verifies OTP (is_verified set to true)
 * 3. Middleware allows access to protected routes
 * 4. If not verified: redirect to verification page
 * 
 * Features:
 * - Checks user's is_verified flag
 * - Handles both web and API requests differently
 * - Stores email in session for verification page
 * - Graceful handling of unauthenticated users
 * 
 * Usage:
 * Apply to routes requiring OTP verification:
 * ```
 * Route::get('/dashboard', function () {
 *     return view('dashboard');
 * })->middleware(['auth', 'otp.verified']);
 * ```
 * 
 * Middleware Alias:
 * Registered as 'otp.verified' in bootstrap/app.php
 * 
 * @package App\Http\Middleware
 * 
 * @see \App\Http\Controllers\Auth\OtpVerificationController
 */
class EnsureOtpVerified
{
    /**
     * Handle an incoming request.
     * 
     * Checks if the authenticated user has verified their account via OTP.
     * If not verified, redirects web requests or returns JSON error for API requests.
     * 
     * Verification Check:
     * - Checks if user is authenticated
     * - Checks if user's is_verified flag is false
     * - If both true: blocks access and requires verification
     * 
     * Response Types:
     * - Web requests: Redirect to verification.notice route
     * - API/JSON requests: Return 403 Forbidden with JSON error
     * 
     * @param Request $request The incoming HTTP request
     * @param Closure $next The next middleware in the pipeline
     * 
     * @return Response The HTTP response
     * 
     * Allowed Through:
     * - Unauthenticated users (handled by 'auth' middleware)
     * - Authenticated users with is_verified = true
     * 
     * Blocked:
     * - Authenticated users with is_verified = false
     * 
     * Session Data Set:
     * - 'otp_email': User's email address for verification page
     * 
     * API Response (403 Forbidden):
     * ```
     * {
     *   "message": "Please verify your account first.",
     *   "redirect": "/verify-email"
     * }
     * ```
     * 
     * Web Response:
     * - Redirects to route('verification.notice')
     * - Session contains 'otp_email' for pre-filling form
     * 
     * Security Considerations:
     * - Only applies to authenticated users
     * - Prevents unverified users from accessing sensitive features
     * - Does not affect login/logout routes
     * - Compatible with OTP verification system
     * 
     * Frontend Handling (API):
     * - Check for 403 status code
     * - Read 'redirect' field for verification URL
     * - Show verification prompt to user
     * - Resend OTP option
     * 
     * Recommended Route Protection:
     * ```
     * // Protect sensitive routes
     * Route::middleware(['auth', 'otp.verified'])->group(function () {
     *     Route::get('/profile', [ProfileController::class, 'edit']);
     *     Route::get('/dashboard', [DashboardController::class, 'index']);
     *     Route::resource('posts', PostController::class);
     * });
     * ```
     * 
     * @see \App\Models\User::$is_verified
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated AND not verified
        if ($request->user() && !$request->user()->is_verified) {
            // Store email in session for verification page
            session(['otp_email' => $request->user()->email]);

            // Handle API/JSON requests differently from web requests
            // API: Return JSON error with 403 status
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Please verify your account first.',
                    'redirect' => route('verification.notice')
                ], 403);
            }

            // Web: Redirect to verification page
            return redirect()->route('verification.notice');
        }

        // User is either not authenticated or already verified - allow through
        return $next($request);
    }
}
