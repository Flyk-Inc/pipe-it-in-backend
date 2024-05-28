import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './reactions.entities';
import { User } from '../../../users/users.entities';
import { Comment } from '../comments.entities';

@Injectable()
export class ReactionService {
	constructor(
		@InjectRepository(Reaction)
		private reactionRepository: Repository<Reaction>,
		@InjectRepository(Comment)
		private commentRepository: Repository<Comment>,
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	async toggleReaction(
		userId: number,
		commentId: number,
		isLike: boolean
	): Promise<{ message: string }> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const comment = await this.commentRepository.findOne({
			where: { id: commentId },
		});
		if (!comment) {
			throw new NotFoundException('Comment not found');
		}

		const existingReaction = await this.reactionRepository.findOne({
			where: { user: { id: userId }, comment: { id: commentId } },
		});

		if (existingReaction) {
			if (existingReaction.isLike === isLike) {
				// Remove the existing reaction if it matches the current reaction type (like or dislike)
				await this.reactionRepository.remove(existingReaction);
				return { message: isLike ? 'Like removed' : 'Dislike removed' };
			} else {
				// Switch the reaction type
				existingReaction.isLike = isLike;
				await this.reactionRepository.save(existingReaction);
				return { message: isLike ? 'Switched to like' : 'Switched to dislike' };
			}
		} else {
			// Create a new reaction if no existing reaction is found
			const reaction = this.reactionRepository.create({
				user,
				comment,
				isLike,
			});
			await this.reactionRepository.save(reaction);
			return { message: isLike ? 'Comment liked' : 'Comment disliked' };
		}
	}
}
