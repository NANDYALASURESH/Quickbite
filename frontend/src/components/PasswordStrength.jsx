import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrength = ({ password }) => {
    const requirements = [
        { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
        { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
        { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
        { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
        { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
    ];

    const passedRequirements = requirements.filter(req => req.test(password)).length;
    const strength = passedRequirements === 0 ? 0 :
        passedRequirements <= 2 ? 1 :
            passedRequirements <= 3 ? 2 :
                passedRequirements <= 4 ? 3 : 4;

    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

    return (
        <div className="mt-2">
            {/* Strength Bar */}
            {password && (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password Strength</span>
                        <span className={`text-xs font-semibold ${strength === 1 ? 'text-red-500' :
                                strength === 2 ? 'text-orange-500' :
                                    strength === 3 ? 'text-yellow-500' :
                                        strength === 4 ? 'text-green-500' : 'text-gray-400'
                            }`}>
                            {strengthLabels[strength]}
                        </span>
                    </div>
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={`h-2 flex-1 rounded-full transition-colors ${level <= strength ? strengthColors[strength] : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Requirements Checklist */}
            {password && (
                <div className="space-y-1">
                    {requirements.map((req, index) => {
                        const passed = req.test(password);
                        return (
                            <div key={index} className="flex items-center space-x-2 text-xs">
                                {passed ? (
                                    <Check size={14} className="text-green-500" />
                                ) : (
                                    <X size={14} className="text-gray-300" />
                                )}
                                <span className={passed ? 'text-green-600' : 'text-gray-500'}>
                                    {req.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PasswordStrength;
