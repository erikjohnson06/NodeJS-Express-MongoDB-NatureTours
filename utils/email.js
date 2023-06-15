const nodemailer = require('nodemailer');

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Nature Tours <${process.env.MAIL_FROM_ADDRESS}>`;
    }

    /**
     *
     * @returns {Module.exports.createTransport.mailer|EmailconstructorcreateTransportsend.createTransport.mailer|Function.createTransport.mailer}
     */
    createTransport(){

        if (process.env.NODE_ENV === 'production'){
            //Sendgrid transporter
        }

        return nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD
            }
        });
    }

    /**
     *
     * @param {type} template
     * @param {type} subject
     * @returns {undefined}
     */
    send(template, subject){

        //Render HTML template

        //Define email options
        const mailOptions = {
            from: `${process.env.MAIL_FROM_ADDRESS}`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        //Create transport and send email

    }

    sendWelcome(){
        this.send('welcome', 'Welcome to Nature Tours!');
    }

    sendPasswordReset(){
        this.send();
    }
};

const sendEmail = async (options) => {

    //Create transporter
//    const transporter = nodemailer.createTransport({
//        host: process.env.MAIL_HOST,
//        port: process.env.MAIL_PORT,
//        auth: {
//          user: process.env.MAIL_USERNAME,
//          pass: process.env.MAIL_PASSWORD
//        }
//    });

//    //Define email options
//    const mailOptions = {
//        from: process.env.MAIL_FROM_ADDRESS,
//        to: options.email,
//        subject: options.subject,
//        text: options.message
//    };

    //Send
    await transporter.sendMail(mailOptions);
};

//module.exports = sendEmail;