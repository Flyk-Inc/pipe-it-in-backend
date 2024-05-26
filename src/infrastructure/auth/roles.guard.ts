import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';
import { UsersService } from '../../domain/users/service/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private userService: UsersService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredRoles) {
			return true;
		}
		const { user: jwtUser } = context.switchToHttp().getRequest();
		const user = await this.userService.getUserByEmail(jwtUser.email);
		for (const role of user.roles) {
			if (requiredRoles.includes(role.name as Role)) {
				return true;
			}
		}

		throw new UnauthorizedException();
	}
}
