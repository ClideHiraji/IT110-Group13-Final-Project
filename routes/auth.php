<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\PasswordResetOtpController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\TwoFactorAuthController;
use App\Http\Controllers\Auth\PasswordController;
use Illuminate\Support\Facades\Route;


/**
 * Routes that can only be accessed by guests (not logged-in users).
 * This group handles registration, login, email OTP verification,
 * password reset via OTP, and 2FA during the login flow.
 */
Route::middleware('guest')->group(function () {
    /**
     * Show the user registration form.
     * Method: GET
     * URL: /register
     */
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');


    /**
     * Handle new user registration.
     * Method: POST
     * URL: /register
     */
    Route::post('register', [RegisteredUserController::class, 'store']);


    /**
     * Show the login form for users.
     * Method: GET
     * URL: /login
     */
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');


    /**
     * Handle login request and create a new authenticated session.
     * Method: POST
     * URL: /login
     */
    Route::post('login', [AuthenticatedSessionController::class, 'store']);


    /**
     * Show the OTP verification page after registration.
     * Method: GET
     * URL: /verify-otp
     * Route name: verification.notice
     */
    Route::get('verify-otp', [OtpVerificationController::class, 'show'])
        ->name('verification.notice');


    /**
     * Verify the OTP submitted by the user for account verification.
     * Method: POST
     * URL: /verify-otp
     * Route name: verification.verify
     */
    Route::post('verify-otp', [OtpVerificationController::class, 'verify'])
        ->name('verification.verify');


    /**
     * Resend the registration OTP to the user's email.
     * Method: POST
     * URL: /resend-otp
     * Route name: verification.resend
     */
    Route::post('resend-otp', [OtpVerificationController::class, 'resend'])
        ->name('verification.resend');


    /**
     * Show a success page after successful OTP verification.
     * Method: GET
     * URL: /verification-success
     * Route name: verification.success
     */
    Route::get('verification-success', [OtpVerificationController::class, 'success'])
        ->name('verification.success');


    /**
     * Show the form where the user enters their email to receive a password reset OTP.
     * Method: GET
     * URL: /forgot-password/email
     * Route name: password.request.email
     */
    Route::get('forgot-password/email', [PasswordResetOtpController::class, 'showEmailForm'])
        ->name('password.request.email');


    /**
     * Handle sending a password reset OTP to the given email.
     * Method: POST
     * URL: /forgot-password/email
     * Route name: password.send.otp
     */
    Route::post('forgot-password/email', [PasswordResetOtpController::class, 'sendOtp'])
        ->name('password.send.otp');


    /**
     * Show the form where the user inputs the OTP they received for password reset.
     * Method: GET
     * URL: /reset-password/otp
     * Route name: password.reset.otp
     */
    Route::get('reset-password/otp', [PasswordResetOtpController::class, 'showOtpForm'])
        ->name('password.reset.otp');


    /**
     * Verify the OTP submitted for password reset.
     * Method: POST
     * URL: /reset-password/otp
     * Route name: password.verify.otp
     */
    Route::post('reset-password/otp', [PasswordResetOtpController::class, 'verifyOtp'])
        ->name('password.verify.otp');


    /**
     * Resend the password reset OTP.
     * Method: POST
     * URL: /reset-password/otp/resend
     * Route name: password.resend.otp
     */
    Route::post('reset-password/otp/resend', [PasswordResetOtpController::class, 'resendOtp'])
        ->name('password.resend.otp');


    /**
     * Show the form to set a new password after a valid OTP.
     * Method: GET
     * URL: /reset-password/form
     * Route name: password.reset.form
     */
    Route::get('reset-password/form', [PasswordResetOtpController::class, 'showResetForm'])
        ->name('password.reset.form');


    /**
     * Handle the actual password reset (saving the new password).
     * Method: POST
     * URL: /reset-password/form
     * Route name: password.reset.post
     */
    Route::post('reset-password/form', [PasswordResetOtpController::class, 'resetPassword'])
        ->name('password.reset.post');


    /**
     * Show the 2FA challenge screen during the login flow.
     * Method: GET
     * URL: /2fa/challenge
     * Route name: 2fa.challenge
     */
    Route::get('2fa/challenge', [TwoFactorAuthController::class, 'show'])
        ->name('2fa.challenge');


    /**
     * Verify the submitted 2FA code during login.
     * Method: POST
     * URL: /2fa/verify
     * Route name: 2fa.verify.post
     */
    Route::post('2fa/verify', [TwoFactorAuthController::class, 'verify'])
        ->name('2fa.verify.post');


    /**
     * Resend the 2FA code during the login challenge (guest context).
     * Method: POST
     * URL: /2fa/resend
     * Route name: 2fa.resend
     */
    Route::post('2fa/resend', [TwoFactorAuthController::class, 'resend'])
        ->name('2fa.resend');
});


/**
 * Routes that require the user to be authenticated.
 * This group handles 2FA resend while logged in, password updates, and logout.
 */
Route::middleware('auth')->group(function () {
    /**
     * Resend the 2FA code from an authenticated context
     * (e.g. security settings page). Shares the same route name as the
     * guest version but is protected by the auth middleware.
     * Method: POST
     * URL: /2fa/resend
     * Route name: 2fa.resend
     */
    Route::post('2fa/resend', [TwoFactorAuthController::class, 'resend'])
        ->name('2fa.resend');


    /**
     * Update the authenticated user's password.
     * Usually requires the current password and may enforce 2FA if enabled.
     * Method: PUT
     * URL: /password
     * Route name: password.update
     */
    Route::put('password', [PasswordController::class, 'update'])
        ->name('password.update');


    /**
     * Log the authenticated user out and destroy their session.
     * Method: POST
     * URL: /logout
     * Route name: logout
     */
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
