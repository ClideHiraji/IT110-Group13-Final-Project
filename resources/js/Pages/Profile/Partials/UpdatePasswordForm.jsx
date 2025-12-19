import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthIndicator from '@/Components/PasswordStrengthIndicator';
import PasswordMatchIndicator from '@/Components/PasswordMatchIndicator';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

/**
 * UpdatePasswordForm
 *
 * React component responsible for updating the user's password.
 * Built on top of:
 * - Inertia's `useForm` hook for form state, validation errors, and PUT request handling. [web:67]
 * - Custom UI components (InputLabel, TextInput, PrimaryButton, etc.).
 * - Headless UI `Transition` for success message animations. [web:207]
 *
 * Features:
 * - New password and confirmation fields with show/hide toggles.
 * - Real-time password strength indicator for the new password.
 * - Real-time password match indicator between password and confirmation.
 * - Optional OTP field used when 2FA or OTP verification is required for password changes.
 * - Displays server-side validation errors returned by Laravel.
 *
 * Props:
 * - className (string): Extra Tailwind/utility classes applied to the wrapping <section>.
 */
export default function UpdatePasswordForm({ className = '' }) {
    // Ref to the password input, used to focus when there are validation errors.
    const passwordInput = useRef();

    // Access global page props from Inertia (e.g., authenticated user, flash, etc.).
    const { auth } = usePage().props;
    // Boolean flag to indicate if 2FA is enabled for the current user.
    const twoFactorEnabled = !!auth?.user?.two_factor_enabled;

    // Local state to toggle visibility of the new password field.
    const [showPassword, setShowPassword] = useState(false);
    // Local state to toggle visibility of the confirm password field.
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Inertia form helper providing:
     * - data: current form values
     * - setData: function to update individual fields
     * - errors: server-side validation errors keyed by field name
     * - put: method to send a PUT request to the backend
     * - reset: function to reset some/all fields
     * - processing: boolean indicating if a request is in-flight
     * - recentlySuccessful: boolean for brief "success" state after a valid submit
     *
     * Fields:
     * - password: new password
     * - password_confirmation: confirmation of the new password
     * - otp: one-time code (e.g., from email or authenticator app)
     */
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        password: '',
        password_confirmation: '',
        otp: '',
    });

    /**
     * Submit handler for the update password form.
     * - Prevents default browser form submission.
     * - Sends a PUT request to the `password.update` route using Inertia.
     * - On success: resets all form fields.
     * - On validation error:
     *   - If there is a password-specific error, clear password fields and refocus password input.
     */
    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                // current_password removed
            },
        });
    };

    return (
        <section className={className}>
            {/* Section header with title and explanatory text */}
            <header>
                <h2 className="text-lg font-medium from-amber-400 to-orange-500 bg-clip-text text-transparent bg-gradient-to-r">
                    Update Password
                </h2>

                <p className="mt-1 text-sm from-amber-400 to-orange-500 bg-clip-text text-transparent bg-gradient-to-r  ">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            {/* Main update password form */}
            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                {/* Current Password removed */}

                {/* New Password with Strength */}
                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <div className="relative mt-1">
                        {/* New password input with show/hide toggle */}
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showPassword ? "text" : "password"}
                            className="mt-1 block w-full pr-12 bg-black text-amber-300 placeholder:text-amber-400 border border-amber-500/30 focus:border-amber-400 focus:ring-amber-400/50 rounded-lg"
                            autoComplete="new-password"
                        />
                        {/* Eye icon button to toggle password visibility */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showPassword ? (
                                // "Hide password" icon (crossed eye)
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                // "Show password" icon (eye)
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Password Strength Indicator - only displays when user typed something */}
                    {data.password && (
                        <div className="mt-3">
                            <PasswordStrengthIndicator password={data.password} />
                        </div>
                    )}

                    {/* Validation error for password, if any */}
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password with Match */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />

                    <div className="relative mt-1">
                        {/* Confirm password input with show/hide toggle */}
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={showConfirmPassword ? "text" : "password"}
                            className="mt-1 block w-full pr-12 bg-black text-amber-300 placeholder:text-amber-400 border border-amber-500/30 focus:border-amber-400 focus:ring-amber-400/50 rounded-lg"
                            autoComplete="new-password"
                        />
                        {/* Eye icon button for confirm password visibility */}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showConfirmPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Visual indicator showing if passwords match */}
                    <PasswordMatchIndicator 
                        password={data.password} 
                        confirmPassword={data.password_confirmation} 
                    />

                    {/* Validation error for confirmation, if any */}
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* OTP input field and "Send Code" button */}
                <div>
                    <InputLabel htmlFor="otp" value="OTP Code" />
                    <div className="flex items-center gap-3">
                        {/* OTP text input (numeric, 6-digit) */}
                        <TextInput
                            id="otp"
                            value={data.otp}
                            onChange={(e) => setData('otp', e.target.value)}
                            className="mt-1 block w-full bg-black text-amber-300 placeholder:text-amber-400 border border-amber-500/30 focus:border-amber-400 focus:ring-amber-400/50 rounded-lg"
                            inputMode="numeric"
                            placeholder="Enter 6-digit code"
                        />
                        {/* Button to request or resend OTP via 2FA resend route */}
                        <Link
                            href={route('2fa.resend')}
                            method="post"
                            as="button"
                            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-ui font-semibold rounded-lg hover:from-amber-300 hover:to-orange-400 transition-all"
                        >
                            Send Code
                        </Link>
                    </div>
                    {/* Validation error for OTP, if any */}
                    <InputError message={errors.otp} className="mt-2" />
                </div>

                {/* Form actions: Save button + success message */}
                <div className="flex items-center gap-4 ">
                    {/* Submit button disabled while request is processing */}
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    {/* Animated success message when password is updated */}
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-[#F8F7F3]/70">Password updated successfully.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
