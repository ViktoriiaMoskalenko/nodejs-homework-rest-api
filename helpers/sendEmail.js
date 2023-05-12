require("dotenv").config();
const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

transport
  .sendMail({
    to: "vika01mos@gmail.com",
    from: "vika01mos@gmail.com",
    subject: "Hello",
    text: "Vika",
    html: "<strong>Moskalenko</strong>",
  })
  .then((res) => console.log(res))
  .catch((error) => console.error(error));
