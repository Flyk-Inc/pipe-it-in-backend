import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { UsersService } from '../../domain/users/service/users.service';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Role } from '../../infrastructure/auth/roles.enum';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { UpdateUserProfileDto } from '../../domain/users/dto/updateUserDTO';
import { PinPostDto } from '../../domain/users/dto/pinPostDTO';

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

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	getUserById(@Param('id') id: number) {
		return this.usersService.getUserById(id);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('profile')
	updateProfile(
		@Request() req: SignedInRequest,
		@Body() updateUserProfileDto: UpdateUserProfileDto
	) {
		return this.usersService.updateUserProfile(
			req.user.userId,
			updateUserProfileDto
		);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('pin-post')
	pinPost(@Request() req: SignedInRequest, @Body() pinPostDto: PinPostDto) {
		return this.usersService.pinPost(req.user.userId, pinPostDto);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('unpin-post')
	unpinPost(@Request() req: SignedInRequest) {
		return this.usersService.unpinPost(req.user.userId);
	}
}
