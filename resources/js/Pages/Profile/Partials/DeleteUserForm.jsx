import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

/**
 * DeleteUserForm Component
 *
 * Handles the permanent deletion of a user account.
 *
 * Responsibilities:
 * - Displays a warning section about account deletion with a danger button.
 * - Opens a confirmation modal when the user clicks "Delete Account".
 * - Requires the user to re-enter their password to confirm deletion.
 * - Submits a DELETE request to profile.destroy using Inertia's useForm.
 * - Closes the modal on success or refocuses the password field on error.
 * - Clears form data and errors when the modal is closed.
 *
 * Props:
 * - className {string}: Optional additional CSS classes for the section wrapper.
 *
 * Form shape (useForm):
 * - password {string}: User's password confirmation for account deletion.
 *
 * State:
 * - confirmingUserDeletion {boolean}: Controls whether the confirmation modal is visible.
 * - passwordInput {Ref}: Reference to the password input for focus management.
 */
export default function DeleteUserForm({ className = '' }) {
    // Controls visibility of the deletion confirmation modal
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    
    // Ref to the password input field for focus management on errors
    const passwordInput = useRef();

    // Inertia form state for password confirmation and deletion request
    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    /**
     * Opens the confirmation modal for account deletion.
     */
    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    /**
     * Handles account deletion submission.
     * - Sends DELETE request to profile.destroy route.
     * - On success: closes the modal.
     * - On error: refocuses the password input.
     * - Always resets the form when finished.
     */
    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    /**
     * Closes the confirmation modal and resets form state.
     * - Clears validation errors.
     * - Resets password field to empty.
     */
    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            {/* Header section with warning about permanent deletion */}
            <header>
                <h2 className="text-lg font-medium text-amber-300">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-amber-400/80">
                    This action is permanent and cannot be undone. Consider exporting your collection before proceeding.
                </p>
            </header>

            {/* Danger button to initiate account deletion flow */}
            <DangerButton onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            {/* Confirmation modal requiring password verification */}
            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    {/* Modal header explaining the consequences */}
                    <h2 className="text-lg font-medium text-amber-300">
                        Confirm Account Deletion
                    </h2>

                    <p className="mt-1 text-sm text-amber-400/80">
                        Deleting your account removes all saved artworks and notes. Enter your password to confirm.
                    </p>

                    {/* Password confirmation input */}
                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-3/4 bg-black text-amber-300 placeholder:text-amber-400 border border-amber-500/30 focus:border-amber-400 focus:ring-amber-400/50 rounded-lg"
                            isFocused
                            placeholder="Password"
                        />

                        {/* Validation error message for password field */}
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    {/* Action buttons: Cancel or confirm deletion */}
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
