<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendOtpNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

/**
 * RegisteredUserController
 * 
 * Handles new user registration with OTP email verification. This controller
 * implements a two-step registration process where users must verify their
 * email address with a one-time password before account creation.
 * 
 * Registration Flow:
 * 1. User fills out registration form (create method shows form)
 * 2. User submits registration data (store method)
 * 3. System validates input and generates 6-digit OTP
 * 4. Registration data and OTP stored in session (user not created yet)
 * 5. OTP sent to user's email
 * 6. User redirected to OTP verification page
 * 7. After successful OTP verification, user account is created
 * 
 * Security Features:
 * - Email uniqueness validation prevents duplicate accounts
 * - Password hashed before storing in session
 * - OTP expires after 10 minutes
 * - Session-based storage prevents database pollution
 * - Email verification required before account activation
 * 
 * Session Storage:
 * 'registration_data' => [
 *     'name' => string,
 *     'email' => string,
 *     'password' => string (hashed),
 *     'otp_code' => string (6 digits),
 *     'otp_expires_at' => Carbon datetime
 * ]
 * 
 * @package App\Http\Controllers\Auth
 * 
 * @see \App\Http\Controllers\Auth\OtpVerificationController
 * @see \App\Notifications\SendOtpNotification
 */
class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     * 
     * Renders the registration form where new users can create an account.
     * The form typically includes fields for name, email, password, and
     * password confirmation.
     * 
     * @return Response Inertia response rendering the registration form
     * 
     * Form Fields:
     * - name: User's full name
     * - email: Valid email address (checked for uniqueness)
     * - password: Password meeting complexity requirements
     * - password_confirmation: Must match password field
     * 
     * @see resources/js/Pages/Auth/Register.vue
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     * 
     * Validates registration data, generates an OTP code, stores everything in
     * the session, sends the OTP via email, and redirects to the verification
     * page. The user account is NOT created at this stage - it's created after
     * successful OTP verification.
     * 
     * Process Flow:
     * 1. Validate registration input (name, email, password)
     * 2. Check email uniqueness in database
     * 3. Generate cryptographically secure 6-digit OTP
     * 4. Set OTP expiration time (10 minutes from now)
     * 5. Hash the password for secure storage
     * 6. Store all data in session (not database yet)
     * 7. Send OTP to user's email via notification
     * 8. Redirect to OTP verification page
     * 
     * @param Request $request The HTTP request containing registration data
     * 
     * @return RedirectResponse Redirects to OTP verification page or back with errors
     * 
     * @throws \Illuminate\Validation\ValidationException If validation fails
     * 
     * Request Data Required:
     * - name (string): Required, max 255 characters
     * - email (string): Required, valid email format, max 255 chars, must be unique
     * - password (string): Required, must meet Rules\Password::defaults()
     * - password_confirmation (string): Required, must match password
     * 
     * Validation Rules:
     * - name: 'required|string|max:255'
     * - email: 'required|string|email|max:255|unique:users'
     * - password: ['required', 'confirmed', Rules\Password::defaults()]
     *   (typically: min 8 chars, letters and numbers)
     * 
     * OTP Generation:
     * - Range: 000000 to 999999 (1 million combinations)
     * - Generation: random_int() for cryptographic security
     * - Format: Zero-padded 6-digit string
     * - Validity: 10 minutes
     * 
     * Session Data Stored:
     * - registration_data.name: User's full name
     * - registration_data.email: User's email address
     * - registration_data.password: Bcrypt hashed password
     * - registration_data.otp_code: 6-digit verification code
     * - registration_data.otp_expires_at: Carbon timestamp for expiration
     * 
     * Error Scenarios:
     * 1. Validation fails: Returns back with validation errors
     * 2. Email already exists: "The email has already been taken."
     * 3. Email sending fails: "Failed to send verification code. Please try again."
     * 
     * Session Flash Data (on success):
     * - 'status' => 'Verification code sent to your email!'
     * 
     * Important Notes:
     * - User record is NOT created in database at this stage
     * - Password is hashed BEFORE storing in session for security
     * - Session data cleared after successful OTP verification
     * - If user closes browser, registration must be restarted
     * 
     * @see \App\Http\Controllers\Auth\OtpVerificationController::verify()
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the incoming registration data
        // Ensures all fields meet requirements before processing
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Generate a cryptographically secure 6-digit OTP code
        // random_int(0, 999999) generates numbers from 0 to 999999
        // str_pad ensures leading zeros (e.g., 000042 instead of 42)
        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Set OTP expiration time to 10 minutes from now
        // After this time, the OTP will be considered expired
        $expiresAt = now()->addMinutes(10);

        // Store registration data and OTP in session
        // User account is NOT created yet - only after OTP verification
        // Password is hashed here for security even in session storage
        session([
            'registration_data' => [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password), // Hash password for security
                'otp_code' => $otpCode,
                'otp_expires_at' => $expiresAt,
            ]
        ]);

        // Send OTP verification code via email notification
        try {
            // Use on-demand notification without requiring a User model
            // since user doesn't exist yet
            \Notification::route('mail', $request->email)
                ->notify(new SendOtpNotification($otpCode));
        } catch (\Exception $e) {
            // Log error details for debugging
            \Log::error('Failed to send OTP: ' . $e->getMessage());
            
            // Return to registration form with error message
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }

        // Redirect to OTP verification page with success message
        // The verification.notice route should render the OTP input form
        return redirect()->route('verification.notice')
            ->with('status', 'Verification code sent to your email!');
    }
}
