<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

/**
 * Authenticate Middleware
 * 
 * Custom authentication middleware that extends Laravel's base Authenticate middleware.
 * Handles unauthenticated user redirects and determines where users should be sent
 * when authentication is required but not present.
 * 
 * Functionality:
 * - Checks if user is authenticated via session
 * - Redirects unauthenticated users to login page
 * - Preserves intended URL for post-login redirect
 * - Supports both web and API authentication
 * 
 * Usage:
 * Applied to routes via 'auth' middleware alias:
 * ```
 * Route::get('/profile', [ProfileController::class, 'edit'])
 *     ->middleware('auth');
 * ```
 * 
 * @package App\Http\Middleware
 * 
 * @see \Illuminate\Auth\Middleware\Authenticate
 */
class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     * 
     * Determines the redirect location for unauthenticated users attempting to
     * access protected routes. Returns the login route for web requests and null
     * for API requests (which should receive 401 responses instead of redirects).
     * 
     * Request Type Handling:
     * - Web requests: Redirect to login page
     * - API/JSON requests: Return null (triggers 401 response)
     * 
     * Intended URL Preservation:
     * - Laravel automatically stores intended URL in session
     * - After login, user redirected to originally requested page
     * - Implemented via redirect()->intended() helper
     * 
     * @param Request $request The incoming HTTP request
     * 
     * @return string|null Login route name or null for API requests
     * 
     * Return Values:
     * - route('login'): For web browsers (HTML requests)
     * - null: For API clients (JSON requests, returns 401)
     * 
     * Flow for Web Requests:
     * 1. User accesses protected route without authentication
     * 2. Middleware stores intended URL in session
     * 3. Redirects user to route('login')
     * 4. After successful login, redirect to intended URL
     * 
     * Flow for API Requests:
     * 1. API client accesses protected endpoint without token
     * 2. Middleware returns null
     * 3. Laravel sends 401 Unauthorized JSON response
     * 4. Client should handle authentication and retry
     * 
     * JSON Response (API):
     * ```
     * {
     *   "message": "Unauthenticated."
     * }
     * ```
     * 
     * Integration with Auth System:
     * - Works with session-based authentication
     * - Compatible with Sanctum token authentication
     * - Supports guard switching if configured
     * 
     * @see \Illuminate\Http\RedirectResponse::intended()
     */
    protected function redirectTo(Request $request): ?string
    {
        // Check if request expects JSON response (API request)
        // If API: return null to trigger 401 response
        // If Web: return login route for redirect
        return $request->expectsJson() ? null : route('login');
    }
}
