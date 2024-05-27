import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/users.entities';
import { Posts } from '../posts.entities';
import { CreateCommentDTO } from './createCommentDTO';
import { UpdateCommentDTO } from './updateCommentDTO';
import { Comment } from './comments.entities';

@Injectable()
export class CommentService {
	constructor(
		@InjectRepository(Comment)
		private commentRepository: Repository<Comment>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Posts)
		private postRepository: Repository<Posts>
	) {}

	async createComment(
		userId: number,
		createCommentDTO: CreateCommentDTO
	): Promise<Comment> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const post = await this.postRepository.findOne({
			where: { id: createCommentDTO.postId },
		});
		if (!post) {
			throw new NotFoundException('Post not found');
		}

		const comment = this.commentRepository.create({
			user,
			post,
			content: createCommentDTO.content,
			parent: createCommentDTO.parentId
				? await this.commentRepository.findOne({
						where: { id: createCommentDTO.parentId },
					})
				: null,
		});

		return await this.commentRepository.save(comment);
	}

	async updateComment(
		userId: number,
		commentId: number,
		updateCommentDTO: UpdateCommentDTO
	): Promise<Comment> {
		const comment = await this.commentRepository.findOne({
			where: { id: commentId },
		});
		if (!comment) {
			throw new NotFoundException('Comment not found');
		}

		if (comment.user.id !== userId) {
			throw new ForbiddenException(
				'User does not have permission to update this comment'
			);
		}

		comment.content = updateCommentDTO.content;
		return await this.commentRepository.save(comment);
	}

	async deleteComment(userId: number, commentId: number): Promise<void> {
		const comment = await this.commentRepository.findOne({
			where: { id: commentId },
			relations: ['replies'],
		});
		if (!comment) {
			throw new NotFoundException('Comment not found');
		}

		if (comment.user.id !== userId) {
			throw new ForbiddenException(
				'User does not have permission to delete this comment'
			);
		}

		// If the comment has replies, delete them recursively
		if (comment.replies && comment.replies.length > 0) {
			for (const reply of comment.replies) {
				await this.deleteComment(userId, reply.id);
			}
		}

		await this.commentRepository.remove(comment);
	}

	async replyToComment(
		userId: number,
		createCommentDTO: CreateCommentDTO
	): Promise<Comment> {
		return await this.createComment(userId, createCommentDTO);
	}

	async getCommentsByPostId(postId: number): Promise<Comment[]> {
		const post = await this.postRepository.findOne({
			where: { id: postId },
		});
		if (!post) {
			throw new NotFoundException('Post not found');
		}

		return await this.commentRepository.find({
			where: { post: { id: postId } },
			relations: ['user', 'replies'],
		});
	}
}
