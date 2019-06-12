import { GeneralSetting } from '../database/models';
import logger from '../log/logger';
import nodemailer from 'nodemailer';

export const sendEmail = (to, subject, text, html = null, attachments = []) => {
  GeneralSetting.findAll().then(result => {
    let host = '';
    let port = '';
    let email = '';
    let password = '';

    for (const dt of result) {
      switch (dt.key) {
        case 'hostSender':
          host = dt.value;
          break;
        case 'portSender':
          port = dt.value;
          break;
        case 'emailSender':
          email = dt.value;
          break;
        case 'passwordSender':
          password = dt.value;
          break;
        case 'emailRecipient':
          if (!to) {
            to = dt.value;
          }
          break;
        default:
          break;
      }
    }

    const transporter = nodemailer.createTransport({
      // 'box797.bluehost.com',
      // 465

      host,
      port,
      secure: true,
      auth: {
        user: email,
        pass: password
      }
    });

    // setup email data with unicode symbols
    const mailOptions = {
      // sender address
      from: `"Purwadhika" <${email}>`,

      // 'hasbifadillah@outlook.com', // list of receivers
      to,

      // 'Hello ✔', // Subject line
      subject,

      // plain text body
      text: text || '',

      // html body
      html: html || '',

      attachments
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(error.message);

        return false;
      }

      return true;

      // console.log('Message sent: %s', info.messageId);
      // // Preview only available when sending through an Ethereal account
      // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });
};
