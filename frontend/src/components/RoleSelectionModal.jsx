import React from 'react';
import { X } from 'lucide-react';

const RoleSelectionModal = ({ isOpen, onClose, onSelectRole }) => {
    if (!isOpen) return null;

    const roles = [
        {
            id: 'user',
            name: 'Customer',
            icon: '👤',
            description: 'Order food from restaurants',
            color: 'blue'
        },
        {
            id: 'owner',
            name: 'Restaurant Owner',
            icon: '🍽️',
            description: 'Manage your restaurant',
            color: 'purple'
        },
        {
            id: 'delivery',
            name: 'Delivery Partner',
            icon: '🚴',
            description: 'Deliver orders to customers',
            color: 'green'
        }
    ];

    const handleRoleSelect = (roleId) => {
        onSelectRole(roleId);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 relative animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
                    <p className="text-gray-600">Select how you want to use QuickBite</p>
                </div>

                {/* Role options */}
                <div className="grid md:grid-cols-3 gap-4">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleSelect(role.id)}
                            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${role.color === 'blue'
                                ? 'border-blue-200 hover:border-blue-500 hover:bg-blue-50'
                                : role.color === 'purple'
                                    ? 'border-purple-200 hover:border-purple-500 hover:bg-purple-50'
                                    : 'border-green-200 hover:border-green-500 hover:bg-green-50'
                                }`}
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <span className="text-5xl">{role.icon}</span>
                                <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                                <p className="text-sm text-gray-600">{role.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer note */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    You can change your role later in account settings
                </p>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
