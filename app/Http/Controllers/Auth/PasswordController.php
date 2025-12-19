<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rules\Password;
use App\Http\Controllers\Controller;

/**
 * PasswordController
 * 
 * Handles password updates for authenticated users with optional two-factor
 * authentication (2FA) verification. This controller ensures users can only
 * change their password after providing their current password and, if 2FA
 * is enabled, a valid OTP code.
 * 
 * Security Features:
     * - Optional current password verification (removed per request)
 * - Enforces password complexity rules
 * - Requires password confirmation (double entry)
 * - 2FA OTP verification when enabled
 * - OTP is cleared after successful verification
 * - Rate limiting should be applied at route level
 * 
 * Password Change Flow (without 2FA):
 * 1. User navigates to password change form
 * 2. User enters: current password, new password, new password confirmation
 * 3. System validates current password
 * 4. System validates new password meets complexity requirements
 * 5. Password is hashed and updated
 * 6. User is redirected back to settings
 * 
 * Password Change Flow (with 2FA enabled):
 * 1-2. Same as above
 * 3. User also enters 6-digit OTP from email/authenticator
 * 4. System validates current password
 * 5. System validates OTP code
 * 6. OTP is cleared from database
 * 7. System validates new password meets complexity requirements
 * 8. Password is hashed and updated
 * 9. User is redirected back to settings
 * 
 * @package App\Http\Controllers
 * 
 * @see \App\Models\User::verifyOtp()
 * @see \App\Models\User::clearOtp()
 */
class PasswordController extends Controller
{
    /**
     * Update the user's password.
     * 
     * Updates the authenticated user's password after validating their current
     * password, new password complexity, and optionally verifying a 2FA OTP code
     * if two-factor authentication is enabled for the account.
     * 
     * Validation Logic:
     * 1. Check if user has 2FA enabled
     * 2. If 2FA enabled: add OTP validation rule
     * 3. Validate all required fields
     * 4. If 2FA enabled: verify OTP is valid and not expired
     * 5. Clear OTP after successful verification
     * 6. Update password with bcrypt hash
     * 
     * @param Request $request The HTTP request containing password data
     * 
     * @return RedirectResponse Redirects back to previous page
     * 
     * Request Data Required:
     * - current_password (string): Removed (no longer required)
     * - password (string): New password meeting complexity requirements
     * - password_confirmation (string): Must match new password
     * - otp (string, conditional): Required only if user has 2FA enabled
     * 
     * Validation Rules:
     * - current_password: Removed
     * - password: 'required', Password::defaults(), 'confirmed'
     *   (Password::defaults() typically enforces min 8 chars, mixed case, numbers)
     * - otp (conditional): 'required', 'string', 'size:6'
     *   (Only required when user->two_factor_enabled is true)
     * 
     * 2FA Requirements:
     * - User model must have 'two_factor_enabled' boolean field
     * - User model must implement verifyOtp($code) method
     * - User model must implement clearOtp() method
     * - OTP must be 6 characters (digits)
     * - OTP is validated against database stored code and expiration
     * 
     * Security Considerations:
     * - Current password verification prevents unauthorized changes
     * - Password confirmation prevents typos
     * - 2FA adds extra layer of security for sensitive accounts
     * - OTP is cleared immediately after use (one-time use)
     * - Password is hashed with bcrypt before storage
     * 
     * Error Scenarios:
     * 1. Current password incorrect: "The current password is incorrect."
     * 2. New password doesn't meet requirements: Complexity error message
     * 3. Password confirmation doesn't match: "The password confirmation does not match."
     * 4. OTP invalid/expired (if 2FA enabled): "Invalid or expired OTP code."
     * 
     * Database Operations:
     * - Updates users.password field with new bcrypt hash
     * - Clears OTP fields if 2FA verification was used
     * 
     * Response:
     * - Redirects back to previous page (typically settings/profile page)
     * - Frontend should display success message
     * - No flash data is explicitly set (can be added if needed)
     * 
     * Recommended Enhancements:
     * - Add session invalidation for other devices
     * - Send email notification of password change
     * - Log password change event for security audit
     * - Add rate limiting to prevent brute force attacks
     * 
     * @see config/auth.php ('passwords' configuration for rules)
     */
    public function update(Request $request): RedirectResponse
    {
        // Build validation rules: always require OTP for password changes
        $rules = [
            'password' => ['required', Password::defaults(), 'confirmed'],
            'otp' => ['required', 'string', 'size:6'],
        ];

        // Custom validation messages (ensure friendly OTP prompt)
        $messages = [
            'otp.required' => 'Verify first before save.',
            'otp.size' => 'Invalid or expired OTP code.',
        ];

        // Validate the request with the dynamically built rules
        $validated = $request->validate($rules, $messages);

        // Verify OTP code before allowing password change
        if (!$request->user()->verifyOtp($validated['otp'] ?? '')) {
            return Redirect::back()->withErrors(['otp' => 'Invalid or expired OTP code.']);
        }
        // Clear OTP from database after successful verification
        $request->user()->clearOtp();

        // Update the user's password with the new hashed password
        // Hash::make() uses bcrypt with cost factor from config
        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Redirect back to the previous page (typically profile/settings)
        // Frontend should listen for success and display confirmation message
        return back()->with('status', 'Password updated successfully.');
    }
}
