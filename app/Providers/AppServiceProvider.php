<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * AppServiceProvider
 * 
 * The main service provider for the application. Provides a central location for
 * bootstrapping application services, registering bindings in the service container,
 * and setting up application-wide configurations.
 * 
 * Purpose:
 * - Register application services
 * - Bootstrap application-wide settings
 * - Bind interfaces to implementations
 * - Configure global application behavior
 * 
 * Lifecycle:
 * 1. register() method called first during application bootstrap
 * 2. boot() method called after all service providers registered
 * 
 * Common Uses:
 * - Model observers registration
 * - View composers
 * - Validation rule extensions
 * - Database query logging
 * - Third-party service configuration
 * 
 * @package App\Providers
 * 
 * @see https://laravel.com/docs/providers
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     * 
     * Called first during application bootstrap. Use this method to register
     * bindings in the service container. Do not attempt to use any services here
     * as they may not be available yet.
     * 
     * @return void
     * 
     * Common Registrations:
     * ```
     * // Bind interface to implementation
     * $this->app->bind(
     *     \App\Contracts\PaymentGateway::class,
     *     \App\Services\StripePaymentGateway::class
     * );
     * 
     * // Singleton binding
     * $this->app->singleton(
     *     \App\Services\CacheManager::class
     * );
     * 
     * // Contextual binding
     * $this->app->when(\App\Http\Controllers\UserController::class)
     *     ->needs(\App\Contracts\Repository::class)
     *     ->give(\App\Repositories\UserRepository::class);
     * ```
     * 
     * Best Practices:
     * - Only register bindings, don't use services
     * - Keep logic simple and focused
     * - Use deferred providers for expensive operations
     * - Document complex bindings
     */
    public function register(): void
    {
        // Register application services here
        // Example:
        // $this->app->bind(InterfaceName::class, ImplementationClass::class);
    }

    /**
     * Bootstrap any application services.
     * 
     * Called after all service providers have been registered. Use this method
     * for any bootstrapping code that needs to use other services, as all services
     * are now available.
     * 
     * @return void
     * 
     * Common Bootstrap Operations:
     * ```
     * // Register model observers
     * User::observe(UserObserver::class);
     * 
     * // Share data with all views
     * View::share('appName', config('app.name'));
     * 
     * // Configure pagination
     * Paginator::useBootstrapFive();
     * 
     * // Extend validation rules
     * Validator::extend('phone', function ($attribute, $value) {
     *     return preg_match('/^\d{10}$/', $value);
     * });
     * 
     * // Configure Carbon localization
     * Carbon::setLocale('en');
     * 
     * // Enable query logging in development
     * if (config('app.debug')) {
     *     DB::listen(function ($query) {
     *         Log::info($query->sql, $query->bindings);
     *     });
     * }
     * 
     * // Register view composers
     * View::composer('layouts.app', function ($view) {
     *     $view->with('currentUser', auth()->user());
     * });
     * 
     * // Force HTTPS in production
     * if (app()->environment('production')) {
     *     URL::forceScheme('https');
     * }
     * ```
     * 
     * Best Practices:
     * - Use boot() for operations that need other services
     * - Keep performance in mind - runs on every request
     * - Use environment checks for conditional logic
     * - Consider using deferred providers for non-essential services
     */
    public function boot(): void
    {
        // Bootstrap application services here
        // Examples:
        // - Model observers
        // - View composers
        // - Validation extensions
        // - Global middleware
    }
}
