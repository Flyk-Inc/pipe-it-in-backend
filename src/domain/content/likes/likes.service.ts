import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './likes.entities';
import { Posts } from '../posts.entities';
import { User } from '../../users/users.entities';

@Injectable()
export class LikeService {
	constructor(
		@InjectRepository(Like)
		private likeRepository: Repository<Like>,
		@InjectRepository(Posts)
		private postRepository: Repository<Posts>,
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	async likePost(userId: number, postId: number): Promise<{ message: string }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const post = await this.postRepository.findOne({ where: { id: postId } });
		if (!post) {
			throw new NotFoundException('Post not found');
		}

		const existingLike = await this.likeRepository.findOne({
			where: { user: { id: userId }, post: { id: postId } },
		});

		if (existingLike) {
			throw new ConflictException('Post already liked');
		} else {
			const like = this.likeRepository.create({ user, post });
			await this.likeRepository.save(like);
			return { message: 'Post liked' };
		}
	}

	async unlikePost(
		userId: number,
		postId: number
	): Promise<{ message: string }> {
		const existingLike = await this.likeRepository.findOne({
			where: { user: { id: userId }, post: { id: postId } },
		});

		if (!existingLike) {
			throw new NotFoundException('Like not found');
		}

		await this.likeRepository.remove(existingLike);
		return { message: 'Like removed' };
	}
}
