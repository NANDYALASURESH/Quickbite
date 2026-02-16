// routes/auth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send OTP for email verification
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Validate role - prevent direct admin registration
    let userRole = 'user';
    if (role && ['user', 'owner', 'delivery'].includes(role)) {
      userRole = role;
    }

    // Create user (emailVerified defaults to false)
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone,
      address
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      const { sendOTPEmail } = require('../services/emailService');
      await sendOTPEmail(user.email, otp, user.name);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for OTP verification code.',
        email: user.email,
        requiresVerification: true
      });

    } catch (emailError) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if email is verified (skip for Google OAuth users)
    if (!user.emailVerified && user.password) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP code.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        loyaltyPoints: user.loyaltyPoints
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth login
 * @access  Public
 */
router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Existing user - update googleId and profile picture if not set
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
      }
      await user.save();

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }
    } else {
      // New user - require role selection
      if (!role || !['user', 'owner', 'delivery'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role selection required for new users',
          requiresRole: true
        });
      }

      // Create new user with selected role
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture || null,
        emailVerified: true, // Google accounts are pre-verified
        role: role,
        isActive: true
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        loyaltyPoints: user.loyaltyPoints,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        hasGoogleLinked: !!user.googleId
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/update-profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address, preferences } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (preferences) updateFields.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/link-google
 * @desc    Link Google account to existing user
 * @access  Private
 */
router.post('/link-google', authenticate, async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const { sub: googleId, email, picture } = payload;

    // Check if email matches current user
    if (email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email does not match your account email'
      });
    }

    // Check if this Google account is already linked to another user
    const existingUser = await User.findOne({ googleId, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This Google account is already linked to another user'
      });
    }

    // Update user with Google ID and profile picture
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        googleId,
        profilePicture: picture || req.user.profilePicture,
        emailVerified: true
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Google account linked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        hasGoogleLinked: !!user.googleId
      }
    });

  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link Google account',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/unlink-google
 * @desc    Unlink Google account from user
 * @access  Private
 */
router.post('/unlink-google', authenticate, async (req, res) => {
  try {
    // Get user with password to check if they have one
    const user = await User.findById(req.user._id).select('+password');

    if (!user.googleId) {
      return res.status(400).json({
        success: false,
        message: 'No Google account is linked to this user'
      });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unlink Google account. Please add a password first to ensure you can still login.'
      });
    }

    // Unlink Google account
    user.googleId = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google account unlinked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasGoogleLinked: false
      }
    });

  } catch (error) {
    console.error('Unlink Google account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink Google account',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/add-password
 * @desc    Add password to Google-only account
 * @access  Private
 */
router.post('/add-password', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account already has a password. Use change-password endpoint instead.'
      });
    }

    // Set password (will be hashed by pre-save hook)
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password added successfully. You can now login with email and password.'
    });

  } catch (error) {
    console.error('Add password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add password',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset OTP to email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Always return success message (don't reveal if email exists for security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset OTP has been sent.'
      });
    }

    // Check if user has a password (Google-only users need to add password first)
    const userWithPassword = await User.findById(user._id).select('+password');
    if (!userWithPassword.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in only. Please use "Add Password" feature first.'
      });
    }

    // Generate password reset OTP
    const otp = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
      // Send OTP email
      const { sendPasswordResetOTPEmail } = require('../services/emailService');
      await sendPasswordResetOTPEmail(user.email, otp, user.name);

      res.status(200).json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });

    } catch (emailError) {
      // If email fails, clear OTP
      user.passwordResetOTP = undefined;
      user.passwordResetOTPExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify password reset OTP and return a temp reset token
 * @access  Public
 */
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with password reset OTP fields
    const user = await User.findOne({ email }).select('+passwordResetOTP +passwordResetOTPExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP exists
    if (!user.passwordResetOTP || !user.passwordResetOTPExpire) {
      return res.status(400).json({
        success: false,
        message: 'No password reset OTP found. Please request a new one.'
      });
    }

    // Check if OTP expired
    if (Date.now() > user.passwordResetOTPExpire) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
        expired: true
      });
    }

    // Verify OTP
    if (user.passwordResetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is valid — generate a short-lived reset token (5 min)
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Clear the OTP fields
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
    });

  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/resend-reset-otp
 * @desc    Resend password reset OTP
 * @access  Public
 */
router.post('/resend-reset-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a new OTP has been sent.'
      });
    }

    // Generate new OTP
    const otp = user.generatePasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
      const { sendPasswordResetOTPEmail } = require('../services/emailService');
      await sendPasswordResetOTPEmail(user.email, otp, user.name);

      res.status(200).json({
        success: true,
        message: 'New password reset OTP sent to your email'
      });

    } catch (emailError) {
      user.passwordResetOTP = undefined;
      user.passwordResetOTPExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Resend reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using temp reset token from OTP verification
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Verify the temp reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please start the password reset process again.'
      });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Find user and set new password
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and activate user account
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email }).select('+emailVerificationOTP +otpExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Check if OTP exists
    if (!user.emailVerificationOTP || !user.otpExpire) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP expired
    if (Date.now() > user.otpExpire) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
        expired: true
      });
    }

    // Verify OTP
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Mark email as verified and clear OTP fields
    user.emailVerified = true;
    user.emailVerificationOTP = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for email verification
 * @access  Public
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      const { sendOTPEmail } = require('../services/emailService');
      await sendOTPEmail(user.email, otp, user.name);

      res.status(200).json({
        success: true,
        message: 'New OTP sent to your email'
      });

    } catch (emailError) {
      // Clear OTP if email fails
      user.emailVerificationOTP = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

module.exports = router;