const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {

    /**
     *
     * @param {Object} user
     * @param {String} url
     * @param {Object} data
     * @returns {nm$_email.Email}
     */
    constructor(user, url, data) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Nature Tours <${process.env.MAIL_FROM_ADDRESS}>`;
        this.data = data;
    }

    /**
     * @returns {Module.exports.createTransport.mailer}
     */
    newTransport() {

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
     * @returns {void}
     */
    async send(template, subject) {

        //Render HTML template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
                {
                    firstName: this.firstName,
                    url: this.url,
                    subject: subject,
                    data: this.data
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

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Nature Tours!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Reset Your Password');
    }

    async sendBookingConfirmation() {
        await this.send('booking', 'Your Booking Confirmation');
    }
};