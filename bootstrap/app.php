<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

/**
 * Application Bootstrap Configuration
 * 
 * This file is the entry point for bootstrapping the Laravel application.
 * It configures routing, middleware, and exception handling for the entire application.
 * 
 * Laravel 11 Bootstrap:
 * - Simplified from previous versions
 * - Method chaining for configuration
 * - Cleaner syntax for middleware registration
 * 
 * Configuration Sections:
 * 1. Routing: Define web and console route files
 * 2. Middleware: Configure middleware stack and aliases
 * 3. Exceptions: Configure exception handling
 * 
 * @see https://laravel.com/docs/configuration
 */
return Application::configure(basePath: dirname(__DIR__))
    /**
     * Configure application routing.
     * 
     * Defines which route files should be loaded for web and console interfaces.
     * Also configures the health check endpoint for monitoring.
     * 
     * Route Files:
     * - web: Web routes with session, CSRF protection, cookies
     * - commands: Artisan console commands
     * - api: API routes (optional, not configured here)
     * 
     * Health Check:
     * - Endpoint: GET /up
     * - Returns 200 OK if application is running
     * - Used by load balancers and monitoring tools
     * 
     * @param string $web Path to web routes file
     * @param string $commands Path to console routes file
     * @param string $health Health check endpoint URL
     */
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    
    /**
     * Configure application middleware.
     * 
     * Defines the middleware stack and aliases. Middleware processes requests
     * before they reach controllers and can modify responses before sending.
     * 
     * Middleware Configuration:
     * 1. Web middleware stack: Applied to all web routes
     * 2. Middleware aliases: Shortcuts for commonly used middleware
     * 
     * Web Middleware Stack:
     * - HandleInertiaRequests: Shares data with Inertia.js pages
     * - AddLinkHeadersForPreloadedAssets: Improves performance with preloading
     * 
     * Middleware Aliases:
     * - otp.verified: Ensures user has verified OTP
     * 
     * Additional Middleware:
     * ```
     * $middleware->web(append: [
     *     \App\Http\Middleware\HandleInertiaRequests::class,
     *     \App\Http\Middleware\CustomMiddleware::class,
     * ]);
     * 
     * $middleware->api(prepend: [
     *     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
     * ]);
     * 
     * $middleware->alias([
     *     'admin' => \App\Http\Middleware\AdminMiddleware::class,
     *     'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
     * ]);
     * ```
     * 
     * @param Middleware $middleware Middleware configuration instance
     */
    ->withMiddleware(function (Middleware $middleware): void {
        // Add middleware to web stack
        $middleware->web(append: [
            // Inertia.js middleware for sharing data with frontend
            \App\Http\Middleware\HandleInertiaRequests::class,
            
            // Performance optimization for asset preloading
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        // Register middleware aliases
        $middleware->alias([
            // Custom middleware for OTP verification
            'otp.verified' => \App\Http\Middleware\EnsureOtpVerified::class,
        ]);
    })
    
    /**
     * Configure exception handling.
     * 
     * Customize how the application handles exceptions and errors. Can register
     * custom exception handlers, reporters, and renderers.
     * 
     * @param Exceptions $exceptions Exception configuration instance
     * 
     * Custom Exception Handling:
     * ```
     * ->withExceptions(function (Exceptions $exceptions): void {
     *     // Report specific exceptions to external service
     *     $exceptions->report(function (Throwable $e) {
     *         if ($e instanceof CustomException) {
     *             // Log to external monitoring service
     *             ExternalLogger::log($e);
     *         }
     *     });
     *     
     *     // Custom rendering for specific exceptions
     *     $exceptions->render(function (NotFoundHttpException $e, $request) {
     *         if ($request->is('api/*')) {
     *             return response()->json([
     *                 'message' => 'Resource not found.'
     *             ], 404);
     *         }
     *     });
     *     
     *     // Don't report certain exceptions
     *     $exceptions->dontReport([
     *         ValidationException::class,
     *     ]);
     * })
     * ```
     */
    ->withExceptions(function (Exceptions $exceptions): void {
        // Custom exception handling can be added here
    })
    
    /**
     * Create the application instance.
     * 
     * Finalizes the configuration and creates the Laravel application instance.
     * This method must be called last in the chain.
     * 
     * @return \Illuminate\Foundation\Application
     */
    ->create();
