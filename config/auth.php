<?php

/**
 * Authentication Configuration
 * 
 * This file controls all authentication aspects of your application including
 * authentication guards, user providers, password reset settings, and password
 * confirmation timeout.
 * 
 * Key Concepts:
 * - Guards: Define how users are authenticated for each request
 * - Providers: Define how users are retrieved from storage
 * - Password Brokers: Handle password reset functionality
 * 
 * @see https://laravel.com/docs/authentication
 */

return [
    /**
     * Default Authentication Guard
     * 
     * Specifies which guard should be used by default when using the Auth facade
     * without specifying a guard explicitly.
     * 
     * Environment Variable: AUTH_GUARD
     * Default: 'web'
     * 
     * Usage:
     * ```
     * // Uses default guard (web)
     * Auth::user();
     * Auth::check();
     * 
     * // Specify guard explicitly
     * Auth::guard('api')->user();
     * ```
     */
    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /**
     * Authentication Guards
     * 
     * Guards define how users are authenticated for each request. Laravel ships
     * with support for session and token-based authentication out of the box.
     * 
     * Guard Components:
     * - Driver: Authentication mechanism (session, token, etc.)
     * - Provider: Where to retrieve users from
     * 
     * Default Guards:
     * - web: Session-based authentication for web applications
     * 
     * Custom Guards Example:
     * ```
     * 'api' => [
     *     'driver' => 'passport', // or 'sanctum'
     *     'provider' => 'users',
     *     'hash' => false,
     * ],
     * 
     * 'admin' => [
     *     'driver' => 'session',
     *     'provider' => 'admins',
     * ],
     * ```
     * 
     * Supported Drivers:
     * - session: Traditional session-based authentication
     * - token: API token authentication
     * - passport: OAuth2 authentication (requires Laravel Passport)
     * - sanctum: Lightweight API tokens (requires Laravel Sanctum)
     */
    'guards' => [
        'web' => [
            /**
             * Driver: session
             * 
             * Uses Laravel's session system for authentication. User credentials
             * are verified once and then session stores authenticated state.
             * 
             * Features:
             * - Cookie-based sessions
             * - Remember me functionality
             * - CSRF protection
             * - Automatic session regeneration
             * 
             * Best For:
             * - Traditional web applications
             * - Server-rendered pages
             * - Applications using Blade templates
             */
            'driver' => 'session',
            
            /**
             * Provider: users
             * 
             * Specifies which user provider to use for retrieving user data.
             * References the 'users' provider defined below.
             */
            'provider' => 'users',
        ],
    ],

    /**
     * User Providers
     * 
     * User providers define how users are retrieved from your storage system.
     * Laravel includes Eloquent and Database query builder drivers.
     * 
     * Provider Types:
     * - eloquent: Uses Eloquent ORM (recommended)
     * - database: Uses query builder (rare use case)
     * 
     * Multiple Providers:
     * You can define multiple providers for different user types:
     * ```
     * 'providers' => [
     *     'users' => [
     *         'driver' => 'eloquent',
     *         'model' => App\Models\User::class,
     *     ],
     *     'admins' => [
     *         'driver' => 'eloquent',
     *         'model' => App\Models\Admin::class,
     *     ],
     *     'customers' => [
     *         'driver' => 'database',
     *         'table' => 'customers',
     *     ],
     * ],
     * ```
     */
    'providers' => [
        'users' => [
            /**
             * Driver: eloquent
             * 
             * Uses Eloquent ORM to retrieve users. Provides full model functionality
             * including relationships, accessors, mutators, and events.
             * 
             * Advantages:
             * - Full Eloquent features
             * - Relationships support
             * - Model events
             * - Easy to extend
             */
            'driver' => 'eloquent',
            
            /**
             * Model: User class
             * 
             * The Eloquent model used for authentication. Must implement
             * Illuminate\Contracts\Auth\Authenticatable interface.
             * 
             * Environment Variable: AUTH_MODEL
             * Default: App\Models\User::class
             * 
             * Requirements:
             * - Must have 'id' column
             * - Must have 'password' column (hashed)
             * - Should use Authenticatable trait
             * 
             * Custom Model Example:
             * ```
             * AUTH_MODEL=App\Models\Admin
             * ```
             */
            'model' => env('AUTH_MODEL', App\Models\User::class),
        ],

        /**
         * Alternative: Database Driver
         * 
         * Uses database query builder instead of Eloquent. Rarely used,
         * as Eloquent provides better functionality.
         * 
         * Example:
         * ```
         * 'users' => [
         *     'driver' => 'database',
         *     'table' => 'users',
         * ],
         * ```
         * 
         * When to Use:
         * - Legacy systems with complex table structures
         * - Micro-services with minimal ORM overhead
         * - Specific performance requirements
         */
    ],

    /**
     * Password Reset Configuration
     * 
     * Controls password reset functionality including token storage, expiration,
     * and rate limiting.
     * 
     * Password Reset Flow:
     * 1. User requests password reset
     * 2. Token generated and stored in database
     * 3. Email sent with reset link containing token
     * 4. User clicks link and enters new password
     * 5. Token validated and password updated
     * 6. Token deleted from database
     */
    'passwords' => [
        'users' => [
            /**
             * Provider: users
             * 
             * Specifies which user provider to use for password resets.
             * Must match a provider defined in 'providers' section above.
             */
            'provider' => 'users',
            
            /**
             * Table: password_reset_tokens
             * 
             * Database table used to store password reset tokens.
             * 
             * Environment Variable: AUTH_PASSWORD_RESET_TOKEN_TABLE
             * Default: 'password_reset_tokens'
             * 
             * Table Structure:
             * - email (primary key): User's email address
             * - token: Hashed reset token
             * - created_at: When token was created
             * 
             * Migration:
             * Created by 0001_01_01_000000_create_users_table.php
             */
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            
            /**
             * Expiration: 60 minutes
             * 
             * Number of minutes a password reset token remains valid.
             * After this time, users must request a new reset link.
             * 
             * Default: 60 (1 hour)
             * 
             * Security Considerations:
             * - Shorter time = more secure
             * - Longer time = better user experience
             * - Balance based on your security requirements
             * 
             * Recommended Values:
             * - High security: 15-30 minutes
             * - Standard: 60 minutes (default)
             * - User-friendly: 120 minutes
             * 
             * Cleanup:
             * Expired tokens are automatically cleaned up by Laravel.
             * Manual cleanup: php artisan auth:clear-resets
             */
            'expire' => 60,
            
            /**
             * Throttling: 60 seconds
             * 
             * Minimum seconds between password reset requests from same email.
             * Prevents spam and brute force attacks.
             * 
             * Default: 60 (1 minute)
             * 
             * Benefits:
             * - Prevents email flooding
             * - Reduces server load
             * - Protects against abuse
             * - Limits brute force attempts
             * 
             * User Experience:
             * - Shows error if user tries again too soon
             * - Error message includes remaining time
             * 
             * Recommended Values:
             * - Standard: 60 seconds
             * - High traffic: 120-300 seconds
             * - Low security: 30 seconds
             */
            'throttle' => 60,
        ],
    ],

    /**
     * Password Confirmation Timeout
     * 
     * Number of seconds before a password confirmation expires and users are
     * required to re-enter their password. Used for sensitive operations.
     * 
     * Environment Variable: AUTH_PASSWORD_TIMEOUT
     * Default: 10800 (3 hours)
     * 
     * Sensitive Operations:
     * - Updating email address
     * - Changing password
     * - Enabling two-factor authentication
     * - Deleting account
     * - Viewing sensitive data
     * 
     * How It Works:
     * 1. User attempts sensitive operation
     * 2. If not recently confirmed, redirect to password confirmation
     * 3. User enters password
     * 4. On success, timestamp stored in session
     * 5. Subsequent operations within timeout don't require reconfirmation
     * 
     * Usage in Routes:
     * ```
     * Route::get('/settings', function () {
     *     return view('settings');
     * })->middleware(['auth', 'password.confirm']);
     * ```
     * 
     * Usage in Controllers:
     * ```
     * public function update(Request $request)
     * {
     *     $confirmed = $request->session()
     *         ->get('auth.password_confirmed_at', 0);
     *     
     *     if (time() - $confirmed > config('auth.password_timeout')) {
     *         return redirect()->route('password.confirm');
     *     }
     *     
     *     // Proceed with sensitive operation
     * }
     * ```
     * 
     * Recommended Values:
     * - High security: 900 (15 minutes)
     * - Standard: 10800 (3 hours - default)
     * - User-friendly: 21600 (6 hours)
     * 
     * Security vs UX:
     * - Shorter timeout = more secure, more interruptions
     * - Longer timeout = less secure, better user experience
     * - Choose based on your application's security requirements
     */
    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),
];
