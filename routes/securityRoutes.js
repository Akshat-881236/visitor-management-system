// routes/securityRoutes.js

const router = require('express').Router();

const validateSecuritySession =
    require(
        '../middlewares/validateSecuritySession'
    );

const {

    getVisitorDetails,
    checkInVisitor,
    checkOutVisitor,
    getTodayLogs

} = require(
    '../controllers/securityController'
);


// =====================================
// FETCH VISITOR DETAILS
// =====================================

router.get(
    '/visitor/:passId',
    validateSecuritySession,
    getVisitorDetails
);


// =====================================
// CHECK IN VISITOR
// =====================================

router.post(
    '/check-in/:passId',
    validateSecuritySession,
    checkInVisitor
);


// =====================================
// CHECK OUT VISITOR
// =====================================

router.post(
    '/check-out/:passId',
    validateSecuritySession,
    checkOutVisitor
);


// =====================================
// TODAY VISIT LOGS
// =====================================

router.get(
    '/logs',
    validateSecuritySession,
    getTodayLogs
);


module.exports = router;