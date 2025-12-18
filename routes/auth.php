<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\PasswordResetOtpController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Registration Routes
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);

    // Login Routes
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // Registration OTP Routes
    Route::get('verify-otp', [OtpVerificationController::class, 'show'])
        ->name('verification.notice');
    Route::post('verify-otp', [OtpVerificationController::class, 'verify'])
        ->name('verification.verify');
    Route::post('resend-otp', [OtpVerificationController::class, 'resend'])
        ->name('verification.resend');
    Route::get('verification-success', [OtpVerificationController::class, 'success'])
        ->name('verification.success');

    // Password Reset OTP Routes
    Route::get('forgot-password/email', [PasswordResetOtpController::class, 'showEmailForm'])
        ->name('password.request.email');
    Route::post('forgot-password/email', [PasswordResetOtpController::class, 'sendOtp'])
        ->name('password.send.otp');
    Route::get('reset-password/otp', [PasswordResetOtpController::class, 'showOtpForm'])
        ->name('password.reset.otp');
    Route::post('reset-password/otp', [PasswordResetOtpController::class, 'verifyOtp'])
        ->name('password.verify.otp');
    Route::post('reset-password/otp/resend', [PasswordResetOtpController::class, 'resendOtp'])
        ->name('password.resend.otp');
    Route::get('reset-password/form', [PasswordResetOtpController::class, 'showResetForm'])
        ->name('password.reset.form');
    Route::post('reset-password/form', [PasswordResetOtpController::class, 'resetPassword'])
        ->name('password.reset.post');
});

Route::middleware('auth')->group(function () {
    // Two-Factor Authentication Routes
    Route::get('2fa/challenge', [TwoFactorController::class, 'show'])
        ->name('2fa.challenge');
    Route::post('2fa/verify', [TwoFactorController::class, 'verify'])
        ->name('2fa.verify.post');
    Route::post('2fa/resend', [TwoFactorController::class, 'resend'])
        ->name('2fa.resend');

    // Logout
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
