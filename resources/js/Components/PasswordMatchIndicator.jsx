import React from 'react';

export default function PasswordMatchIndicator({ password, confirmPassword }) {
    if (!confirmPassword || confirmPassword.length === 0) {
        return null;
    }

    const passwordsMatch = password === confirmPassword;
    const confirmHasContent = confirmPassword.length > 0;

    return (
        <div className="mt-2">
            {confirmHasContent && (
                <div className={`flex items-center space-x-2 text-xs font-ui ${
                    passwordsMatch ? 'text-green-400' : 'text-red-400'
                }`}>
                    {passwordsMatch ? (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Passwords match</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Passwords do not match</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
