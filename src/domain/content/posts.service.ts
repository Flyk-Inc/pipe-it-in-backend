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
import { GroupMember } from '../groups/groupMembers.entities';
import { UserFollows } from '../users/user_follows.entities';
import { postToTimelinePost } from './dto/PostFormatter';

@Injectable()
export class PostsService {
	constructor(
		@InjectRepository(Posts)
		private readonly postsRepository: Repository<Posts>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async createPost(post: CreatePostDto, creatorId: number): Promise<Posts> {
		return await this.postsRepository.save({
			...post,
			user: { id: creatorId },
		});
	}

	/**
	 * Edit a post
	 * @param postId
	 * @param postDTO the new post data
	 * @param userId the user id of the user making the request,
	 * to check if they have the right to edit the post.
	 * Has to be the creator of the post or an admin
	 */
	async editPost(
		postId: number,
		postDTO: CreatePostDto,
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
		// Check if the user is the creator of the post or an admin to edit the post
		if (
			postToEdit.user.id !== userId &&
			!user.roles.some(role => role.name === 'admin')
		) {
			throw new BadRequestException('Invalid Request');
		}
		const updatedPost = await this.postsRepository.update(postId, postDTO);
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
		const user = await this.userRepository.findOne({
			where: { id: connectedUserId },
			relations: ['roles'],
		});
		// Check if the user is the creator of the post or an admin to edit the post
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

	async getTimelinePosts(userId: number, cursor?: string, limit: number = 10) {
		const query = this.postsRepository
			.createQueryBuilder('posts')
			.leftJoinAndSelect('posts.user', 'user')
			.leftJoinAndSelect('posts.comments', 'comments')
			.leftJoinAndSelect('posts.likes', 'likes')
			.where(qb => {
				const subQuery1 = qb
					.subQuery()
					.select('p.id')
					.from(Posts, 'p')
					.where('p.user_id = :userId', { userId })
					.getQuery();

				const subQuery2 = qb
					.subQuery()
					.select('p.id')
					.from(Posts, 'p')
					.innerJoin(
						UserFollows,
						'uf',
						'uf.user_id = :userId AND uf.follower_id = p.user_id',
						{ userId }
					)
					.getQuery();

				const subQuery3 = qb
					.subQuery()
					.select('p.id')
					.from(Posts, 'p')
					.innerJoin(
						GroupMember,
						'gm',
						'gm.userId = :userId AND gm.groupId = p.group_id',
						{ userId }
					)
					.getQuery();

				let whereClause = `posts.id IN (${subQuery1} UNION ${subQuery2} UNION ${subQuery3})`;
				if (cursor) {
					whereClause += ` AND posts.created_at < :cursor`;
				}
				return whereClause;
			})
			.orderBy('posts.created_at', 'DESC')
			.limit(limit);

		if (cursor) {
			query.setParameter('cursor', new Date(cursor));
			console.log(cursor);
		}

		console.log(query.getQuery());
		const [posts, total] = await query.getManyAndCount();

		const timelinePosts = posts.map(post => postToTimelinePost(post));

		const nextCursor =
			posts.length > 0 ? posts[posts.length - 1].createdAt : null;

		return {
			data: timelinePosts,
			total,
			cursor: nextCursor,
			limit,
		};
	}
}
