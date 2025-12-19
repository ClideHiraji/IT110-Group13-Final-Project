<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

/**
 * HandleInertiaRequests Middleware
 * 
 * Middleware that shares data with all Inertia.js page components. This provides
 * a centralized location for passing data that should be available on every page
 * render, such as authenticated user information and flash messages.
 * 
 * Inertia.js:
 * - Modern full-stack framework for building SPAs
 * - Uses server-side routing with client-side rendering
 * - Replaces traditional API layer
 * - Automatically shares props to Vue/React components
 * 
 * Shared Data Features:
 * - Authenticated user information
 * - CSRF token for forms
 * - Flash messages (success, error, status)
 * - Available on all Inertia page components
 * 
 * Usage:
 * Data shared here is accessible in all Vue/React components:
 * ```
 * // In Vue component
 * import { usePage } from '@inertiajs/vue3'
 * 
 * const page = usePage()
 * console.log(page.props.auth.user) // Authenticated user
 * console.log(page.props.flash.status) // Flash message
 * ```
 * 
 * @package App\Http\Middleware
 * 
 * @see https://inertiajs.com/
 * @see \Inertia\Middleware
 */
class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     * 
     * Defines the blade template that serves as the HTML shell for the
     * Inertia.js application. This template is only loaded on initial page
     * visit - subsequent navigation is handled by Inertia's AJAX requests.
     * 
     * @var string Path to root blade template
     * 
     * Template Location:
     * - resources/views/app.blade.php
     * 
     * Template Contents:
     * - HTML head with meta tags
     * - Vite asset includes (CSS/JS)
     * - Root div with @inertia directive
     * - CSRF token meta tag
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     * 
     * Returns a string that changes when assets are updated, triggering
     * Inertia to reload assets on the client side. Returning null uses
     * Laravel Mix/Vite versioning automatically.
     * 
     * Asset Versioning:
     * - Ensures users get latest CSS/JS after deployment
     * - Inertia compares version on each request
     * - If changed: forces full page reload to fetch new assets
     * - If same: uses cached assets
     * 
     * @param Request $request The incoming HTTP request
     * 
     * @return string|null Asset version identifier or null for auto-detection
     * 
     * Auto-detection (null):
     * - Uses Laravel Mix/Vite manifest versioning
     * - Recommended for most applications
     * - No manual version management needed
     * 
     * Manual Versioning:
     * - Return unique string per deployment
     * - Examples: git commit hash, build number, timestamp
     * ```
     * return config('app.asset_version'); // From .env
     * return exec('git rev-parse --short HEAD'); // Git hash
     * return md5_file(public_path('mix-manifest.json')); // Mix manifest
     * ```
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * 
     * Returns an array of data that is automatically passed to all Inertia
     * page components. This data is available in the component's props without
     * explicitly passing it from controllers.
     * 
     * Lazy Evaluation:
     * - Uses closures (fn()) for lazy evaluation
     * - Flash messages only retrieved if accessed
     * - Improves performance by avoiding unnecessary session reads
     * 
     * @param Request $request The incoming HTTP request
     * 
     * @return array<string, mixed> Shared props for all pages
     * 
     * Shared Props Structure:
     * ```
     * {
     *   auth: {
     *     user: {
     *       id: 1,
     *       name: "John Doe",
     *       email: "john@example.com",
     *       is_verified: true,
     *       two_factor_enabled: false,
     *       // ... other user fields (excluding hidden fields)
     *     }
     *   },
     *   csrf_token: "abc123...",
     *   flash: {
     *     message: "Profile updated successfully!", // or null
     *     status: "success" // or null
     *   }
     * }
     * ```
     * 
     * Prop Descriptions:
     * 
     * - auth.user: Authenticated user object or null
     *   - Includes all fillable user attributes
     *   - Excludes hidden fields (password, tokens)
     *   - Null if user not authenticated
     *   - Automatically updated on auth state changes
     * 
     * - csrf_token: CSRF token for form submissions
     *   - Required for all POST/PUT/PATCH/DELETE requests
     *   - Automatically included in Inertia forms
     *   - Validated by Laravel middleware
     * 
     * - flash.message: General flash message from session
     *   - Set via session()->flash('message', 'Text')
     *   - Lazy loaded (only if accessed)
     *   - Cleared after display
     * 
     * - flash.status: Status/success flash message
     *   - Set via with('status', 'Text') in controllers
     *   - Common for success notifications
     *   - Lazy loaded (only if accessed)
     *   - Cleared after display
     * 
     * Frontend Usage (Vue 3):
     * ```
     * <script setup>
     * import { usePage } from '@inertiajs/vue3'
     * 
     * const page = usePage()
     * const user = page.props.auth.user
     * const flashMessage = page.props.flash.message
     * 
     * // Check if user is authenticated
     * if (user) {
     *   console.log(`Welcome ${user.name}`)
     * }
     * 
     * // Display flash message
     * if (flashMessage) {
     *   alert(flashMessage)
     * }
     * </script>
     * ```
     * 
     * Adding Custom Shared Data:
     * ```
     * return [
     *     ...parent::share($request),
     *     'auth' => [
     *         'user' => $request->user(),
     *     ],
     *     'csrf_token' => csrf_token(),
     *     'flash' => [
     *         'message' => fn () => $request->session()->get('message'),
     *         'status' => fn () => $request->session()->get('status'),
     *     ],
     *     // Add custom shared data
     *     'app_name' => config('app.name'),
     *     'locale' => app()->getLocale(),
     *     'permissions' => fn () => $request->user()?->permissions ?? [],
     * ];
     * ```
     * 
     * Performance Considerations:
     * - Use closures for expensive operations
     * - Avoid sharing large datasets
     * - Consider caching for static data
     * - Only share data needed across all pages
     * 
     * @see https://inertiajs.com/shared-data
     */
    public function share(Request $request): array
    {
        return [
            // Include default Inertia shared data
            ...parent::share($request),
            
            // Authentication data
            'auth' => [
                'user' => $request->user(),
            ],
            
            // CSRF token for form submissions
            'csrf_token' => csrf_token(),
            
            // Flash messages (lazy loaded)
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
