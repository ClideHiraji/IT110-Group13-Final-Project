<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\MetMuseumController;
use App\Http\Controllers\CollectionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Main web routes for the application.
 *
 * This file wires HTTP routes to controllers or Inertia views and
 * separates public access from protected (authenticated + OTP-verified) areas. [web:180][web:183]
 *
 * Sections:
 * - Public routes:
 *   - GET /                         → Inertia "Home" page.
 *
 * - Public Met Museum API proxy routes:
 *   - All under /api/met prefix, used by the frontend to call the Met Museum API
 *     indirectly through the Laravel backend (helps with CORS, keys, and caching). [web:195]
 *   - GET  /api/met/object/{id}     → Fetch single artwork by Met ID.
 *   - GET  /api/met/search          → Search Met collection.
 *   - GET  /api/met/period          → Fetch artworks filtered by period.
 *   - POST /api/met/batch           → Fetch multiple artworks by IDs in one request.
 *
 * - Protected application routes (requires `auth` + `otp.verified` middleware):
 *   - GET  /dashboard               → Inertia "Dashboard" page for logged-in users.
 *   - GET  /timeline                → Inertia "Timeline" page (secured).
 *   - Profile management:
 *       GET    /profile             → Edit profile form.
 *       PATCH  /profile             → Update profile data.
 *       DELETE /profile             → Delete account.
 *       POST   /profile/2fa/enable  → Turn on 2FA.
 *       POST   /profile/2fa/disable → Turn off 2FA.
 *   - Collection UI:
 *       GET /collection             → Inertia collection page.
 *   - Collection API (all under /api/collection, for the current user):
 *       GET    /api/collection/                 → List saved artworks.
 *       POST   /api/collection/                 → Save a new artwork.
 *       POST   /api/collection/{artworkId}/note → Add/update note.
 *       DELETE /api/collection/{artworkId}      → Remove artwork.
 *       GET    /api/collection/{artworkId}/check→ Check if artwork is saved.
 *
 * - Auth routes include:
 *   - `require __DIR__.'/auth.php';` pulls in separate route definitions
 *     for login, registration, password reset, OTP, 2FA, etc.
 */

// Public routes (no auth required)
// Renders the SPA Home page via Inertia when visiting the site root (/).
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');


// Met Museum API proxy (public access)
// All routes here start with /api/met and are used by the frontend
// to interact with the Met Museum API through the backend.
Route::prefix('api/met')->group(function () {
    // Get a single Met object by numeric ID.
    // Example: GET /api/met/object/12345
    Route::get('object/{id}', [MetMuseumController::class, 'getObject']);

    // Search the Met collection using query parameters (e.g. ?q=term).
    // Example: GET /api/met/search?q=monet
    Route::get('search', [MetMuseumController::class, 'search']);

    // Fetch objects filtered by a historical period or date range.
    // Example: GET /api/met/period?period=Renaissance
    Route::get('period', [MetMuseumController::class, 'getObjectsByPeriod']);

    // Retrieve multiple objects in a single request by posting a list of IDs.
    // Example: POST /api/met/batch with JSON body { "ids": [1,2,3] }
    Route::post('batch', [MetMuseumController::class, 'getBatch']);
});


// Protected routes (require authentication + OTP verification)
// The 'auth' middleware ensures the user is logged in, and 'otp.verified'
// likely ensures the user has passed an OTP step for stronger security.
Route::middleware(['auth', 'otp.verified'])->group(function () {
    // Dashboard screen for authenticated, OTP-verified users.
    // Renders the Inertia "Dashboard" component.
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    
    // Timeline page showing historical/curated content.
    // Only accessible once the user is authenticated and OTP-verified.
    Route::get('/timeline', function () {
        return Inertia::render('Timeline');
    })->name('timeline');
    
    // PROFILE ROUTES
    // Show the profile edit page (user details, settings, etc.).
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');

    // Handle profile updates (e.g., name, email, preferences).
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Permanently delete the user's account and related data.
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Enable two-factor authentication for the current user.
    // Typically generates secrets/recovery codes and marks 2FA as active.
    Route::post('/profile/2fa/enable', [ProfileController::class, 'enableTwoFactor'])->name('profile.2fa.enable');

    // Disable two-factor authentication for the current user.
    Route::post('/profile/2fa/disable', [ProfileController::class, 'disableTwoFactor'])->name('profile.2fa.disable');
    
    // COLLECTION PAGE
    // Render the main collection UI page via Inertia, where the user
    // can browse and manage their saved artworks.
    Route::get('/collection', [CollectionController::class, 'show'])->name('collection.index');
    
    // COLLECTION API (CRUD endpoints for the authenticated user's collection)
    // All these routes are still protected by auth + otp.verified.
    Route::prefix('api/collection')->group(function () {
        // Return a list of all artworks saved in the user's collection.
        Route::get('/', [CollectionController::class, 'index']);
        
        // Save a new artwork to the collection (expects artwork data in request).
        Route::post('/', [CollectionController::class, 'store']);
        
        // Add or update a textual note attached to a specific artwork.
        // Example: POST /api/collection/123/note
        Route::post('/{artworkId}/note', [CollectionController::class, 'updateNote']);
        
        // Remove a single artwork from the user's collection by its ID.
        Route::delete('/{artworkId}', [CollectionController::class, 'destroy']);
        
        // Check whether the given artwork is already stored in the collection.
        // Useful for toggling UI states (e.g., "Save" vs "Saved").
        Route::get('/{artworkId}/check', [CollectionController::class, 'checkSaved']);
    });
});


// Auth routes (login, register, password reset, OTP, etc.)
// Loaded from a separate file to keep this routes file focused on app pages.
require __DIR__.'/auth.php';
