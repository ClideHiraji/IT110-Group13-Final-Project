<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\MetMuseumController;
use App\Http\Controllers\CollectionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/timeline', function () {
    return Inertia::render('Timeline');
})->name('timeline');

// Met Museum API proxy (public access)
Route::prefix('api/met')->group(function () {
    Route::get('object/{id}', [MetMuseumController::class, 'getObject']);
    Route::get('search', [MetMuseumController::class, 'search']);
    Route::get('period', [MetMuseumController::class, 'getObjectsByPeriod']);
    Route::post('batch', [MetMuseumController::class, 'getBatch']);
});

// Protected routes (require authentication + OTP verification)
Route::middleware(['auth', 'otp.verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Collection (if you have this feature)
    Route::prefix('collection')->name('collection.')->group(function () {
        Route::get('/', [CollectionController::class, 'index'])->name('index');
        Route::post('/', [CollectionController::class, 'store'])->name('store');
        Route::delete('/{id}', [CollectionController::class, 'destroy'])->name('destroy');
    });
});

// Auth routes (login, register, password reset, etc.)
require __DIR__.'/auth.php';
