import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';

const PromoCodeInput = ({ onApplyPromo, currentPromo = null }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(currentPromo);

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Please enter a promo code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock validation
            const validCodes = {
                'SAVE10': { type: 'percentage', value: 10, minOrder: 100 },
                'FLAT50': { type: 'fixed', value: 50, minOrder: 200 },
                'FIRST20': { type: 'percentage', value: 20, minOrder: 0 }
            };

            const promo = validCodes[code.toUpperCase()];

            if (promo) {
                setAppliedPromo({ code: code.toUpperCase(), ...promo });
                onApplyPromo({ code: code.toUpperCase(), ...promo });
                setCode('');
            } else {
                setError('Invalid promo code');
            }
        } catch (err) {
            setError('Failed to apply promo code');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setAppliedPromo(null);
        onApplyPromo(null);
        setError('');
    };

    return (
        <div className="space-y-3">
            {appliedPromo ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <Tag className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-green-800">{appliedPromo.code}</p>
                                <p className="text-sm text-green-600">
                                    {appliedPromo.type === 'percentage'
                                        ? `${appliedPromo.value}% off`
                                        : `₹${appliedPromo.value} off`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="p-2 hover:bg-green-100 rounded-lg transition"
                            aria-label="Remove promo code"
                        >
                            <X size={20} className="text-green-700" />
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex space-x-2">
                        <div className="flex-1 relative">
                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    setError('');
                                }}
                                placeholder="Enter promo code"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none uppercase"
                            />
                        </div>
                        <button
                            onClick={handleApply}
                            disabled={loading || !code.trim()}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Applying...' : 'Apply'}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 mt-2">{error}</p>
                    )}

                    {/* Available Promos Hint */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium mb-1">Available Codes:</p>
                        <div className="flex flex-wrap gap-2">
                            {['SAVE10', 'FLAT50', 'FIRST20'].map(promoCode => (
                                <button
                                    key={promoCode}
                                    onClick={() => setCode(promoCode)}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                                >
                                    {promoCode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoCodeInput;
