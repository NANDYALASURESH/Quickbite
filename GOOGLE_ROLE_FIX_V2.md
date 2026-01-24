# Google OAuth Role Selection Fix - Part 2

## Issue
New users logging in with Google were being automatically registered as "user" role without being shown the role selection modal.

## Root Cause
The backend was defaulting to 'user' role when no role was provided:
```javascript
// Old code - defaulted to 'user'
const userRole = role && ['user', 'owner', 'delivery'].includes(role) ? role : 'user';
```

## Solution

### Backend Changes (`auth.routes.js`)
Now **requires** role selection for new users:

```javascript
if (user) {
  // Existing user - login directly
  // ... update Google info
} else {
  // New user - REQUIRE role selection
  if (!role || !['user', 'owner', 'delivery'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role selection required for new users',
      requiresRole: true  // Flag for frontend
    });
  }
  
  // Create user with selected role
  user = await User.create({
    name,
    email,
    googleId,
    role: role,  // Use provided role, no default
    // ...
  });
}
```

### Frontend Changes (`Login.jsx`)
Updated to check for `requiresRole` flag:

```javascript
if (data.success) {
  // Existing user - login directly
  localStorage.setItem('token', data.token);
  window.location.reload();
} else if (data.requiresRole || data.message.includes('Role selection required')) {
  // New user - show role selection modal
  setPendingCredential(credentialResponse.credential);
  setShowRoleModal(true);
}
```

## Flow Now

### For Existing Users:
1. Click "Sign in with Google"
2. Backend finds user by email/googleId
3. ✅ Login directly (no role modal)

### For New Users:
1. Click "Sign in with Google"
2. Backend doesn't find user
3. Backend returns `requiresRole: true`
4. ✅ Frontend shows role selection modal
5. User selects role (Customer/Owner/Delivery)
6. Backend creates user with selected role
7. ✅ Login complete

## Testing

### Test New User:
1. Use a Google account that hasn't registered before
2. Click "Sign in with Google"
3. ✅ Should see role selection modal
4. Select a role
5. ✅ Should complete registration

### Test Existing User:
1. Use a Google account that's already registered
2. Click "Sign in with Google"
3. ✅ Should login directly (no modal)

## Files Modified
- `backend/routes/auth.routes.js` - Added role requirement check
- `frontend/src/pages/auth/Login.jsx` - Updated to check requiresRole flag
