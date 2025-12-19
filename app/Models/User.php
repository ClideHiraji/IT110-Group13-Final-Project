<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * User Model
 * 
 * Represents a user account in the application with authentication, OTP verification,
 * and two-factor authentication capabilities. Extends Laravel's Authenticatable class
 * to provide full authentication functionality.
 * 
 * Features:
 * - Standard email/password authentication
 * - OTP (One-Time Password) generation and verification
 * - Two-factor authentication (2FA) support
 * - Email verification capability
 * - Password hashing via bcrypt
 * - Remember me functionality
 * - Notification system integration
 * 
 * Database Table: users
 * 
 * Relationships:
 * - Has many UserArtwork (art collection)
 * 
 * Authentication:
 * - Uses session-based authentication
 * - Supports API token authentication (via Sanctum if needed)
 * - Password automatically hashed on save
 * 
 * @package App\Models
 * 
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string|null $otp_code
 * @property \Carbon\Carbon|null $otp_expires_at
 * @property bool $is_verified
 * @property bool $two_factor_enabled
 * @property string|null $two_factor_secret
 * @property \Carbon\Carbon|null $two_factor_confirmed_at
 * @property \Carbon\Carbon|null $email_verified_at
 * @property string|null $remember_token
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * 
 * @method static \Illuminate\Database\Eloquent\Builder|User where($column, $value)
 * @method static User create(array $attributes)
 * @method static User find($id)
 * 
 * @see \Illuminate\Foundation\Auth\User
 * @see \App\Models\UserArtwork
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * 
     * Defines which attributes can be set via mass assignment (create(), update(), fill()).
     * This is a security feature to prevent malicious mass assignment attacks.
     * 
     * @var array<int, string>
     * 
     * Fillable Attributes:
     * - name: User's full name
     * - email: User's email address (unique)
     * - password: User's password (automatically hashed)
     * - otp_code: 6-digit OTP for verification
     * - otp_expires_at: Expiration timestamp for OTP
     * - is_verified: Whether user completed OTP verification
     * - two_factor_enabled: Whether 2FA is enabled
     * - two_factor_secret: Secret key for 2FA (if using TOTP)
     * - two_factor_confirmed_at: When 2FA was enabled
     * 
     * Protected Attributes (not fillable):
     * - id: Auto-increment primary key
     * - remember_token: Session remember token
     * - email_verified_at: Laravel email verification timestamp
     * - created_at: Record creation timestamp
     * - updated_at: Record update timestamp
     * 
     * Security Note:
     * Never add sensitive fields like role, is_admin, or balance to fillable.
     * Use explicit assignment for such fields:
     * ```
     * $user->is_admin = true;
     * $user->save();
     * ```
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'otp_code',
        'otp_expires_at',
        'is_verified',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     * 
     * These attributes are excluded when the model is converted to an array or JSON.
     * Prevents sensitive data from being exposed in API responses or logs.
     * 
     * @var list<string>
     * 
     * Hidden Attributes:
     * - password: Bcrypt hash of user's password
     * - remember_token: Token for persistent login sessions
     * - otp_code: Current OTP (if active)
     * - two_factor_secret: Secret key for TOTP generation
     * 
     * Visibility in Responses:
     * When user model is returned:
     * ```
     * {
     *   "id": 1,
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "is_verified": true,
     *   "two_factor_enabled": false,
     *   // password, remember_token, otp_code, two_factor_secret are hidden
     * }
     * ```
     * 
     * Override Hiding:
     * To temporarily show hidden attribute:
     * ```
     * $user->makeVisible(['password'])->toArray();
     * ```
     * 
     * To hide additional attributes:
     * ```
     * $user->makeHidden(['email'])->toArray();
     * ```
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
        'two_factor_secret',
    ];

    /**
     * Get the attributes that should be cast.
     * 
     * Defines automatic type casting for model attributes. Laravel automatically
     * converts these attributes to the specified types when accessed or set.
     * 
     * @return array<string, string>
     * 
     * Cast Types:
     * 
     * - email_verified_at => 'datetime'
     *   Converts timestamp to Carbon instance for easy date manipulation
     *   Usage: $user->email_verified_at->format('Y-m-d')
     * 
     * - password => 'hashed'
     *   Automatically hashes password using bcrypt when set
     *   No need to manually call Hash::make()
     *   Example: $user->password = 'plain-text' // automatically hashed
     * 
     * - is_verified => 'boolean'
     *   Converts 0/1 to true/false
     *   Usage: if ($user->is_verified) { ... }
     * 
     * - two_factor_enabled => 'boolean'
     *   Converts 0/1 to true/false
     *   Usage: if ($user->two_factor_enabled) { ... }
     * 
     * - two_factor_confirmed_at => 'datetime'
     *   Carbon instance for 2FA enable timestamp
     *   Usage: $user->two_factor_confirmed_at->diffForHumans()
     * 
     * - otp_expires_at => 'datetime'
     *   Carbon instance for OTP expiration
     *   Usage: $user->otp_expires_at->isFuture()
     * 
     * Benefits:
     * - Type safety in code
     * - Automatic conversion to/from database
     * - Consistent behavior across application
     * - Easier date/time manipulation
     * 
     * @see https://laravel.com/docs/eloquent-mutators#attribute-casting
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'otp_expires_at' => 'datetime',
        ];
    }

    /**
     * Generate and store OTP for the user.
     * 
     * Creates a 6-digit random OTP code and sets its expiration time to 10 minutes
     * from now. Saves the OTP to the database immediately.
     * 
     * OTP Characteristics:
     * - 6 digits (100000-999999)
     * - Valid for 10 minutes
     * - Stored as string in database
     * - Single use (cleared after verification)
     * 
     * @return string The generated OTP code
     * 
     * Usage Examples:
     * ```
     * // Generate OTP for user
     * $otp = $user->generateOtp();
     * 
     * // Send OTP via email
     * $user->notify(new SendOtpNotification($otp));
     * 
     * // Generate new OTP (invalidates previous)
     * $newOtp = $user->generateOtp();
     * ```
     * 
     * Security Considerations:
     * - Uses rand() - consider random_int() for better security
     * - 6 digits = 1,000,000 combinations
     * - 10-minute expiration limits brute force window
     * - Rate limiting should be applied at application level
     * 
     * Database Updates:
     * - Sets otp_code column
     * - Sets otp_expires_at column
     * - Calls save() to persist immediately
     * 
     * Use Cases:
     * - Registration verification
     * - Password reset verification
     * - Two-factor authentication
     * - Account recovery
     * 
     * Recommended Enhancement:
     * ```
     * public function generateOtp(): string
     * {
     *     // Use random_int for cryptographically secure randomness
     *     $this->otp_code = (string) random_int(100000, 999999);
     *     $this->otp_expires_at = now()->addMinutes(10);
     *     $this->save();
     *     return $this->otp_code;
     * }
     * ```
     */
    public function generateOtp(): string
    {
        // Generate 6-digit random number (100000-999999)
        $this->otp_code = (string) rand(100000, 999999);
        
        // Set expiration to 10 minutes from now
        $this->otp_expires_at = now()->addMinutes(10);
        
        // Save to database immediately
        $this->save();
        
        return $this->otp_code;
    }

    /**
     * Verify if the provided OTP is valid.
     * 
     * Checks if the provided OTP code matches the stored code and is not expired.
     * Does not clear the OTP - use clearOtp() after successful verification.
     * 
     * Validation Checks:
     * 1. OTP code matches stored code (exact match)
     * 2. Expiration timestamp is not null
     * 3. Expiration timestamp is in the future
     * 
     * @param string $code The OTP code to verify
     * 
     * @return bool True if OTP is valid and not expired, false otherwise
     * 
     * Usage Examples:
     * ```
     * // Verify OTP
     * if ($user->verifyOtp('123456')) {
     *     // OTP is valid - proceed with verification
     *     $user->clearOtp(); // Clear after successful verification
     *     $user->is_verified = true;
     *     $user->save();
     * } else {
     *     // OTP is invalid or expired
     *     return back()->withErrors(['otp' => 'Invalid or expired OTP']);
     * }
     * ```
     * 
     * Failure Scenarios:
     * - Wrong code: Returns false
     * - Expired code: Returns false
     * - No OTP set: Returns false (otp_expires_at is null)
     * - Already cleared: Returns false
     * 
     * Security Notes:
     * - Uses strict comparison (===) for code matching
     * - Time-based expiration prevents replay attacks
     * - Does not reveal which check failed (prevents information leakage)
     * - Should be combined with rate limiting
     * 
     * Carbon Methods:
     * - isFuture(): Returns true if timestamp is after current time
     * - Alternative: now()->lessThan($this->otp_expires_at)
     * 
     * Best Practices:
     * - Clear OTP immediately after verification
     * - Implement rate limiting (max 3-5 attempts)
     * - Log failed attempts for security monitoring
     * - Use constant-time comparison if available
     * 
     * @see \App\Models\User::clearOtp()
     * @see \Carbon\Carbon::isFuture()
     */
    public function verifyOtp(string $code): bool
    {
        // Check all three conditions:
        // 1. Code matches stored code (strict comparison)
        // 2. Expiration timestamp exists (not null)
        // 3. Expiration is in the future (not expired)
        return $this->otp_code === $code &&
               $this->otp_expires_at !== null &&
               $this->otp_expires_at->isFuture();
    }

    /**
     * Clear OTP from user record.
     * 
     * Removes OTP code and expiration timestamp from the database. Should be called
     * after successful OTP verification or when generating a new OTP to invalidate
     * the previous one.
     * 
     * Database Updates:
     * - Sets otp_code to null
     * - Sets otp_expires_at to null
     * - Uses update() for direct database query
     * 
     * @return void
     * 
     * Usage Examples:
     * ```
     * // After successful verification
     * if ($user->verifyOtp($request->otp)) {
     *     $user->clearOtp(); // Remove OTP after use
     *     $user->is_verified = true;
     *     $user->save();
     * }
     * 
     * // When generating new OTP (automatic invalidation)
     * $user->generateOtp(); // This doesn't clear, but overwrites
     * 
     * // Manual cleanup
     * $user->clearOtp();
     * ```
     * 
     * When to Call:
     * - After successful OTP verification
     * - After maximum failed attempts reached
     * - When user requests new OTP (optional - generateOtp() overwrites)
     * - During account cleanup/deletion
     * 
     * Security Benefits:
     * - Prevents OTP reuse after verification
     * - Removes expired OTPs from database
     * - Cleans up sensitive data
     * - Ensures one-time use property
     * 
     * Database Query:
     * Executes: UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?
     * 
     * Performance:
     * - Single database query
     * - No model refresh needed
     * - Changes reflected immediately
     * 
     * @see \App\Models\User::verifyOtp()
     * @see \App\Models\User::generateOtp()
     */
    public function clearOtp(): void
    {
        // Clear OTP fields in database
        // update() method sends immediate database query
        $this->update([
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);
    }

    /**
     * Check if user has enabled and confirmed 2FA.
     * 
     * Convenience method to check if two-factor authentication is fully active
     * for the user. Both the enabled flag and confirmation timestamp must be set.
     * 
     * 2FA States:
     * - Not enabled: two_factor_enabled = false
     * - Enabled but not confirmed: two_factor_enabled = true, confirmed_at = null
     * - Fully active: two_factor_enabled = true, confirmed_at = not null
     * 
     * @return bool True if 2FA is enabled and confirmed, false otherwise
     * 
     * Usage Examples:
     * ```
     * // Check if 2FA is required for login
     * if ($user->hasEnabledTwoFactorAuthentication()) {
     *     // Generate and send OTP
     *     $otp = $user->generateOtp();
     *     $user->notify(new SendOtpNotification($otp));
     *     return redirect()->route('2fa.challenge');
     * }
     * 
     * // Display 2FA status in UI
     * @if ($user->hasEnabledTwoFactorAuthentication())
     *     <span>2FA Active ✓</span>
     * @else
     *     <span>2FA Disabled</span>
     * @endif
     * ```
     * 
     * Confirmation Requirement:
     * - two_factor_confirmed_at prevents accidental 2FA locks
     * - User must complete setup before 2FA is enforced
     * - Confirmation typically happens during 2FA enable process
     * 
     * Related Methods:
     * - Enable 2FA: ProfileController@enableTwoFactor()
     * - Disable 2FA: ProfileController@disableTwoFactor()
     * - Verify 2FA: TwoFactorAuthController@verify()
     * 
     * Database Columns:
     * - two_factor_enabled: Boolean flag
     * - two_factor_confirmed_at: Timestamp of confirmation
     * 
     * Alternative Approaches:
     * ```
     * // Using accessor
     * return $this->two_factor_enabled && 
     *        !is_null($this->two_factor_confirmed_at);
     * 
     * // Using scope
     * public function scopeTwoFactorEnabled($query) {
     *     return $query->where('two_factor_enabled', true)
     *                  ->whereNotNull('two_factor_confirmed_at');
     * }
     * ```
     * 
     * @see \App\Http\Controllers\ProfileController::enableTwoFactor()
     * @see \App\Http\Controllers\Auth\TwoFactorAuthController
     */
    public function hasEnabledTwoFactorAuthentication(): bool
    {
        // Check both conditions:
        // 1. 2FA is enabled (flag is true)
        // 2. 2FA is confirmed (timestamp is not null)
        return $this->two_factor_enabled &&
               $this->two_factor_confirmed_at !== null;
    }
}
