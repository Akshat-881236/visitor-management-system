// controllers/adminAuthController.js

const crypto = require('crypto');

const sendEmail =
    require('../services/emailService');

const otpTemplate =
    require('../templates/otpTemplate');

// Only one administrator session allowed

global.activeAdminSession =
    global.activeAdminSession || null;

// ============================================
// TEMPORARY IN-MEMORY STORAGE
// ============================================

let currentOTP = null;

let otpExpiry = null;

let activeSession = null;

// ============================================
// GENERATE OTP
// ============================================

function generateOTP() {

    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
}

// ============================================
// GENERATE SESSION ID
// ============================================

function generateSessionId() {

    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let sessionId = '';

    for (let i = 0; i < 16; i++) {

        sessionId += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return sessionId;
}

// ============================================
// LOGIN
// ============================================

exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        // Validate credentials

        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {

            return res.status(401).json({

                success: false,

                title: 'Login Failed',

                message:
                    'Invalid administrator email or password.',

                learnMore:
                    '/docs/admin-login-help.html'
            });
        }

        // Generate OTP

        currentOTP = generateOTP();

        otpExpiry =
            Date.now() +
            (
                Number(
                    process.env.OTP_EXPIRY_MINUTES
                ) || 10
            ) * 60 * 1000;

        // Send OTP Email

        const emailResult =
            await sendEmail({

                to: process.env.ADMIN_EMAIL,

                subject:
                    '🔐 Administrator Login OTP',

                htmlContent:
                    otpTemplate(currentOTP),

                textContent:
                    `Your Administrator Login OTP is ${currentOTP}`
            });

        if (!emailResult.success) {

            return res.status(500).json({

                success: false,

                title: 'OTP Failed',

                message:
                    'Unable to send OTP email.',

                learnMore:
                    '/docs/otp-troubleshooting.html'
            });
        }

        return res.json({

            success: true,

            title: 'OTP Sent',

            message:
                'A verification OTP has been sent to your administrator email.',

            learnMore:
                '/docs/otp-verification.html'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            title: 'Server Error',

            message:
                'Something went wrong.',

            learnMore:
                '/docs/server-errors.html'
        });
    }
};

// ============================================
// GLOBAL ACTIVE SESSION
// ============================================

global.activeAdminSession =
    global.activeAdminSession || null;


// ============================================
// VERIFY OTP
// ============================================

exports.verifyOTP = async (req, res) => {

    try {

        const { otp } = req.body;

        // No OTP Generated

        if (!currentOTP) {

            return res.status(400).json({

                success: false,

                title: 'OTP Missing',

                message:
                    'Please login again.',

                learnMore:
                    '/docs/otp-verification.html'
            });
        }

        // OTP Expired

        if (Date.now() > otpExpiry) {

            currentOTP = null;
            otpExpiry = null;

            return res.status(400).json({

                success: false,

                title: 'OTP Expired',

                message:
                    'The OTP has expired. Please login again.',

                learnMore:
                    '/docs/otp-verification.html'
            });
        }

        // Invalid OTP

        if (otp !== currentOTP) {

            return res.status(400).json({

                success: false,

                title: 'Invalid OTP',

                message:
                    'The entered OTP is incorrect.',

                learnMore:
                    '/docs/otp-verification.html'
            });
        }

        // =====================================
        // DELETE OLD SESSION
        // =====================================

        global.activeAdminSession = null;

        // =====================================
        // CREATE NEW SESSION
        // =====================================

        global.activeAdminSession = {

            session_id:
                generateSessionId(),

            admin_name:
                process.env.ADMIN_NAME,

            admin_email:
                process.env.ADMIN_EMAIL,

            login_time:
                new Date(),

            expires_at:
                new Date(
                    Date.now() +
                    (8 * 60 * 60 * 1000)
                ) // 8 Hours
        };

        // =====================================
        // CLEAR OTP
        // =====================================

        currentOTP = null;
        otpExpiry = null;

        return res.status(200).json({

            success: true,

            title: 'Login Successful',

            message:
                'Administrator authenticated successfully.',

            session:
                global.activeAdminSession,

            redirect:
                `/Admins/dashboard.html?session_id=${global.activeAdminSession.session_id}`,

            learnMore:
                '/docs/dashboard-access.html'
        });

    } catch (error) {

        console.error(
            'OTP Verification Error:',
            error
        );

        return res.status(500).json({

            success: false,

            title: 'Server Error',

            message:
                'Unable to verify OTP.',

            learnMore:
                '/docs/server-errors.html'
        });
    }
};


// ============================================
// VALIDATE SESSION
// ============================================

exports.validateSession = async (req, res) => {

    try {

        const { session_id } = req.params;

        // No Session

        if (!global.activeAdminSession) {

            return res.status(401).json({

                success: false,

                title: 'Session Expired',

                message:
                    'Please login again.',

                learnMore:
                    '/docs/session-expired.html'
            });
        }

        // Invalid Session

        if (
            global.activeAdminSession.session_id
            !== session_id
        ) {

            return res.status(401).json({

                success: false,

                title: 'Invalid Session',

                message:
                    'The supplied session is invalid.',

                learnMore:
                    '/docs/session-expired.html'
            });
        }

        // Session Expired

        if (
            new Date() >
            new Date(
                global.activeAdminSession.expires_at
            )
        ) {

            global.activeAdminSession = null;

            return res.status(401).json({

                success: false,

                title: 'Session Expired',

                message:
                    'Your session has expired. Please login again.',

                learnMore:
                    '/docs/session-expired.html'
            });
        }

        return res.status(200).json({

            success: true,

            title: 'Session Valid',

            session:
                global.activeAdminSession
        });

    } catch (error) {

        console.error(
            'Session Validation Error:',
            error
        );

        return res.status(500).json({

            success: false,

            title: 'Server Error',

            message:
                'Session validation failed.',

            learnMore:
                '/docs/server-errors.html'
        });
    }
};


// ============================================
// LOGOUT
// ============================================

exports.logout = async (req, res) => {

    try {

        global.activeAdminSession = null;

        return res.status(200).json({

            success: true,

            title: 'Logged Out',

            message:
                'Administrator logged out successfully.',

            learnMore:
                '/docs/session-expired.html'
        });

    } catch (error) {

        console.error(
            'Logout Error:',
            error
        );

        return res.status(500).json({

            success: false,

            title: 'Server Error',

            message:
                'Unable to logout.',

            learnMore:
                '/docs/server-errors.html'
        });
    }
};