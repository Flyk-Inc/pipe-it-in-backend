import {
	BadRequestException,
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Post,
	Query,
	Request,
	Res,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { CreateUserDTO } from '../../domain/users/dto/createUserDTO';
import { User } from '../../domain/users/users.entities';
import { EmailConfirmationService } from '../../email-confirmation-service/email-confirmation.service';
import * as process from 'node:process';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private emailConfirmationService: EmailConfirmationService
	) {}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Request() req: SignedInRequest) {
		return this.authService.login(req.user);
	}

	@Post('register')
	async register(@Body() user: CreateUserDTO) {
		let newUser: User | null;
		try {
			newUser = await this.authService.register(user);
			await this.emailConfirmationService.sendVerificationLink(user.email);
		} catch (e) {
			switch (e.message) {
				case 'User already exists':
					throw new BadRequestException('user.email.already.exists');
				default:
					throw new InternalServerErrorException(
						'Error creating user: ' + e.message
					);
			}
		}

		return newUser;
	}

	@Get('confirm')
	async confirm(@Query('token') token: string, @Res() res: any) {
		const email =
			await this.emailConfirmationService.decodeConfirmationToken(token);
		await this.emailConfirmationService.confirmEmail(email);
		res.redirect(process.env.FRONTEND_URL + '/auth/login?emailConfirmed=true');
	}
}
