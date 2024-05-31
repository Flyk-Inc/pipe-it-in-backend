import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
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

	async createReaction(
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
			where: { user: { id: userId }, comment: { id: commentId }, isLike },
		});

		if (existingReaction) {
			throw new ConflictException(
				`Comment already ${isLike ? 'liked' : 'disliked'}`
			);
		} else {
			const reaction = this.reactionRepository.create({
				user,
				comment,
				isLike,
			});
			await this.reactionRepository.save(reaction);
			return { message: `Comment ${isLike ? 'liked' : 'disliked'}` };
		}
	}

	async updateReaction(
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

		if (!existingReaction) {
			throw new NotFoundException('Reaction not found');
		}

		if (existingReaction.isLike === isLike) {
			throw new ConflictException(
				`Comment is already ${isLike ? 'liked' : 'disliked'}`
			);
		}

		existingReaction.isLike = isLike;
		await this.reactionRepository.save(existingReaction);
		return { message: isLike ? 'Switched to like' : 'Switched to dislike' };
	}

	async deleteReaction(
		userId: number,
		commentId: number
	): Promise<{ message: string }> {
		const existingReaction = await this.reactionRepository.findOne({
			where: { user: { id: userId }, comment: { id: commentId } },
		});

		if (!existingReaction) {
			throw new NotFoundException('Reaction not found');
		}

		await this.reactionRepository.remove(existingReaction);
		return { message: 'Reaction removed' };
	}
}
