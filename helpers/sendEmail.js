require("dotenv").config();
const nodemailer = require("nodemailer");

function transporter(name, host, verificationToken) {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  transport.sendMail(
    {
      from: "vika01mos@gmail.com",
      to: "vika01mos@gmail.com",
      subject: "Verify your email address",
      html: `
        <p>Hello, ${name}!</p>
        <p>Please follow this link to verify your email address:</p>
        <p><a href="http://${host}/api/users/verify/${verificationToken}">Verify your email address</a></p>
      `,
    },
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    }
  );
}

module.exports = {
  transporter,
};
