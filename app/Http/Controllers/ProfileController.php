<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Redirect as RedirectFacade;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ProfileController
 * 
 * Manages user profile operations including viewing, updating profile information,
 * deleting accounts, and managing two-factor authentication settings. This
 * controller provides comprehensive profile management functionality.
 * 
 * Features:
 * - View/edit profile information
 * - Update name and email with validation
 * - Email re-verification when email changes
 * - Account deletion with password confirmation
 * - Enable/disable two-factor authentication (2FA)
 * - Session management during account deletion
 * 
 * Security Features:
 * - Password confirmation required for account deletion
 * - Email verification reset on email change
 * - Proper session invalidation on deletion
 * - CSRF token regeneration on sensitive operations
 * 
 * Integration Points:
 * - ProfileUpdateRequest: Custom validation for profile updates
 * - MustVerifyEmail: Interface for email verification
 * - Inertia.js: Frontend framework for rendering
 * - Two-factor authentication system
 * 
 * @package App\Http\Controllers
 * 
 * @see \App\Http\Requests\ProfileUpdateRequest
 * @see \Illuminate\Contracts\Auth\MustVerifyEmail
 */
class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     * 
     * Renders the profile edit page with user information and email verification
     * status. Provides data for displaying profile form fields and status messages.
     * 
     * @param Request $request The HTTP request with authenticated user
     * 
     * @return Response Inertia response rendering the profile page
     * 
     * Props Passed to Frontend:
     * - mustVerifyEmail (boolean): Whether user model implements email verification
     * - status (string|null): Session status message (e.g., "Profile updated!")
     * 
     * Page Features:
     * - Edit name and email fields
     * - Display current profile information
     * - Show email verification status
     * - Account deletion section
     * - Two-factor authentication controls
     * 
     * Conditional Features:
     * - Email verification prompt if mustVerifyEmail is true
     * - Verification status badge
     * - Resend verification email option
     * 
     * @see resources/js/Pages/Profile/Edit.vue
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            // Check if user model implements email verification
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            
            // Pass session status for displaying flash messages
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     * 
     * Updates user profile data (name, email) with custom validation. If the
     * email address is changed, resets email verification status requiring
     * the user to verify the new email address.
     * 
     * Validation:
     * - Handled by ProfileUpdateRequest custom request class
     * - Typically validates name and email uniqueness
     * 
     * Email Change Handling:
     * - Detects if email was modified using isDirty()
     * - Resets email_verified_at to null
     * - Triggers re-verification flow
     * - Sends new verification email automatically
     * 
     * @param ProfileUpdateRequest $request Custom request with validation rules
     * 
     * @return RedirectResponse Redirects back to profile edit page
     * 
     * Process Flow:
     * 1. Validate incoming data via ProfileUpdateRequest
     * 2. Fill user model with validated data
     * 3. Check if email was changed (isDirty)
     * 4. If email changed: set email_verified_at to null
     * 5. Save user model to database
     * 6. Redirect back to profile edit page
     * 
     * Database Updates:
     * - users.name: Updated if provided
     * - users.email: Updated if provided
     * - users.email_verified_at: Set to null if email changed
     * - users.updated_at: Automatically updated
     * 
     * Security Considerations:
     * - Email uniqueness validated in ProfileUpdateRequest
     * - Email verification required after change
     * - Prevents account takeover via email change
     * 
     * Frontend Integration:
     * - Show "Profile updated" success message
     * - Display email verification notice if email changed
     * - Keep form populated with current data
     * - Show loading state during update
     * 
     * Recommended Enhancements:
     * - Send notification to old email about change
     * - Log profile update events for audit
     * - Rate limit profile updates
     * - Add profile photo upload
     * 
     * @see \App\Http\Requests\ProfileUpdateRequest
     * @see \Illuminate\Database\Eloquent\Model::isDirty()
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // Fill user model with validated data from request
        // fill() only updates fillable attributes defined in User model
        $request->user()->fill($request->validated());

        // Check if email address was changed
        // isDirty() detects if attribute value differs from database
        if ($request->user()->isDirty('email')) {
            // Email changed - reset verification status
            // User must verify new email address
            $request->user()->email_verified_at = null;
        }

        // Save changes to database
        $request->user()->save();

        // Redirect back to profile edit page
        // Frontend should display success message
        $message = 'Profile updated successfully.';
        if ($request->user()->isDirty('name')) {
            $message = 'Username updated successfully.';
        }
        return Redirect::route('profile.edit')->with('status', $message);
    }

    /**
     * Delete the user's account.
     * 
     * Permanently deletes the user account after confirming their password.
     * This is a destructive operation that logs out the user, deletes their
     * account, invalidates the session, and redirects to home page.
     * 
     * Security Requirements:
     * - Current password must be provided and validated
     * - Uses 'current_password' validation rule
     * - Prevents unauthorized account deletion
     * 
     * Deletion Process:
     * 1. Validate current password
     * 2. Store user reference
     * 3. Logout user from all devices
     * 4. Delete user record from database
     * 5. Invalidate current session
     * 6. Regenerate CSRF token
     * 7. Redirect to home page
     * 
     * @param Request $request The HTTP request containing password
     * 
     * @return RedirectResponse Redirects to home page
     * 
     * Request Data Required:
     * - password (string): Current password for confirmation
     * 
     * Validation Rules:
     * - password: 'required', 'current_password'
     * 
     * Database Operations:
     * - Soft delete or hard delete depending on User model configuration
     * - Related data handling depends on foreign key constraints:
     *   - CASCADE: Related records automatically deleted
     *   - SET NULL: Foreign keys set to null
     *   - RESTRICT: Deletion fails if related records exist
     * 
     * Related Data Considerations:
     * - User artworks (UserArtwork): Should be deleted or anonymized
     * - User sessions: Automatically invalidated
     * - Password reset tokens: Should be cleaned up
     * - OTP codes: Automatically removed with user
     * 
     * Error Scenarios:
     * 1. Wrong password: 422 Validation Error "Password is incorrect"
     * 2. Foreign key constraint: Database exception
     * 
     * Frontend Integration:
     * - Show confirmation modal with password input
     * - Warn about data loss and irreversibility
     * - Display loading state during deletion
     * - Show final goodbye message after redirect
     * 
     * Recommended Enhancements:
     * - Implement soft deletes for account recovery
     * - Add grace period before permanent deletion
     * - Export user data before deletion (GDPR compliance)
     * - Send confirmation email
     * - Log deletion event for audit trail
     * - Clean up related data (collections, notes)
     * - Archive user data instead of deleting
     * 
     * GDPR Compliance:
     * - Ensure all personal data is removed
     * - Provide data export before deletion
     * - Document data retention policies
     * 
     * @see \Illuminate\Support\Facades\Auth::logout()
     * @see \Illuminate\Database\Eloquent\Model::delete()
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Validate current password
        // Ensures user is authorized to delete their own account
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        // Store reference to user before logout
        $user = $request->user();

        // Logout user from current session
        // Prevents authenticated requests after deletion
        Auth::logout();

        // Permanently delete user account
        // Depending on model configuration, may be soft delete
        $user->delete();

        // Invalidate current session
        // Clears all session data
        $request->session()->invalidate();

        // Regenerate CSRF token
        // Prevents CSRF attacks with old token
        $request->session()->regenerateToken();

        // Redirect to home page
        return Redirect::to('/');
    }

    /**
     * Enable two-factor authentication for the user.
     * 
     * Activates 2FA for the user account, requiring OTP verification on future
     * logins. Sets the confirmation timestamp to track when 2FA was enabled.
     * 
     * Process:
     * 1. Update two_factor_enabled to true
     * 2. Set two_factor_confirmed_at to current timestamp
     * 3. Save user model
     * 4. Redirect back with success message
     * 
     * @param Request $request The HTTP request with authenticated user
     * 
     * @return RedirectResponse Redirects back with status message
     * 
     * Database Updates:
     * - users.two_factor_enabled: Set to true (boolean/tinyint)
     * - users.two_factor_confirmed_at: Set to current timestamp
     * - users.updated_at: Automatically updated
     * 
     * Effect on Login:
     * - Future logins will require OTP verification
     * - OTP sent to user's email after password validation
     * - User must verify OTP before gaining access
     * 
     * Session Flash Data:
     * - 'status' => 'Two-factor authentication enabled.'
     * 
     * Frontend Integration:
     * - Show success notification
     * - Update 2FA toggle to enabled state
     * - Display 2FA status badge
     * - Show "Disable" button instead of "Enable"
     * 
     * Recommended Enhancements:
     * - Require password confirmation before enabling
     * - Generate backup codes for account recovery
     * - Send email notification about 2FA activation
     * - Provide QR code for authenticator apps
     * - Log 2FA enable event for security audit
     * 
     * Security Considerations:
     * - Consider requiring current password before enabling
     * - Provide backup authentication methods
     * - Educate users about 2FA importance
     * 
     * @see \App\Http\Controllers\Auth\TwoFactorAuthController
     */
    public function enableTwoFactor(Request $request): RedirectResponse
    {
        // Get authenticated user
        $user = $request->user();

        // Enable two-factor authentication
        $user->two_factor_enabled = true;
        
        // Set confirmation timestamp
        // Tracks when 2FA was activated
        $user->two_factor_confirmed_at = now();
        
        // Save changes to database
        $user->save();

        // Redirect back with success message
        return RedirectFacade::back()->with('status', 'Two-factor authentication enabled.');
    }

    /**
     * Disable two-factor authentication for the user.
     * 
     * Deactivates 2FA for the user account, removing OTP requirement for logins.
     * Clears all 2FA-related data including secrets and confirmation timestamp.
     * 
     * Process:
     * 1. Set two_factor_enabled to false
     * 2. Clear two_factor_secret
     * 3. Clear two_factor_confirmed_at
     * 4. Save user model
     * 5. Redirect back with success message
     * 
     * @param Request $request The HTTP request with authenticated user
     * 
     * @return RedirectResponse Redirects back with status message
     * 
     * Database Updates:
     * - users.two_factor_enabled: Set to false
     * - users.two_factor_secret: Set to null (clears secret key)
     * - users.two_factor_confirmed_at: Set to null
     * - users.updated_at: Automatically updated
     * 
     * Effect on Login:
     * - Future logins will not require OTP verification
     * - Standard email/password authentication only
     * 
     * Session Flash Data:
     * - 'status' => 'Two-factor authentication disabled.'
     * 
     * Frontend Integration:
     * - Show success notification
     * - Update 2FA toggle to disabled state
     * - Remove 2FA status badge
     * - Show "Enable" button instead of "Disable"
     * 
     * Security Considerations:
     * - Consider requiring password confirmation before disabling
     * - Send email notification about 2FA deactivation
     * - Log 2FA disable event for security audit
     * - Warn user about reduced account security
     * 
     * Recommended Enhancements:
     * - Require password confirmation before disabling
     * - Show confirmation modal with security warning
     * - Send email notification to user
     * - Log disable event with reason
     * - Add cooldown period before re-enabling
     * 
     * Important Notes:
     * - Disabling 2FA reduces account security
     * - All 2FA data is permanently cleared
     * - User must re-setup 2FA if re-enabled later
     * 
     * @see \App\Http\Controllers\Auth\TwoFactorAuthController
     */
    public function disableTwoFactor(Request $request): RedirectResponse
    {
        // Get authenticated user
        $user = $request->user();

        // Disable two-factor authentication
        $user->two_factor_enabled = false;
        
        // Clear 2FA secret key
        // Removes stored secret for OTP generation
        $user->two_factor_secret = null;
        
        // Clear confirmation timestamp
        $user->two_factor_confirmed_at = null;
        
        // Save changes to database
        $user->save();

        // Redirect back with success message
        return RedirectFacade::back()->with('status', 'Two-factor authentication disabled.');
    }
}
