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
import { ToggleUserPrivacyDto } from '../dto/toggleUserPrivacyDto';
import { PinPostDto } from '../dto/pinPostDTO';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		@InjectRepository(Posts)
		private postsRepository: Repository<Posts>
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
		return await this.usersRepository.findOne({ where: { email } });
	}

	async updateUserProfile(
		userId: number,
		updateUserProfileDto: UpdateUserProfileDto
	): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const updatedUser = Object.assign(user, updateUserProfileDto);
		return this.usersRepository.save(updatedUser);
	}

	async toggleUserPrivacy(
		userId: number,
		toggleUserPrivacyDto: ToggleUserPrivacyDto
	): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		user.isPrivate = toggleUserPrivacyDto.isPrivate;
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
}
