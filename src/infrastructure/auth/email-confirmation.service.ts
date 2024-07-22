import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../messaging/mailer.service';
import { UsersService } from '../../domain/users/service/users.service';

export interface VerificationTokenPayload {
	email: string;
}

@Injectable()
export class EmailConfirmationService {
	constructor(
		private jwtService: JwtService,
		private mailerService: MailerService,
		private userService: UsersService
	) {}
	public async confirmEmail(email: string) {
		const user = await this.userService.getUserByEmail(email);
		if (user.isActive) {
			throw new BadRequestException('Email already confirmed');
		}
		await this.userService.markEmailAsConfirmed(email);
	}

	public async decodeConfirmationToken(token: string) {
		try {
			const payload = await this.jwtService.verify(token, {
				secret: process.env.JWT_SECRET,
			});

			if (typeof payload === 'object' && 'email' in payload) {
				return payload.email;
			}
			throw new BadRequestException();
		} catch (error) {
			if (error?.name === 'TokenExpiredError') {
				throw new BadRequestException('Email confirmation token expired');
			}
			throw new BadRequestException('Bad confirmation token');
		}
	}

	public sendVerificationLink(email: string) {
		const payload: VerificationTokenPayload = { email };
		const token = this.jwtService.sign(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		const url = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

		const text = emailConfirmationTemplate.replace(
			'{emailConfirmationLink}',
			url
		);

		return this.mailerService.sendMail(email, 'Email confirmation', text);
	}
}

export const emailConfirmationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>pipeitin.fr</title>
    <style>
        :root {
            --primary: #f1895c;
            --primary-accent: #dd6e7b;
            --secondary: #516079;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: var(--secondary);
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: var(--primary);
        }
        p {
            color: var(--secondary);
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: var(--primary);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: var(--primary-accent);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to pipeitin.fr</h1>
        <p>To confirm the email address, click the button below:</p>
        <a href="{emailConfirmationLink}" class="button">Confirm Email</a>
    </div>
</body>
</html>
`;
