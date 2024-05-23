import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { UsersService } from '../../domain/users/service/users.service';
import { RelationshipService } from '../../relationship/relationship.service';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserFollowController {
	constructor(
		private usersService: UsersService,
		private relationshipService: RelationshipService
	) {}

	@Post('/:userId/follow')
	async followUser(@Request() req: SignedInRequest) {
		await this.relationshipService.followUser(
			req.user.userId,
			parseInt(req.params.userId)
		);
	}

	@Post('/:userId/unfollow')
	async unfollowUser(@Request() req: SignedInRequest) {
		await this.relationshipService.unfollowUser(
			req.user.userId,
			parseInt(req.params.id)
		);
	}
}
