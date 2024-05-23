import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../domain/users/users.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollows } from '../domain/users/user_follows.entities';

@Injectable()
export class RelationshipService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(UserFollows)
		private userFollowsRepository: Repository<UserFollows>
	) {}

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
			throw new Error('User is private');
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
}
