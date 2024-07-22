import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const brevo = require('@getbrevo/brevo');

@Injectable()
export class MailerService {
	async sendMail(
		to: string,
		subject: string,
		content: string
	): Promise<boolean> {
		try {
			const apiKey = process.env.BREVO_API_KEY;

			const apiInstance = new brevo.TransactionalEmailsApi();
			apiInstance.setApiKey(0, apiKey);

			const sendSmtpEmail = new brevo.SendSmtpEmail();
			const emailData = {
				sender: { name: 'John', email: 'noreply@pipeitin.fr' },
				to: [{ name: to, email: to }],
				subject: subject,
				htmlContent: content,
			};
			Object.keys(emailData || {}).map(key => {
				sendSmtpEmail[key] = emailData[key];
			});
			await apiInstance.sendTransacEmail(sendSmtpEmail);

			return true;
		} catch (error) {
			console.log('ERROR SENDING EMAIL: ', error);
			return false;
		}
	}
}
