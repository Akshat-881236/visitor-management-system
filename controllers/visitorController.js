// controllers/visitorController.js

const db = require('../config/db');

const sendEmail =
    require('../services/emailService');

const newRequestTemplate =
    require('../templates/newRequestTemplate');

exports.createVisitorRequest = async (req, res) => {

    try {

        const {
            full_name,
            identity_type,
            identity_number,
            email,
            contact_number,
            purpose
        } = req.body;

        // =====================================
        // VALIDATION
        // =====================================

        if (
            !full_name ||
            !identity_type ||
            !identity_number ||
            !email ||
            !contact_number ||
            !purpose
        ) {

            showAlert(
                'Validation Error',
                'Please fill all required fields.'
            );

            return;
        }

        // =====================================
        // FILES
        // =====================================

        const photo =
            req.files?.photo?.[0]?.path || null;

        const identityProof =
            req.files?.identityProof?.[0]?.path || null;

        if (!photo || !identityProof || !purpose) {

            return res.status(400).json({
                success: false,
                message:
                    'Visitor photo and identity proof are required.'
            });
        }

        // =====================================
        // VISITOR ID
        // =====================================

        const visitorId =
            `VIS-${Date.now()}`;

        // =====================================
        // SAVE TO DATABASE
        // =====================================

        const [result] = await db.execute(
            `
            INSERT INTO visitors
            (
                visitor_id,
                full_name,
                identity_type,
                identity_number,
                email,
                contact_number,
                purpose,
                photo_path,
                identity_proof_path
            )

            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                visitorId,
                full_name,
                identity_type,
                identity_number,
                email,
                contact_number,
                purpose,
                photo,
                identityProof
            ]
        );

        console.log(
            `Visitor Request Saved : ${visitorId}`
        );

        // =====================================
        // SEND EMAIL TO ADMIN
        // =====================================

        try {

            const htmlTemplate =
                newRequestTemplate({
                    visitorId,
                    full_name,
                    email,
                    contact_number,
                    purpose,
                    identity_type,
                    identity_number
                });

            const emailResult =
                await sendEmail({

                    to: process.env.ADMIN_EMAIL,

                    subject:
                        '🔔 New Visitor Request Received',

                    htmlContent: htmlTemplate,

                    // Brevo fallback
                    textContent: `
New Visitor Request Received

Visitor ID : ${visitorId}

Name : ${full_name}

Email : ${email}

Contact : ${contact_number}

Purpose of Visit : ${purpose}

Identity Type : ${identity_type}

Identity Number : ${identity_number}

Please login to the VMS Admin Portal to review this request.

Visitor Management System
`
                });

            if (emailResult.success) {

                console.log(
                    `Admin notification email sent for ${visitorId}`
                );

            } else {

                console.error(
                    `Failed to send admin email for ${visitorId}`
                );
            }

        } catch (emailError) {

            console.error(
                'Email Error:',
                emailError.message || emailError
            );
        }

        // =====================================
        // SUCCESS RESPONSE
        // =====================================

        return res.status(201).json({

            success: true,

            message:
                'Visitor request submitted successfully. Please wait for administrator approval.',

            visitorId
        });

    } catch (error) {

        console.error(
            'Visitor Controller Error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Unable to submit visitor request.'
        });
    }
};