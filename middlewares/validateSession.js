// middlewares/validateSession.js

module.exports = (req, res, next) => {

    try {

        // Session from Query Parameter

        const sessionId =
            req.query.session_id ||
            req.headers['x-session-id'];

        // No Session

        if (!sessionId) {

            return res.status(401).json({

                success: false,

                title: 'Authentication Required',

                message:
                    'Administrator session is missing.',

                learnMore:
                    '/docs/authentication.html'
            });
        }

        // Controller stores active session globally

        if (
            !global.activeAdminSession
        ) {

            return res.status(401).json({

                success: false,

                title: 'Session Expired',

                message:
                    'Please login again.',

                learnMore:
                    '/docs/session-expired.html'
            });
        }

        // Session Mismatch

        if (
            global.activeAdminSession.session_id
            !== sessionId
        ) {

            return res.status(401).json({

                success: false,

                title: 'Invalid Session',

                message:
                    'The supplied session is invalid.',

                learnMore:
                    '/docs/session-validation.html'
            });
        }

        // Attach Session

        req.admin =
            global.activeAdminSession;

        next();

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            title: 'Server Error',

            message:
                'Unable to validate session.',

            learnMore:
                '/docs/server-errors.html'
        });
    }
};