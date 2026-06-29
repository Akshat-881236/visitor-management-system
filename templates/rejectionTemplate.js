const emailLayout = require('./emailLayout');

module.exports = ({
    visitorName,
    reason
}) => {

return emailLayout({

title:'Visitor Request Rejected',

accentColor:'#DC2626',

heading:'Visitor Request Update',

body:`

<p style="font-size:16px;color:#334155;">
Dear <strong>${visitorName}</strong>,
</p>

<p style="color:#334155;">
We regret to inform you that your visitor request could not be approved.
</p>

<div style="
    background:#FEF2F2;
    border-left:6px solid #DC2626;
    padding:25px;
    border-radius:10px;
    margin:30px 0;
">

<p>
<strong>Reason:</strong>
</p>

<p>${reason || 'Administrative decision.'}</p>

</div>

<p>You can send Request again ( prefer after few days ) by using <a href="https://visitor-management-system-ilux.onrender.com/Visitor/index.html"
style="
background:#F59E0B;
color:#ffffff;
padding:14px 28px;
text-decoration:none;
border-radius:8px;
font-weight:bold;
">
 Visitor Request Portal
</a>

<p style="color:#64748B;">
For further assistance, please contact the administrator.
</p>
`
});
};
