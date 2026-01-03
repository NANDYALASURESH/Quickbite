import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, DollarSign } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

// ============================================================================
// Razorpay Payment Component
// ============================================================================
const RazorpayPayment = ({ order, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleRazorpayPayment = async () => {
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/payment/create-razorpay-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ orderId: order._id })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'EatEase',
                description: `Order #${order._id.slice(-8)}`,
                order_id: data.orderId,
                handler: async function (response) {
                    const verifyResponse = await fetch(`${API_URL}/payment/verify-razorpay`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            orderId: order._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        onSuccess();
                    } else {
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: order.user?.name || '',
                    email: order.user?.email || '',
                    contact: order.contactPhone || ''
                },
                theme: {
                    color: '#F97316'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Razorpay error:', error);
            alert('Payment failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRazorpayPayment}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
            <CreditCard size={20} />
            <span>{loading ? 'Processing...' : 'Pay with Razorpay'}</span>
        </button>
    );
};

// ============================================================================
// Stripe Payment Form Component
// ============================================================================
const StripePaymentForm = ({ order, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/payment/create-stripe-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ orderId: order._id })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                data.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: order.user?.name || '',
                            email: order.user?.email || ''
                        }
                    }
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                onSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 border border-gray-300 rounded-lg">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!stripe || loading}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
                <CreditCard size={20} />
                <span>{loading ? 'Processing...' : `Pay ₹${order.pricing?.total || 0}`}</span>
            </button>
        </div>
    );
};

// ============================================================================
// Stripe Payment Wrapper
// ============================================================================
const StripePayment = ({ order, onSuccess }) => (
    <Elements stripe={stripePromise}>
        <StripePaymentForm order={order} onSuccess={onSuccess} />
    </Elements>
);

// ============================================================================
// Payment Selector Component
// ============================================================================
const PaymentSelector = ({ order, onPaymentSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState('razorpay');

    const paymentMethods = [
        { id: 'razorpay', name: 'Razorpay', icon: <CreditCard />, color: 'blue' },
        { id: 'stripe', name: 'Stripe', icon: <CreditCard />, color: 'purple' },
        { id: 'cash', name: 'Cash on Delivery', icon: <DollarSign />, color: 'green' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Payment Method</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {paymentMethods.map(method => (
                    <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 border-2 rounded-lg transition ${selectedMethod === method.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <div className="text-orange-500">
                                {method.icon}
                            </div>
                            <span className="font-medium text-gray-800">{method.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{order.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">₹{order.pricing?.deliveryFee?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">₹{order.pricing?.tax?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-orange-500">₹{order.pricing?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>

            <div>
                {selectedMethod === 'razorpay' && (
                    <RazorpayPayment order={order} onSuccess={onPaymentSuccess} />
                )}
                {selectedMethod === 'stripe' && (
                    <StripePayment order={order} onSuccess={onPaymentSuccess} />
                )}
                {selectedMethod === 'cash' && (
                    <button
                        onClick={onPaymentSuccess}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                    >
                        <DollarSign size={20} />
                        <span>Confirm Cash on Delivery</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentSelector;
