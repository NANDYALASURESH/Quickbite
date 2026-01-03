import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [restaurant, setRestaurant] = useState(null);

    const addToCart = (item, restaurantData) => {
        if (restaurant && restaurant._id !== restaurantData._id) {
            if (!window.confirm('Your cart contains items from another restaurant. Clear cart?')) {
                return;
            }
            setCartItems([]);
        }

        setRestaurant(restaurantData);

        const existingItem = cartItems.find(i => i._id === item._id);
        if (existingItem) {
            setCartItems(cartItems.map(i =>
                i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            ));
        } else {
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter(i => i._id !== itemId));
        if (cartItems.length === 1) {
            setRestaurant(null);
        }
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity === 0) {
            removeFromCart(itemId);
        } else {
            setCartItems(cartItems.map(i =>
                i._id === itemId ? { ...i, quantity } : i
            ));
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurant(null);
    };

    const getTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            restaurant,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
