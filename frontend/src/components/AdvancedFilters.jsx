import React, { useState } from 'react';
import { Sliders, X } from 'lucide-react';

const AdvancedFilters = ({ onApplyFilters, onClose }) => {
    const [filters, setFilters] = useState({
        priceRange: [0, 1000],
        dietary: [],
        cuisines: [],
        minRating: 0,
        maxDeliveryTime: 60,
        sortBy: 'rating'
    });

    const dietaryOptions = [
        { id: 'veg', label: 'Vegetarian', icon: '🥗' },
        { id: 'vegan', label: 'Vegan', icon: '🌱' },
        { id: 'gluten-free', label: 'Gluten Free', icon: '🌾' },
        { id: 'non-veg', label: 'Non-Vegetarian', icon: '🍖' }
    ];

    const cuisineOptions = [
        'Italian', 'Indian', 'Chinese', 'Mexican', 'Thai',
        'Japanese', 'American', 'Mediterranean', 'Korean', 'Vietnamese'
    ];

    const sortOptions = [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'deliveryTime', label: 'Fastest Delivery' },
        { value: 'priceLowToHigh', label: 'Price: Low to High' },
        { value: 'priceHighToLow', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' }
    ];

    const toggleDietary = (option) => {
        setFilters(prev => ({
            ...prev,
            dietary: prev.dietary.includes(option)
                ? prev.dietary.filter(d => d !== option)
                : [...prev.dietary, option]
        }));
    };

    const toggleCuisine = (cuisine) => {
        setFilters(prev => ({
            ...prev,
            cuisines: prev.cuisines.includes(cuisine)
                ? prev.cuisines.filter(c => c !== cuisine)
                : [...prev.cuisines, cuisine]
        }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            priceRange: [0, 1000],
            dietary: [],
            cuisines: [],
            minRating: 0,
            maxDeliveryTime: 60,
            sortBy: 'rating'
        };
        setFilters(resetFilters);
        onApplyFilters(resetFilters);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Sliders className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold text-gray-800">Advanced Filters</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="50"
                                value={filters.priceRange[0]}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                                }))}
                                className="flex-1"
                            />
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="50"
                                value={filters.priceRange[1]}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                                }))}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Dietary Preferences
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {dietaryOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleDietary(option.id)}
                                    className={`p-3 rounded-lg border-2 transition-all ${filters.dietary.includes(option.id)
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl">{option.icon}</span>
                                        <span className="font-medium text-gray-700">{option.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cuisines */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Cuisines
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {cuisineOptions.map(cuisine => (
                                <button
                                    key={cuisine}
                                    onClick={() => toggleCuisine(cuisine)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filters.cuisines.includes(cuisine)
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Minimum Rating */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Minimum Rating: {filters.minRating} ⭐
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={filters.minRating}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                minRating: parseFloat(e.target.value)
                            }))}
                            className="w-full"
                        />
                    </div>

                    {/* Max Delivery Time */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Max Delivery Time: {filters.maxDeliveryTime} min
                        </label>
                        <input
                            type="range"
                            min="15"
                            max="90"
                            step="5"
                            value={filters.maxDeliveryTime}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                maxDeliveryTime: parseInt(e.target.value)
                            }))}
                            className="w-full"
                        />
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Sort By
                        </label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex space-x-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                        Reset All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilters;
