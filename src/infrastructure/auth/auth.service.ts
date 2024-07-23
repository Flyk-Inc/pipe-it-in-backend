import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../domain/users/service/users.service';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from '../../domain/users/dto/createUserDTO';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.getUserByEmail(email);
		if (user && user.password === this.hashPassword(password)) {
			if (user.isActive) {
				const { password, ...result } = user;
				return result;
			} else {
				throw new UnauthorizedException('user.not.activated');
			}
		}
		return null;
	}

	async login(user: any) {
		const payload = { email: user.email, sub: user.id, iat: Date.now() };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async register(user: CreateUserDTO) {
		user.password = this.hashPassword(user.password);
		return this.usersService.createUser(user);
	}

	private hashPassword(password: string): string {
		const hash = createHash('sha256');
		hash.update(password);
		return hash.digest('hex');
	}
}
