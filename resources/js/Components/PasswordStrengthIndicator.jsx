import React from 'react';

/**
 * PasswordStrengthIndicator Component
 * 
 * Visual password strength meter with requirements checklist.
 * Validates password against security requirements and displays strength level.
 * 
 * Features:
 * - Real-time password strength calculation
 * - Visual progress bar
 * - Requirements checklist with checkmarks
 * - Color-coded strength levels (Weak/Fair/Good/Strong)
 * - Optional requirements display toggle
 * 
 * Password Requirements:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character (@$!%*#?&)
 * 
 * Strength Levels:
 * - Weak (25%): 2 or fewer requirements met - Red
 * - Fair (50%): 3 requirements met - Orange
 * - Good (75%): 4 requirements met - Yellow
 * - Strong (100%): All 5 requirements met - Green
 * 
 * @param {Object} props - Component props
 * @param {string} props.password - Password string to validate
 * @param {boolean} [props.showRequirements=true] - Show requirements list
 * 
 * @example
 * // Basic usage in registration form
 * const [password, setPassword] = useState('');
 * 
 * <TextInput 
 *   type="password" 
 *   value={password} 
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 * <PasswordStrengthIndicator password={password} />
 * 
 * @example
 * // Without requirements list
 * <PasswordStrengthIndicator 
 *   password={password} 
 *   showRequirements={false}
 * />
 * 
 * @example
 * // In a password change form
 * <div className="space-y-4">
 *   <div>
 *     <InputLabel value="New Password" />
 *     <TextInput 
 *       type="password"
 *       value={newPassword}
 *       onChange={(e) => setNewPassword(e.target.value)}
 *     />
 *     <PasswordStrengthIndicator password={newPassword} />
 *   </div>
 * </div>
 */
export default function PasswordStrengthIndicator({ password, showRequirements = true }) {
    // Define password requirements
    const requirements = {
        minLength: password.length >= 8,
        hasLowerCase: /[a-z]/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*#?&]/.test(password),
    };

    // Count met requirements
    const metRequirements = Object.values(requirements).filter(Boolean).length;

    // Calculate strength level
    let strength = 0;
    let strengthText = '';
    let strengthColor = '';

    if (password.length === 0) {
        strengthText = '';
        strengthColor = '';
    } else if (metRequirements <= 2) {
        strength = 25;
        strengthText = 'Weak';
        strengthColor = 'bg-red-500';
    } else if (metRequirements === 3) {
        strength = 50;
        strengthText = 'Fair';
        strengthColor = 'bg-orange-500';
    } else if (metRequirements === 4) {
        strength = 75;
        strengthText = 'Good';
        strengthColor = 'bg-yellow-500';
    } else if (metRequirements === 5) {
        strength = 100;
        strengthText = 'Strong';
        strengthColor = 'bg-green-500';
    }

    const allRequirementsMet = metRequirements === 5;

    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            {password.length > 0 && (
                <div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${strengthColor}`}
                            style={{ width: `${strength}%` }}
                        />
                    </div>
                    <p className={`text-xs mt-1 ${strengthText === 'Weak' ? 'text-red-600' : strengthText === 'Fair' ? 'text-orange-600' : strengthText === 'Good' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {strengthText}
                    </p>
                </div>
            )}

            {/* Requirements Checklist */}
            {showRequirements && password.length > 0 && (
                <div className="text-xs space-y-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                        Password must contain:
                    </p>
                    <ul className="space-y-1">
                        <li className={requirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                            {requirements.minLength ? '✓' : '○'} At least 8 characters
                        </li>
                        <li className={requirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                            {requirements.hasLowerCase ? '✓' : '○'} One lowercase letter
                        </li>
                        <li className={requirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                            {requirements.hasUpperCase ? '✓' : '○'} One uppercase letter
                        </li>
                        <li className={requirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                            {requirements.hasNumber ? '✓' : '○'} One number
                        </li>
                        <li className={requirements.hasSpecial ? 'text-green-600' : 'text-gray-500'}>
                            {requirements.hasSpecial ? '✓' : '○'} One special character (@$!%*#?&)
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
