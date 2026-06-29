const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (file.fieldname === 'photo') {
            cb(null, 'uploads/photo');
        }

        else if (file.fieldname === 'identityProof') {
            cb(null, 'uploads/identity');
        }
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {

    const allowed = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf'
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPG, PNG and PDF allowed'));
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'identityProof', maxCount: 1 }
]);