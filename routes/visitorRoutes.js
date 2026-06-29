const router = require('express').Router();

const uploadVisitorFiles =
    require('../middlewares/uploadVisitorFiles');

const {
    createVisitorRequest
} = require('../controllers/visitorController');

router.post(
    '/request',
    uploadVisitorFiles,
    createVisitorRequest
);

module.exports = router;