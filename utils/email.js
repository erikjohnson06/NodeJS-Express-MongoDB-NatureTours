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
     * @param {String} template
     * @param {String} subject
     * @param {mixed} data
     * @returns {void}
     */
    async send(template, subject, data) {

        //Render HTML template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject: subject,
                data : data
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

    async sendBookingConfirmation(data){
        await this.send('booking', 'Your Booking Confirmation', data);
    }
};