const router = require('express').Router();

const validateSession =
    require('../middlewares/validateSession');

const {
    getVisitors,
    approveVisitor,
    rejectVisitor
} = require('../controllers/adminVisitorController');

router.get(
    '/visitors',
    validateSession,
    getVisitors
);

router.post(
    '/approve/:id',
    validateSession,
    approveVisitor
);

router.post(
    '/reject/:id',
    validateSession,
    rejectVisitor
);

module.exports = router;