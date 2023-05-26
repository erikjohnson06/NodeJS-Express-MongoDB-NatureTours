const nodemailer = require('nodemailer');

const sendEmail = async options => {

    //Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
    });

    //Define email options
    const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    //Send
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;