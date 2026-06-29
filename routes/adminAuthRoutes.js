const router = require('express').Router();

const {

    login,
    verifyOTP,
    validateSession,
    logout

} = require('../controllers/adminAuthController');

router.post('/login', login);

router.post('/verify-otp', verifyOTP);

router.get(
    '/validate-session/:session_id',
    validateSession
);

router.post('/logout', logout);

module.exports = router;