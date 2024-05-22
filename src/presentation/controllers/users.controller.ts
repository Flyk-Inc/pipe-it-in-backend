import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { UsersService } from '../../domain/users/service/users.service';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Role } from '../../infrastructure/auth/roles.enum';
import { Roles } from '../../infrastructure/auth/roles.decorator';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@UseGuards(RolesGuard)
	@UseGuards(JwtAuthGuard)
	@Roles(Role.User)
	@Get('profile')
	getProfile(@Request() req: SignedInRequest) {
		return this.usersService.getUserByEmail(req.user.email);
	}
}
