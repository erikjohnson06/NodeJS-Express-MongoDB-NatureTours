const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {

    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Nature Tours <${process.env.MAIL_FROM_ADDRESS}>`;
    }

    /**
     * @returns {Module.exports.createTransport.mailer}
     */
    newTransport(){

        /*
        if (process.env.NODE_ENV === 'production'){
            //Sendgrid transporter
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                }
            });
        }
        */
       
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
     * @param {type} template
     * @param {type} subject
     * @returns {void}
     */
    async send(template, subject) {

        //Render HTML template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject: subject
            }
        );

        //Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText.convert(html)
        };

        //Create transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to Nature Tours!');
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Reset Your Password');
    }
};

//const sendEmail = async (options) => {

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

//    //Send
//    await transporter.sendMail(mailOptions);
//};

//module.exports = sendEmail;