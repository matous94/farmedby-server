const nodemailer = require("nodemailer");

exports.sendEmail = async function sendEmail({
  from = '"FarmedBy" <matous@farmedby.com>',
  receivers,
  subject,
  text,
  html
}) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.forpsi.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }

    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //   user: testAccount.user, // generated ethereal user
    //   pass: testAccount.pass, // generated ethereal password
    // },
  });

  const info = await transporter.sendMail({
    from,
    to: receivers.join(", "),
    subject, // Subject line
    text, // plain text body
    html // html body
  });

  console.log("Email sent: ", JSON.stringify(info, null, 2));

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
