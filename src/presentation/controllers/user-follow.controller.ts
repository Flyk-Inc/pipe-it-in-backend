import {
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { RelationshipService } from '../../domain/users/relationship.service';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserFollowController {
	constructor(private relationshipService: RelationshipService) {}

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
			parseInt(req.params.userId)
		);
	}

	@Get('/follow-request')
	async getPendingFollowRequests(@Request() req: SignedInRequest) {
		return this.relationshipService.getPendingFollowRequests(req.user.userId);
	}

	@Post('/:userId/follow-request')
	async sendFollowRequest(@Request() req: SignedInRequest) {
		await this.relationshipService.sendFollowRequest(
			req.user.userId,
			parseInt(req.params.userId)
		);
	}

	@Patch('/:followerId/follow-request')
	async acceptFollowRequest(@Request() req: SignedInRequest) {
		await this.relationshipService.acceptFollowRequest(
			parseInt(req.params.followerId),
			req.user.userId
		);
	}

	@Delete('/:followerId/follow-request')
	async deleteFollowRequest(@Request() req: SignedInRequest) {
		await this.relationshipService.rejectFollowRequest(
			parseInt(req.params.followerId),
			req.user.userId
		);
	}

	@Get('/:userId/followers')
	async getFollowers(@Request() req: SignedInRequest) {
		return this.relationshipService.getFollowers(parseInt(req.params.userId));
	}

	@Get('/:userId/following')
	async getFollowing(@Request() req: SignedInRequest) {
		return this.relationshipService.getFollowing(parseInt(req.params.userId));
	}

	@Delete('/followers/:followerId')
	async removeFollower(@Request() req: SignedInRequest) {
		return this.relationshipService.removeFollower(
			req.user.userId,
			parseInt(req.params.followerId)
		);
	}
}
