const db = require('../config/db');

const sendEmail =
    require('../services/emailService');

const approvalTemplate =
    require('../templates/approvalTemplate');

const rejectionTemplate =
    require('../templates/rejectionTemplate');

function generatePassId() {

    return Math.floor(
        100000000000 +
        Math.random() * 900000000000
    ).toString();
}

// =====================================
// GET ALL VISITOR REQUESTS
// =====================================

exports.getVisitors = async (req, res) => {

    try {

        const [rows] = await db.execute(
            `
            SELECT *
            FROM visitors
            ORDER BY id DESC
            `
        );

        return res.json({
            success: true,
            visitors: rows
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Unable to fetch visitors'
        });
    }
};


// =====================================
// APPROVE VISITOR
// =====================================

exports.approveVisitor = async (req, res) => {

    try {

        const visitorId = req.params.id;

        const {
            host_employee_name,
            host_department,
            visit_date,
            visit_time
        } = req.body;

        const [rows] = await db.execute(
            `
            SELECT *
            FROM visitors
            WHERE id = ?
            `,
            [visitorId]
        );

        if (!rows.length) {

            return res.status(404).json({
                success: false,
                message: 'Visitor not found'
            });
        }

        const visitor = rows[0];

        const passNumber =
            generatePassId();


        await db.execute(
            `
            INSERT INTO visitor_passes
            (
                visitor_id,
                pass_number,
                host_employee_name,
                host_department,
                visit_date,
                visit_time,
                approved_by
            )

            VALUES
            (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                visitor.id,
                passNumber,
                host_employee_name,
                host_department,
                visit_date,
                visit_time,
                1
            ]
        );

        await db.execute(
            `
            UPDATE visitors
            SET status='APPROVED'
            WHERE id = ?
            `,
            [visitor.id]
        );

        try {

    const approvalHtml =
        approvalTemplate({

            visitorName:
                visitor.full_name,

            passNumber:
                passNumber,

            employeeName:
                host_employee_name,

            department:
                host_department,

            visitDate:
                visit_date,

            visitTime:
                visit_time,

        });

    console.log(
        'Approval Template Generated Successfully'
    );

    const emailResult =
        await sendEmail({

            to: visitor.email,

            subject:
                '✅ Visitor Pass Approved',

            htmlContent:
                approvalHtml,

            textContent:
                `
Visitor Pass Approved

Visitor Name: ${visitor.full_name}

Pass Number: ${passNumber}

Employee Name: ${host_employee_name}

Department: ${host_department}

Visit Date: ${visit_date}

Visit Time: ${visit_time}
`
        });

    console.log(
        'Approval Email Result:',
        emailResult
    );

} catch (emailError) {

    console.error(
        'Approval Email Failed:',
        emailError
    );
}

        return res.json({

            success: true,

            message:
                'Visitor approved successfully'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                'Unable to approve visitor'
        });
    }
};


// =====================================
// REJECT VISITOR
// =====================================

exports.rejectVisitor = async (req, res) => {

    try {

        const visitorId = req.params.id;

        const { reason } = req.body;

        const [rows] = await db.execute(
            `
            SELECT *
            FROM visitors
            WHERE id = ?
            `,
            [visitorId]
        );

        if (!rows.length) {

            return res.status(404).json({

                success: false,

                message: 'Visitor not found'
            });
        }

        const visitor = rows[0];

        await db.execute(
            `
            UPDATE visitors
            SET
                status='REJECTED',
                rejection_reason=?
            WHERE id=?
            `,
            [
                reason,
                visitorId
            ]
        );

        await sendEmail({

            to: visitor.email,

            subject:
                '❌ Visitor Request Rejected',

            htmlContent:
                rejectionTemplate({

                    visitorName:
                        visitor.full_name,

                    reason
                }),

            textContent:
                `Your visitor request has been rejected. Reason: ${reason}`
        });

        return res.json({

            success: true,

            message:
                'Visitor rejected successfully'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                'Unable to reject visitor'
        });
    }
};