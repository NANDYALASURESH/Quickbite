import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { Mail, Lock, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Clock, ArrowLeft, ShieldCheck } from 'lucide-react';

const ForgotPassword = ({ isOpen, onClose }) => {
    const { API_URL } = useAuth();
    // Steps: 1 = email, 2 = OTP, 3 = new password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600);
    const inputRefs = useRef([]);

    // Countdown timer for OTP step
    useEffect(() => {
        if (step !== 2 || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [step, timeLeft]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setEmail('');
            setOtp(['', '', '', '', '', '']);
            setPassword('');
            setConfirmPassword('');
            setResetToken('');
            setLoading(false);
            setResending(false);
            setMessage('');
            setError('');
            setSuccess(false);
            setTimeLeft(600);
        }
    }, [isOpen]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setStep(2);
                setTimeLeft(600);
                setMessage('');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // OTP input handlers
    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (index === 5 && value) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 6) {
                handleVerifyOTP(fullOtp);
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        while (newOtp.length < 6) newOtp.push('');
        setOtp(newOtp);

        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();

        if (pastedData.length === 6) {
            handleVerifyOTP(pastedData);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (otpCode = null) => {
        const fullOtp = otpCode || otp.join('');

        if (fullOtp.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: fullOtp })
            });

            const data = await response.json();

            if (data.success) {
                setResetToken(data.resetToken);
                setStep(3);
                setMessage('');
            } else {
                setError(data.message);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setResending(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/auth/resend-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setMessage('New OTP sent to your email!');
                setTimeLeft(600);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, password })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setMessage('Password reset successful!');
                setTimeout(() => {
                    onClose();
                }, 2500);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (success) return 'Password Reset';
        switch (step) {
            case 1: return 'Forgot Password';
            case 2: return 'Verify OTP';
            case 3: return 'New Password';
            default: return 'Forgot Password';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="max-w-md">
            <div className="space-y-4">

                {/* Success State */}
                {success && (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Password Reset Successful!</h3>
                        <p className="text-gray-600 text-sm">You can now login with your new password.</p>
                    </div>
                )}

                {/* Step 1: Enter Email */}
                {!success && step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="text-center mb-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Mail className="text-white" size={28} />
                            </div>
                            <p className="text-gray-600 text-sm">
                                Enter your email address and we'll send you a 6-digit OTP to reset your password.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {!success && step === 2 && (
                    <div className="space-y-4">
                        <div className="text-center mb-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ShieldCheck className="text-white" size={28} />
                            </div>
                            <p className="text-gray-600 text-sm">
                                We've sent a 6-digit code to<br />
                                <span className="font-semibold text-gray-800">{email}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 px-4 py-3">
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 px-4 py-3">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-green-700">{message}</p>
                            </div>
                        )}

                        {/* OTP Input */}
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={index === 0 ? handleOtpPaste : undefined}
                                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${digit ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                                        } ${error ? 'border-red-400' : ''}`}
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Clock size={16} />
                            <span>
                                {timeLeft > 0 ? (
                                    <>Code expires in <span className="font-semibold text-orange-600">{formatTime(timeLeft)}</span></>
                                ) : (
                                    <span className="text-red-600 font-semibold">Code expired</span>
                                )}
                            </span>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={() => handleVerifyOTP()}
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        {/* Resend & Back */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => { setStep(1); setError(''); setMessage(''); }}
                                className="text-sm text-gray-600 hover:text-orange-500 flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                            <button
                                onClick={handleResendOTP}
                                disabled={resending || timeLeft > 540}
                                className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                                {resending ? 'Sending...' : 'Resend'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: New Password */}
                {!success && step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="text-center mb-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock className="text-white" size={28} />
                            </div>
                            <p className="text-gray-600 text-sm">
                                OTP verified! Enter your new password below.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors p-0 bg-transparent border-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors p-0 bg-transparent border-none cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default ForgotPassword;
