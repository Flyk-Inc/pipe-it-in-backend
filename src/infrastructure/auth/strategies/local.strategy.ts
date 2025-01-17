import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RequestUser } from '../request-user.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({
			usernameField: 'email',
		});
	}

	async validate(email: string, password: string): Promise<RequestUser> {
		const user = await this.authService.validateUser(email, password);
		if (!user) {
			throw new UnauthorizedException('invalid-credentials');
		}
		return user;
	}
}
