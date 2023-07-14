import { mailSender } from "../config/email-config.js"

export async function sendEmail(mailTo, mailSubject, mailText) {
    try {
        const mailFrom = 'studylonia@gmail.com'
        const response = await mailSender.sendMail({
            from: mailFrom,
            to: mailTo,
            subject: mailSubject,
            text: mailText
        });
        return response;
    } catch (error) {
        console.log("Could not send mail", error);
    }
}

