const multer =
    require('multer');

const {
    CloudinaryStorage
} = require(
    'multer-storage-cloudinary'
);

const cloudinary =
    require('../config/cloudinary');

const storage =
    new CloudinaryStorage({

        cloudinary,

        params:
            async (req, file) => {

                if (
                    file.fieldname === 'photo'
                ) {

                    return {

                        folder: 'vms/photo',

                        resource_type: 'image',

                        type: 'upload', // PUBLIC

                        public_id:
                            Date.now() +
                            '-' +
                            Math.round(
                                Math.random() * 1E9
                            )
                    };
                }

                return {

                    folder: 'vms/identity',

                    resource_type:

                        file.mimetype ===
                        'application/pdf'

                        ? 'raw'
                        : 'image',

                    type: 'private',

                    public_id:
                        Date.now() +
                        '-' +
                        Math.round(
                            Math.random() * 1E9
                        )
                };
            }
    });

const fileFilter =
    (req, file, cb) => {

        const allowed = [

            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf'
        ];

        if (
            allowed.includes(
                file.mimetype
            )
        ) {

            cb(null, true);
        }

        else {

            cb(
                new Error(
                    'Only JPG, PNG and PDF allowed'
                )
            );
        }
    };

module.exports = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            5 * 1024 * 1024
    }

}).fields([

    {
        name: 'photo',
        maxCount: 1
    },

    {
        name: 'identityProof',
        maxCount: 1
    }
]);