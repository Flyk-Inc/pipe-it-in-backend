import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { User } from '../users.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../dto/createUserDTO';
import { Role } from '../../../infrastructure/auth/roles.entities';
import { Posts } from '../../content/posts.entities';
import { UpdateUserProfileDto } from '../dto/updateUserDTO';
import { PinPostDto } from '../dto/pinPostDTO';
import { FollowRequest } from '../follow_requests.entities';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		@InjectRepository(Posts)
		private postsRepository: Repository<Posts>,
		@InjectRepository(FollowRequest)
		private followRequestRepository: Repository<FollowRequest>
	) {}

	async createUser(userToCreate: CreateUserDTO): Promise<User> {
		if (await this.getUserByEmail(userToCreate.email)) {
			throw new Error('User already exists');
		}
		const userRole = await this.rolesRepository.findOne({
			where: { name: 'user' },
		});
		return await this.usersRepository.save({
			...userToCreate,
			roles: [userRole],
		});
	}

	async getUserByEmail(email: string): Promise<User | null> {
		return await this.usersRepository.findOne({
			where: { email },
			relations: [
				'roles',
				'profilePicture',
				'followers',
				'followers.follower.profilePicture',
				'following',
				'posts',
				'receivedFollowRequests',
				'receivedFollowRequests.follower',
				'receivedFollowRequests.follower.profilePicture',
			],
		});
	}

	async getUserById(id: number): Promise<User | null> {
		return await this.usersRepository.findOne({
			where: { id },
			relations: [
				'roles',
				'profilePicture',
				'followers',
				'followers.follower',
				'following',
				'following.follower',
				'receivedFollowRequests',
				'receivedFollowRequests.follower',
				'posts',
			],
		});
	}

	async updateUserProfile(
		userId: number,
		updateUserProfileDto: UpdateUserProfileDto
	): Promise<User> {
		const user = await this.usersRepository.findOne({
			where: { id: userId },
			relations: ['roles', 'profilePicture', 'followers', 'following', 'posts'],
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (user.isPrivate && !updateUserProfileDto.isPrivate) {
			await this.followRequestRepository.delete({
				user: { id: userId },
				isAccepted: false,
			});
		}

		this.usersRepository.merge(user, updateUserProfileDto);
		return this.usersRepository.save(user);
	}

	async pinPost(userId: number, pinPostDto: PinPostDto): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const post = await this.postsRepository.findOne({
			where: { id: pinPostDto.postId },
		});
		if (!post) {
			throw new NotFoundException('Post not found');
		}
		if (post.user.id !== userId) {
			throw new BadRequestException('Invalid Request');
		}

		user.pinnedPost = pinPostDto.postId;
		return this.usersRepository.save(user);
	}

	async unpinPost(userId: number): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		user.pinnedPost = null;
		return this.usersRepository.save(user);
	}
}
