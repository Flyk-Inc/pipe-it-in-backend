import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './users.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollows } from './user_follows.entities';
import { FollowRequest } from './follow_requests.entities';

@Injectable()
export class RelationshipService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(UserFollows)
		private userFollowsRepository: Repository<UserFollows>,
		@InjectRepository(FollowRequest)
		private followRequestRepository: Repository<FollowRequest>
	) {}

	/**
	 * Follows a public user. If the user is private, throws 400 error
	 * @param followerId User ID of the user asking to follow
	 * @param userId User ID of the user to follow
	 */
	async followUser(followerId: number, userId: number) {
		const follower = await this.userRepository.findOneBy({ id: followerId });
		if (!follower) {
			throw new Error("Follower doesn't exist");
		}
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) {
			throw new Error("User doesn't exist");
		}

		if (user.isPrivate) {
			throw new BadRequestException('User is private');
		}

		const alreadyFollowing = await this.userFollowsRepository.findOne({
			where: { follower: { id: followerId }, user: { id: userId } },
		});

		if (alreadyFollowing) {
			throw new BadRequestException('Already following');
		}

		const nowFollows = await this.userFollowsRepository.save({
			follower: { id: followerId },
			user: { id: userId },
		});

		if (!nowFollows) {
			throw new Error('Failed to follow user');
		}
	}

	/**
	 * UnFollows a user
	 * @param followerId User ID of the user asking to unfollow
	 * @param userId User ID of the user to unfollow
	 */

	async unfollowUser(followerId: number, userId: number): Promise<void> {
		const [follower, user] = await Promise.all([
			this.userRepository.findOne({ where: { id: followerId } }),
			this.userRepository.findOne({ where: { id: userId } }),
		]);

		if (!follower) {
			throw new BadRequestException("Follower doesn't exist");
		}
		if (!user) {
			throw new BadRequestException("User doesn't exist");
		}

		const alreadyFollowing = await this.userFollowsRepository.findOne({
			where: {
				follower: { id: followerId },
				user: { id: userId },
			},
			relations: ['follower', 'user'], // Ensure relations are included
		});

		if (!alreadyFollowing) {
			throw new BadRequestException('Not following');
		}

		const deleteResult = await this.userFollowsRepository.delete(
			alreadyFollowing.id
		);

		if (deleteResult.affected === 0) {
			throw new Error('Failed to unfollow user');
		}
	}

	async getFollowers(userId: number): Promise<User[]> {
		const followers = await this.userFollowsRepository.find({
			where: { user: { id: userId } },
			relations: ['follower'],
		});

		return followers.map(follow => follow.follower);
	}

	async getFollowing(userId: number): Promise<User[]> {
		const following = await this.userFollowsRepository.find({
			where: { follower: { id: userId } },
			relations: ['user'],
		});

		return following.map(follow => follow.user);
	}

	/**
	 * Follows a user, only way to follow a private user. If the user is public, follows directly
	 * @param followerId User ID of the user asking to follow
	 * @param userId User ID of the user to follow
	 */
	async sendFollowRequest(followerId: number, userId: number) {
		const [follower, user] = await Promise.all([
			this.userRepository.findOne({ where: { id: followerId } }),
			this.userRepository.findOne({ where: { id: userId } }),
		]);

		if (!follower) {
			throw new BadRequestException("Follower doesn't exist");
		}
		if (!user) {
			throw new BadRequestException("User doesn't exist");
		}

		if (user.isPrivate === false) {
			await this.followUser(followerId, userId);
			return;
		}

		const alreadyFollowing = await this.userFollowsRepository.findOne({
			where: { follower: { id: followerId }, user: { id: userId } },
		});

		if (alreadyFollowing) {
			throw new BadRequestException('Already following');
		}

		const alreadyRequested = await this.followRequestRepository.findOne({
			where: {
				follower: { id: followerId },
				user: { id: userId },
			},
		});

		if (alreadyRequested) {
			throw new BadRequestException('Already requested');
		}

		const request = await this.followRequestRepository.save({
			follower: { id: followerId },
			user: { id: userId },
		});

		if (!request) {
			throw new Error('Failed to send follow request');
		}
	}

	/**
	 * Accepts a follow request
	 * @param requestId ID of the follow request
	 * @param userId User ID of the user accepting the request
	 */
	async acceptFollowRequest(requestId: number, userId: number): Promise<void> {
		const request = await this.followRequestRepository.findOne({
			where: { id: requestId },
			relations: ['follower', 'user'],
		});
		console.log(request);
		if (!request) {
			throw new BadRequestException('No follow request');
		}

		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['roles'],
		});
		if (!user) {
			throw new BadRequestException("User doesn't exist");
		}

		// Ensure the user is the follower or the user of the request, or an admin
		if (
			request.follower.id !== userId &&
			request.user.id !== userId &&
			user.roles.some(role => role.name === 'admin') === false
		) {
			console.log(userId, request.follower.id, request.user.id);
			throw new BadRequestException('Invalid request');
		}

		const follow = await this.userFollowsRepository.save({
			follower: { id: request.follower.id },
			user: { id: userId },
		});

		if (!follow) {
			throw new Error('Failed to follow user');
		}

		await this.followRequestRepository.update(request.id, { isAccepted: true });
	}

	async rejectFollowRequest(requestId: number): Promise<void> {
		const request = await this.followRequestRepository.findOneBy({
			id: requestId,
		});

		if (!request) {
			throw new BadRequestException('No follow request');
		}

		const deleteResult = await this.followRequestRepository.delete(requestId);

		if (deleteResult.affected === 0) {
			throw new Error('Failed to delete follow request');
		}
	}

	async getPendingFollowRequests(userId: number): Promise<FollowRequest[]> {
		return this.followRequestRepository.find({
			where: { user: { id: userId }, isAccepted: false },
			relations: ['follower'],
		});
	}
}