// middlewares/validateSecuritySession.js

module.exports = (req, res, next) => {

    try {

        // ========================================
        // GET SESSION ID
        // ========================================

        const sessionId =

            req.query.session_id ||

            req.headers['x-session-id'] ||

            req.params.session_id ||

            req.body.session_id;


        // ========================================
        // SESSION MISSING
        // ========================================

        if (!sessionId) {

            return res.status(401).json({

                success: false,

                title: 'Authentication Required',

                message:
                    'Security session is missing. Please login again.',

                code: 'SESSION_MISSING'
            });
        }


        // ========================================
        // CHECK GLOBAL SESSION STORE
        // ========================================

        const sessions =
            Object.values(
                global.securitySessions || {}
            );


        const session =
            sessions.find(

                s => s.session_id === sessionId
            );


        // ========================================
        // INVALID SESSION
        // ========================================

        if (!session) {

            return res.status(401).json({

                success: false,

                title: 'Invalid Session',

                message:
                    'Your session is invalid or expired. Please login again.',

                code: 'INVALID_SESSION'
            });
        }


        // ========================================
        // OPTIONAL SESSION EXPIRY CHECK
        // 8 HOURS MAX SESSION
        // ========================================

        const loginTime =
            new Date(session.login_time);

        const now =
            new Date();

        const diffHours =
            (now - loginTime) /
            (1000 * 60 * 60);

        if (diffHours > 8) {

            delete global.securitySessions[
                session.emp_id
            ];

            return res.status(401).json({

                success: false,

                title: 'Session Expired',

                message:
                    'Your session has expired. Please login again.',

                code: 'SESSION_EXPIRED'
            });
        }


        // ========================================
        // ATTACH SECURITY DETAILS
        // ========================================

        req.security = {

            emp_id:
                session.emp_id,

            emp_name:
                session.emp_name,

            email:
                session.email,

            session_id:
                session.session_id
        };


        next();

    } catch (error) {

        console.error(
            'Security Session Validation Error:',
            error
        );

        return res.status(500).json({

            success: false,

            title: 'Server Error',

            message:
                'Unable to validate security session.',

            code: 'SESSION_VALIDATION_ERROR'
        });
    }
};