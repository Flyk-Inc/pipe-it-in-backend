import {
	BadRequestException,
	Body,
	Controller,
	InternalServerErrorException,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { CreateUserDTO } from '../../domain/users/dto/createUserDTO';
import { User } from '../../domain/users/users.entities';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Request() req: SignedInRequest) {
		return this.authService.login(req.user);
	}

	@Post('register')
	async register(@Body() user: CreateUserDTO) {
		let newUser: User;
		try {
			newUser = await this.authService.register(user);
		} catch (e) {
			switch (e.message) {
				case 'User already exists':
					throw new BadRequestException('User with this email already exists');
				default:
					throw new InternalServerErrorException(
						'Error creating user: ' + e.message
					);
			}
		}

		return newUser;
	}
}
