import {
	Body,
	Controller,
	Get,
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
import { ToggleUserPrivacyDto } from '../../domain/users/dto/toggleUserPrivacyDto';
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
	@Patch('privacy')
	togglePrivacy(
		@Request() req: SignedInRequest,
		@Body() toggleUserPrivacyDto: ToggleUserPrivacyDto
	) {
		return this.usersService.toggleUserPrivacy(
			req.user.userId,
			toggleUserPrivacyDto
		);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('pin-post')
	pinPost(@Request() req: SignedInRequest, @Body() pinPostDto: PinPostDto) {
		return this.usersService.pinPost(req.user.userId, pinPostDto);
	}
}
