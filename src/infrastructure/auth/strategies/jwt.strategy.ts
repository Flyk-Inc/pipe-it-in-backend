import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { Request as ExpressRequest } from 'express';
import { UsersService } from '../../../domain/users/service/users.service';

export interface JwtPayload {
	email: string;
	sub: string;
	iat: number;
	exp: number;
}

export type SignedInRequest = ExpressRequest & {
	user: {
		userId: string;
		email: string;
	};
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private userSerivce: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: JwtPayload) {
		if (!(await this.isTokenValid(new Date(payload.iat), payload.email))) {
			throw new UnauthorizedException();
		}
		return { userId: payload.sub, email: payload.email };
	}

	/**
	 * Check if the token is valid by checking if the user exists and is active
	 * and if the token was issued after the last token update
	 * @param tokenIssuedAt
	 * @param userEmail
	 * @private
	 */
	private async isTokenValid(
		tokenIssuedAt: Date,
		userEmail: string
	): Promise<boolean> {
		const user = await this.userSerivce.getUserByEmail(userEmail);
		return user && user.isActive && tokenIssuedAt >= user.lastTokenUpdate;
	}
}
