import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Posts } from './posts.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './create-post.dto';
import { User } from '../users/users.entities';

@Injectable()
export class PostsService {
	constructor(
		@InjectRepository(Posts)
		private readonly postsRepository: Repository<Posts>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async createPost(post: CreatePostDto, creatorId: number): Promise<Posts> {
		console.log(post);
		return await this.postsRepository.save({
			...post,
			user: { id: creatorId },
		});
	}

	async editPost(
		postId: number,
		post: CreatePostDto,
		userId: number
	): Promise<Posts> {
		const postToEdit = await this.postsRepository.findOne({
			where: { id: postId, user: { id: userId } },
		});
		if (!postToEdit) {
			throw new NotFoundException('Post not found');
		}
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['roles'],
		});
		if (
			postToEdit.user.id !== userId &&
			!user.roles.some(role => role.name === 'admin')
		) {
			throw new BadRequestException('Invalid Request');
		}
		console.log(postId, post);
		const updatedPost = await this.postsRepository.update(postId, post);

		if (!updatedPost.affected) {
			throw new Error('Post not found');
		}

		return await this.postsRepository.findOne({ where: { id: postId } });
	}

	/**
	 * Get all posts by a user
	 * @param userId
	 * @param connectedUserId the user id of the user making the request
	 */
	async getPostsByUser(userId: number, connectedUserId: number) {
		console.log(userId, connectedUserId);
		return await this.postsRepository.find({
			where: {
				user: {
					id: userId,
					isPrivate: userId === connectedUserId ? undefined : false,
				},
				groupId: null,
			},
			order: { createdAt: 'DESC' },
		});
	}

	/**
	 * Delete a post
	 * @param postId
	 * @param connectedUserId the user id of the user making the request
	 * to check if they have the right to delete the post
	 */
	async deletePost(postId: number, connectedUserId: number) {
		const post = await this.postsRepository.findOne({
			where: { id: postId },
			relations: ['user'],
		});
		if (!post) {
			throw new NotFoundException('Post not found');
		}
		console.log(post);
		const user = await this.userRepository.findOne({
			where: { id: connectedUserId },
			relations: ['roles'],
		});
		if (
			post.user.id !== connectedUserId &&
			!user.roles.some(role => role.name === 'admin')
		) {
			throw new BadRequestException('Invalid Request');
		}
		const deletion = await this.postsRepository.delete(postId);
		if (!deletion.affected) {
			throw new Error('Post not found');
		}
	}
}
