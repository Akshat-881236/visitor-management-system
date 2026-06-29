// routes/securityAuthRoutes.js

const router = require('express').Router();

const {

    login,
    verifyOTP,
    changePassword,
    validateSession,
    logout

} = require(
    '../controllers/securityAuthController'
);


// ========================================
// AUTHENTICATION ROUTES
// ========================================

// Login with Emp_ID + Password
router.post(
    '/login',
    login
);


// Verify Email OTP
router.post(
    '/verify-otp',
    verifyOTP
);


// Force Password Change
router.post(
    '/change-password',
    changePassword
);


// Validate Session
router.get(
    '/validate-session/:session_id',
    validateSession
);


// Logout
router.post(
    '/logout',
    logout
);


module.exports = router;