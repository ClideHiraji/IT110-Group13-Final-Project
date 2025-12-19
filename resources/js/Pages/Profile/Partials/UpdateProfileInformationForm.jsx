import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

/**
 * UpdateProfileInformation Component
 *
 * Lets the user edit profile information (currently name only) and shows
 * email verification status and actions.
 *
 * Responsibilities:
 * - Displays the current user's name and email from Inertia page props.
 * - Allows updating the name via a PATCH request to profile.update.
 * - Shows the email field as read-only (cannot be edited here).
 * - If email verification is required and not completed:
 *   - Shows a message about unverified email.
 *   - Provides a button to resend the verification email.
 *   - Displays a confirmation message when a new verification link is sent.
 * - Shows a transient "Saved." message after a successful profile update.
 *
 * Props:
 * - mustVerifyEmail {boolean}: Whether the application requires email verification.
 * - status {string|null}: Status string from the backend (e.g. 'verification-link-sent').
 * - className {string}: Optional additional classes for the outer section.
 *
 * Form shape (useForm):
 * - name {string}: The user's display name.
 * - email {string}: The user's email (read-only in this form).
 */
export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    // Get the authenticated user from Inertia page props
    const user = usePage().props.auth.user;

    // Inertia form state for name and email, seeded from current user
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    /**
     * Submit handler for profile updates.
     * - Prevents default browser submit.
     * - Sends a PATCH request to the profile.update route with current form data.
     */
    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            {/* Header: title and description */}
            <header>
                <h2 className="text-lg font-medium from-amber-400 to-orange-500 bg-clip-text text-transparent bg-gradient-to-r">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm from-amber-400 to-orange-500 bg-clip-text text-transparent bg-gradient-to-r">
                    Update your account's profile information and email address.
                </p>
            </header>

            {/* Main profile form */}
            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Name field */}
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full bg-black text-amber-300 placeholder:text-amber-400 border border-amber-500/30 focus:border-amber-400 focus:ring-amber-400/50 rounded-lg"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    {/* Validation error for name field */}
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email field (read-only / non-editable here) */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full bg-black text-amber-300 placeholder:text-amber-400 disabled:bg-black disabled:text-amber-300 disabled:placeholder:text-amber-400 border border-amber-500/30 disabled:border-amber-500/30 focus:border-amber-400 focus:ring-amber-400/50 rounded-lg cursor-not-allowed"
                        value={data.email}
                        placeholder={data.name || user.name}
                        readOnly
                        disabled
                        autoComplete="username"
                    />
                </div>

                {/* Email verification notice and resend link (only when needed) */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {' '}
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {/* Confirmation message when a new verification link was sent */}
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                {/* Actions: Save button and transient success message */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
