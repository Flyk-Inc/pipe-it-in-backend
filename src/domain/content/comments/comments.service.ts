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

		const query = this.commentRepository
			.createQueryBuilder('comment')
			.leftJoinAndSelect('comment.user', 'user')
			.leftJoinAndSelect('comment.parent', 'commentParent')
			.leftJoinAndSelect('comment.reactions', 'commentReactions')
			.leftJoinAndSelect('commentReactions.user', 'commentReactionsUser')
			.leftJoinAndSelect('user.profilePicture', 'userProfilePicture')
			.leftJoinAndSelect('comment.replies', 'replies')
			.leftJoinAndSelect('replies.user', 'repliesUser')
			.leftJoinAndSelect('replies.reactions', 'repliesReactions')
			.leftJoinAndSelect('repliesReactions.user', 'reactionsUser')
			.leftJoinAndSelect(
				'repliesUser.profilePicture',
				'repliesUserProfilePicture'
			)
			.addSelect('COUNT(commentReactions.id) as reactionCount')
			.addSelect(
				'SUM(CASE WHEN commentReactions.isLike = true THEN 1 ELSE 0 END) as likeCount'
			)
			.where('comment.post.id = :postId', { postId })
			.groupBy('comment.id')
			.addGroupBy('user.id')
			.addGroupBy('commentParent.id')
			.addGroupBy('commentReactions.id')
			.addGroupBy('commentReactionsUser.id')
			.addGroupBy('userProfilePicture.id')
			.addGroupBy('replies.id')
			.addGroupBy('repliesUser.id')
			.addGroupBy('repliesReactions.id')
			.addGroupBy('reactionsUser.id')
			.addGroupBy('repliesUserProfilePicture.id')
			.orderBy('likeCount', 'DESC')
			.addOrderBy('comment.createdAt', 'DESC');

		const comments = await query.getRawAndEntities();
		return comments.entities;
	}
}
