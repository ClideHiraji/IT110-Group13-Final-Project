import React from 'react';

/**
 * PasswordMatchIndicator Component
 * 
 * Visual indicator showing whether password and confirmation match.
 * Displays only when confirm password field has content.
 * 
 * Features:
 * - Real-time match validation
 * - Visual checkmark/x indicator
 * - Color-coded feedback (green/red)
 * - Conditional rendering
 * 
 * States:
 * - Hidden: When confirmPassword is empty
 * - Match (Green): Passwords match
 * - Mismatch (Red): Passwords don't match
 * 
 * @param {Object} props - Component props
 * @param {string} props.password - Original password
 * @param {string} props.confirmPassword - Confirmation password
 * 
 * @example
 * // In registration form
 * const [password, setPassword] = useState('');
 * const [confirmPassword, setConfirmPassword] = useState('');
 * 
 * <div>
 *   <InputLabel value="Password" />
 *   <TextInput 
 *     type="password" 
 *     value={password}
 *     onChange={(e) => setPassword(e.target.value)}
 *   />
 * </div>
 * 
 * <div>
 *   <InputLabel value="Confirm Password" />
 *   <TextInput 
 *     type="password"
 *     value={confirmPassword}
 *     onChange={(e) => setConfirmPassword(e.target.value)}
 *   />
 *   <PasswordMatchIndicator 
 *     password={password} 
 *     confirmPassword={confirmPassword}
 *   />
 * </div>
 * 
 * @example
 * // In password change form
 * <PasswordMatchIndicator 
 *   password={newPassword} 
 *   confirmPassword={confirmNewPassword}
 * />
 */
export default function PasswordMatchIndicator({ password, confirmPassword }) {
    // Don't show indicator if confirm password is empty
    if (!confirmPassword || confirmPassword.length === 0) {
        return null;
    }

    const passwordsMatch = password === confirmPassword;

    return (
        <div className="mt-2">
            <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                {passwordsMatch ? (
                    <span>✓ Passwords match</span>
                ) : (
                    <span>✗ Passwords do not match</span>
                )}
            </p>
        </div>
    );
}
