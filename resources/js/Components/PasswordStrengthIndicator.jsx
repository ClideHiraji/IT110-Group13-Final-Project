import React from 'react';

export default function PasswordStrengthIndicator({ password, showRequirements = true }) {
    const requirements = {
        minLength: password.length >= 8,
        hasLowerCase: /[a-z]/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*#?&]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    
    // Calculate strength
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
        <div className="space-y-3">
            {/* Strength Bar */}
            {password.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-ui text-[#F8F7F3]/50">Password Strength</span>
                        <span className={`text-xs font-ui font-semibold ${
                            strengthText === 'Weak' ? 'text-red-400' :
                            strengthText === 'Fair' ? 'text-orange-400' :
                            strengthText === 'Good' ? 'text-yellow-400' :
                            'text-green-400'
                        }`}>
                            {strengthText}
                        </span>
                    </div>
                    <div className="h-2 bg-amber-950/20 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${strengthColor} transition-all duration-300 rounded-full`}
                            style={{ width: `${strength}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Requirements List */}
            {showRequirements && password.length > 0 && (
                <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg space-y-2">
                    <p className="text-xs font-ui text-[#F8F7F3]/70 mb-2">Password must contain:</p>
                    
                    <RequirementItem met={requirements.minLength} text="At least 8 characters" />
                    <RequirementItem met={requirements.hasUpperCase} text="One uppercase letter (A-Z)" />
                    <RequirementItem met={requirements.hasLowerCase} text="One lowercase letter (a-z)" />
                    <RequirementItem met={requirements.hasNumber} text="One number (0-9)" />
                    <RequirementItem met={requirements.hasSpecial} text="One special character (@$!%*#?&)" />
                </div>
            )}
        </div>
    );
}

function RequirementItem({ met, text }) {
    return (
        <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                met ? 'bg-green-500' : 'bg-amber-500/20'
            }`}>
                {met && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <span className={`text-xs font-ui transition-colors duration-200 ${
                met ? 'text-green-400' : 'text-[#F8F7F3]/50'
            }`}>
                {text}
            </span>
        </div>
    );
}
