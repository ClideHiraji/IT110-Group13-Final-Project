<?php

/**
 * Application Configuration File
 * 
 * This file contains the core configuration options for the Laravel application.
 * These settings control fundamental aspects like environment, debugging, timezone,
 * locale, and encryption.
 * 
 * Configuration Values:
 * - Application identity (name, environment)
 * - Debug and error handling
 * - URL and timezone settings
 * - Localization and internationalization
 * - Encryption and security
 * - Maintenance mode
 * 
 * Environment Variables:
 * Most values are pulled from .env file using env() helper for easy configuration
 * across different environments (local, staging, production).
 * 
 * @see https://laravel.com/docs/configuration
 */

return [
    /**
     * Application Name
     * 
     * Defines the name of your application. Used throughout the application for
     * display purposes, email subjects, notifications, and cache key prefixes.
     * 
     * Environment Variable: APP_NAME
     * Default: 'Laravel'
     * 
     * Usage Examples:
     * - Email subjects: "Welcome to {APP_NAME}"
     * - Page titles: "{APP_NAME} - Dashboard"
     * - Cache key prefix: "{app_name}-cache-"
     * 
     * Access in Code:
     * ```
     * config('app.name')
     * ```
     */
    'name' => env('APP_NAME', 'Laravel'),

    /**
     * Application Environment
     * 
     * Determines the current running environment of the application. This affects
     * error handling, logging, caching, and debug mode behavior.
     * 
     * Environment Variable: APP_ENV
     * Default: 'production'
     * 
     * Common Values:
     * - 'local': Development on local machine
     * - 'development': Development server
     * - 'staging': Pre-production testing
     * - 'production': Live production server
     * 
     * Detection in Code:
     * ```
     * if (app()->environment('production')) {
     *     // Production-specific code
     * }
     * 
     * if (app()->environment(['staging', 'production'])) {
     *     // Code for multiple environments
     * }
     * ```
     * 
     * Security Note:
     * Never set to 'local' or 'development' in production as it may expose
     * sensitive debugging information.
     */
    'env' => env('APP_ENV', 'production'),

    /**
     * Application Debug Mode
     * 
     * When enabled, detailed error messages with stack traces are displayed.
     * When disabled, a generic error page is shown to users.
     * 
     * Environment Variable: APP_DEBUG
     * Default: false (disabled for security)
     * 
     * Debug Mode Features:
     * - Detailed error messages
     * - Full stack traces
     * - Query logging
     * - Dump die (dd) helpers
     * - Whoops error handler
     * 
     * Security Warning:
     * NEVER enable debug mode in production! It exposes:
     * - Database credentials
     * - File paths
     * - Environment variables
     * - Application secrets
     * 
     * Recommended Settings:
     * - Local: true
     * - Staging: false (use logging instead)
     * - Production: false (absolutely never true)
     * 
     * Usage:
     * ```
     * if (config('app.debug')) {
     *     // Debug-only code
     *     Log::debug('Detailed debugging info');
     * }
     * ```
     */
    'debug' => (bool) env('APP_DEBUG', false),

    /**
     * Application URL
     * 
     * The root URL of the application. Used by the console to generate URLs
     * when using Artisan commands, sending emails, and generating routes.
     * 
     * Environment Variable: APP_URL
     * Default: 'http://localhost'
     * 
     * Format Examples:
     * - Local: 'http://localhost:8000'
     * - Staging: 'https://staging.example.com'
     * - Production: 'https://example.com'
     * 
     * Important:
     * - Include protocol (http:// or https://)
     * - No trailing slash
     * - Match actual domain in production
     * 
     * Usage in Code:
     * ```
     * // Generate absolute URL
     * $url = config('app.url') . '/api/endpoint';
     * 
     * // Used automatically by:
     * route('home'); // https://example.com/home
     * asset('css/app.css'); // https://example.com/css/app.css
     * ```
     * 
     * Console Commands:
     * Essential for commands that generate URLs:
     * - php artisan queue:work (email URLs)
     * - Scheduled tasks (notification URLs)
     */
    'url' => env('APP_URL', 'http://localhost'),

    /**
     * Application Timezone
     * 
     * Default timezone for date/time functions throughout the application.
     * Affects Carbon instances, database timestamps, and scheduled tasks.
     * 
     * Environment Variable: APP_TIMEZONE
     * Default: 'UTC'
     * 
     * Common Timezones:
     * - 'UTC': Coordinated Universal Time (recommended)
     * - 'America/New_York': US Eastern Time
     * - 'Europe/London': UK Time
     * - 'Asia/Tokyo': Japan Time
     * - 'Asia/Manila': Philippines Time
     * 
     * Best Practice:
     * Store all dates in UTC in database, convert to user timezone in UI.
     * 
     * Usage:
     * ```
     * // All timestamps use this timezone
     * now(); // Current time in app timezone
     * Carbon::now(); // Same as above
     * 
     * // Convert to specific timezone
     * now()->timezone('America/New_York');
     * 
     * // User-specific timezone
     * $user->created_at->setTimezone($user->timezone);
     * ```
     * 
     * @see https://www.php.net/manual/en/timezones.php
     */
    'timezone' => 'UTC',

    /**
     * Application Locale
     * 
     * Default locale for translation and localization. Determines which
     * language files are loaded from resources/lang directory.
     * 
     * Environment Variable: APP_LOCALE
     * Default: 'en'
     * 
     * Common Locales:
     * - 'en': English
     * - 'es': Spanish
     * - 'fr': French
     * - 'de': German
     * - 'ja': Japanese
     * - 'zh': Chinese
     * 
     * Translation Files:
     * - resources/lang/en/
     * - resources/lang/es/
     * - resources/lang/{locale}/
     * 
     * Usage:
     * ```
     * // Get translated string
     * __('messages.welcome'); // Uses default locale
     * 
     * // Change locale at runtime
     * app()->setLocale('es');
     * 
     * // Check current locale
     * if (app()->getLocale() === 'en') {
     *     // English-specific code
     * }
     * 
     * // Temporary locale change
     * app()->withLocale('fr', function () {
     *     return __('messages.hello');
     * });
     * ```
     */
    'locale' => env('APP_LOCALE', 'en'),

    /**
     * Application Fallback Locale
     * 
     * The fallback locale determines which locale will be used when the current
     * locale is not available. If a translation key doesn't exist in the current
     * locale, Laravel will try the fallback locale.
     * 
     * Environment Variable: APP_FALLBACK_LOCALE
     * Default: 'en'
     * 
     * Example Flow:
     * 1. User requests Spanish (es)
     * 2. Translation key 'messages.greeting' not found in es
     * 3. Laravel checks fallback locale (en)
     * 4. Returns English translation if available
     * 
     * Usage:
     * ```
     * app()->setFallbackLocale('en');
     * 
     * // If 'messages.welcome' doesn't exist in French
     * app()->setLocale('fr');
     * __('messages.welcome'); // Falls back to English version
     * ```
     */
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    /**
     * Faker Locale
     * 
     * Locale used by the Faker library for generating fake data in factories,
     * seeders, and tests. Affects generated names, addresses, phone numbers, etc.
     * 
     * Environment Variable: APP_FAKER_LOCALE
     * Default: 'en_US'
     * 
     * Common Faker Locales:
     * - 'en_US': United States English
     * - 'en_GB': British English
     * - 'es_ES': Spanish (Spain)
     * - 'fr_FR': French (France)
     * - 'ja_JP': Japanese
     * - 'zh_CN': Chinese (Simplified)
     * 
     * Usage in Factories:
     * ```
     * // Generates names appropriate for locale
     * fake()->name(); // John Doe (en_US) or 田中太郎 (ja_JP)
     * fake()->address(); // Locale-appropriate address format
     * fake()->phoneNumber(); // Locale-specific phone format
     * ```
     * 
     * @see https://fakerphp.github.io/#localization
     */
    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /**
     * Encryption Cipher
     * 
     * The cipher algorithm used for all encryption within the application.
     * Laravel's encryption services use OpenSSL for AES encryption.
     * 
     * Value: 'AES-256-CBC'
     * 
     * Cipher Details:
     * - AES: Advanced Encryption Standard
     * - 256: Key size in bits (very secure)
     * - CBC: Cipher Block Chaining mode
     * 
     * Security:
     * - Industry standard encryption
     * - FIPS 140-2 compliant
     * - Secure for sensitive data
     * 
     * Do Not Change:
     * Changing this after encrypting data will make existing encrypted
     * data unreadable. Only change before initial deployment.
     * 
     * Usage:
     * ```
     * // Encrypt data
     * $encrypted = encrypt('sensitive data');
     * 
     * // Decrypt data
     * $decrypted = decrypt($encrypted);
     * 
     * // Used automatically for:
     * // - Cookie encryption
     * // - Session encryption
     * // - Encrypted database columns
     * ```
     */
    'cipher' => 'AES-256-CBC',

    /**
     * Encryption Key
     * 
     * The secret key used for all encryption. Must be exactly 32 characters
     * for AES-256-CBC cipher. This key must be kept secret and secure.
     * 
     * Environment Variable: APP_KEY
     * Format: 'base64:...' (base64 encoded 32-byte string)
     * 
     * Generate Key:
     * ```
     * php artisan key:generate
     * ```
     * 
     * Security Requirements:
     * - Random and unpredictable
     * - Exactly 32 characters (before base64 encoding)
     * - Never committed to version control
     * - Different for each environment
     * - Rotated periodically in production
     * 
     * Security Warnings:
     * - Never share or expose this key
     * - Store securely (not in code repository)
     * - Use environment variables
     * - Changing key invalidates encrypted data
     * 
     * What It Encrypts:
     * - Session data
     * - Cookie values
     * - Encrypted database fields
     * - Remember me tokens
     * - CSRF tokens
     * 
     * Key Rotation:
     * ```
     * // Store old key in APP_PREVIOUS_KEYS before rotating
     * // Allows decryption of data encrypted with old keys
     * ```
     */
    'key' => env('APP_KEY'),

    /**
     * Previous Encryption Keys
     * 
     * When rotating encryption keys, store previous keys here to allow
     * decryption of data encrypted with old keys. Enables graceful key rotation.
     * 
     * Environment Variable: APP_PREVIOUS_KEYS (comma-separated)
     * Format: 'base64:key1,base64:key2,base64:key3'
     * 
     * Key Rotation Process:
     * 1. Add current APP_KEY to APP_PREVIOUS_KEYS
     * 2. Generate new APP_KEY
     * 3. Laravel will try current key first, then previous keys
     * 4. Re-encrypt data with new key when accessed
     * 5. Remove old keys after all data re-encrypted
     * 
     * Example .env:
     * ```
     * APP_KEY=base64:new_key_here
     * APP_PREVIOUS_KEYS=base64:old_key_1,base64:old_key_2
     * ```
     * 
     * Security Note:
     * Keep previous keys as short as possible. Remove after data migration.
     */
    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /**
     * Maintenance Mode Configuration
     * 
     * Controls how Laravel's maintenance mode works. Maintenance mode allows you
     * to temporarily disable your application for updates or maintenance.
     * 
     * Drivers:
     * - 'file': Stores maintenance mode status in storage/framework/down file
     * - 'cache': Stores status in cache (better for multi-server setups)
     * 
     * Environment Variables:
     * - APP_MAINTENANCE_DRIVER: Driver to use ('file' or 'cache')
     * - APP_MAINTENANCE_STORE: Cache store name if using cache driver
     * 
     * Enable Maintenance Mode:
     * ```
     * # Basic maintenance mode
     * php artisan down
     * 
     * # With custom message
     * php artisan down --message="Upgrading Database"
     * 
     * # With retry time (seconds)
     * php artisan down --retry=60
     * 
     * # Allow specific IPs
     * php artisan down --allow=127.0.0.1 --allow=192.168.1.1
     * 
     * # With secret bypass
     * php artisan down --secret="maintenance-bypass-token"
     * # Access via: https://example.com/maintenance-bypass-token
     * ```
     * 
     * Disable Maintenance Mode:
     * ```
     * php artisan up
     * ```
     * 
     * Check Status in Code:
     * ```
     * if (app()->isDownForMaintenance()) {
     *     // Application is in maintenance mode
     * }
     * ```
     * 
     * Custom Maintenance Page:
     * Create resources/views/errors/503.blade.php
     * 
     * Multi-Server Setup:
     * Use 'cache' driver with Redis to sync maintenance mode across servers:
     * ```
     * APP_MAINTENANCE_DRIVER=cache
     * APP_MAINTENANCE_STORE=redis
     * ```
     */
    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],
];
