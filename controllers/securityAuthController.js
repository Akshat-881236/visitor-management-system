// controllers/securityAuthController.js

const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const sendEmail =
    require('../services/emailService');

const securityOtpTemplate =
    require('../templates/otpTemplate');

// In-Memory Sessions
global.securitySessions =
    global.securitySessions || {};

// ========================================
// HELPERS
// ========================================

function generateOTP() {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();
}

function generateSessionId() {

    return crypto
        .randomBytes(8)
        .toString('hex');
}

// ========================================
// LOGIN
// ========================================

exports.login = async (req, res) => {

    try {

        const {
            emp_id,
            password
        } = req.body;

        if (
            !emp_id ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Employee ID and Password are required.'
            });
        }

        const [rows] =
            await db.execute(

                `
                SELECT *
                FROM security_staff
                WHERE emp_id = ?
                `,
                [emp_id]
            );

        if (!rows.length) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid Employee ID.'
            });
        }

        const security =
            rows[0];

        const isMatch =
            await bcrypt.compare(
                password,
                security.password
            );

        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    'Incorrect Password.'
            });
        }

        const otp =
            generateOTP();

        const expiry =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        await db.execute(

            `
            UPDATE security_staff

            SET
                otp_code = ?,
                otp_expiry = ?

            WHERE emp_id = ?
            `,
            [
                otp,
                expiry,
                emp_id
            ]
        );

        await sendEmail({

            to: security.email,

            subject:
                '🔐 Security Login OTP',

            htmlContent:
                securityOtpTemplate(otp),

            textContent:
                `Your OTP is ${otp}`
        });

        return res.json({

            success: true,

            message:
                'OTP sent successfully.'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                'Unable to process login.'
        });
    }
};

// ========================================
// VERIFY OTP
// ========================================

exports.verifyOTP =
    async (req, res) => {

        try {

            const {
                emp_id,
                otp
            } = req.body;

            const [rows] =
                await db.execute(

                    `
                    SELECT *
                    FROM security_staff
                    WHERE emp_id = ?
                    `,
                    [emp_id]
                );

            if (!rows.length) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Security Staff not found.'
                });
            }

            const security =
                rows[0];

            if (
                security.otp_code !== otp
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Invalid OTP.'
                });
            }

            if (
                new Date()
                >
                new Date(
                    security.otp_expiry
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'OTP Expired.'
                });
            }

            // Single Session Policy

            delete global
                .securitySessions[
                security.emp_id
            ];

            const sessionId =
                generateSessionId();

            global.securitySessions[
                security.emp_id
            ] = {

                session_id:
                    sessionId,

                emp_id:
                    security.emp_id,

                emp_name:
                    security.emp_name,

                email:
                    security.email,

                login_time:
                    new Date()
            };

            return res.json({

                success: true,

                firstLogin:
                    security.is_first_login,

                session: global
                    .securitySessions[
                    security.emp_id
                ],

                redirect:
                    `/security/dashboard.html?session_id=${sessionId}`
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    'OTP Verification Failed.'
            });
        }
    };

// ========================================
// CHANGE PASSWORD
// ========================================

exports.changePassword =
    async (req, res) => {

        try {

            const {
                emp_id,
                newPassword
            } = req.body;

            if (
                !newPassword ||
                newPassword.length < 8
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Password must contain at least 8 characters.'
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            await db.execute(

                `
                UPDATE security_staff

                SET
                    password = ?,
                    is_first_login = FALSE

                WHERE emp_id = ?
                `,
                [
                    hashedPassword,
                    emp_id
                ]
            );

            return res.json({

                success: true,

                message:
                    'Password changed successfully.'
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    'Unable to change password.'
            });
        }
    };

// ========================================
// VALIDATE SESSION
// ========================================

exports.validateSession =
    async (req, res) => {

        try {

            const {
                session_id
            } = req.params;

            const sessions =
                Object.values(
                    global.securitySessions
                );

            const session =
                sessions.find(
                    s =>
                        s.session_id
                        === session_id
                );

            if (!session) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Invalid Session.'
                });
            }

            return res.json({

                success: true,

                session
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    'Session validation failed.'
            });
        }
    };

// ========================================
// LOGOUT
// ========================================

exports.logout =
    async (req, res) => {

        try {

            const {
                emp_id
            } = req.body;

            delete global
                .securitySessions[
                emp_id
            ];

            return res.json({

                success: true,

                message:
                    'Logout Successful.'
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message:
                    'Logout Failed.'
            });
        }
    };