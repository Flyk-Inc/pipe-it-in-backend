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
import { TimelinePost } from './dto/TimelinePost';

@Injectable()
export class PostsService {
	constructor(
		@InjectRepository(Posts)
		private readonly postsRepository: Repository<Posts>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	/**
	 * Get all posts
	 */
	async getAll() {
		return await this.postsRepository.find({
			order: { createdAt: 'DESC' },
		});
	}

	async createPost(
		post: CreatePostDto,
		creatorId: number
	): Promise<TimelinePost> {
		const { id } = await this.postsRepository.save({
			...post,
			user: { id: creatorId },
			version: post.versionId !== undefined ? { id: post.versionId } : null,
		});
		const createdPost = await this.postsRepository.findOne({
			where: { id },
			relations: ['user', 'comments', 'likes'],
		});

		return postToTimelinePost(createdPost);
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
	 * @param cursor
	 * @param limit
	 */
	async getPostsByUser(
		userId: number,
		connectedUserId: number,
		cursor?: string,
		limit: number = 20
	): Promise<{
		data: TimelinePost[];
		total: number;
		cursor?: string | null;
		limit: number;
	}> {
		const query = this.postsRepository
			.createQueryBuilder('posts')
			.leftJoinAndSelect('posts.user', 'user')
			.leftJoinAndSelect('posts.comments', 'comments')
			.leftJoinAndSelect('posts.likes', 'likes')
			.where('posts.user_id = :userId', { userId })
			.andWhere('posts.group_id IS NULL')
			.orderBy('posts.created_at', 'DESC')
			.limit(limit);

		if (cursor) {
			query.andWhere('posts.created_at < :cursor', {
				cursor: new Date(cursor),
			});
		}

		const [posts, total] = await query.getManyAndCount();

		const timelinePosts = posts.map(post => postToTimelinePost(post));

		const nextCursor =
			posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

		return {
			data: timelinePosts,
			total,
			cursor: nextCursor,
			limit,
		};
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
			.leftJoinAndSelect('posts.version', 'version')
			.leftJoinAndSelect('version.code', 'code') // Include the nested relation
			.leftJoinAndSelect('code.author', 'author') // Include the nested relation
			.leftJoinAndSelect('posts.likes', 'likes')
			.leftJoinAndSelect('user.profilePicture', 'profilePicture')
			.where(qb => {
				const subQuery1 = qb
					.subQuery()
					.select('p.id')
					.from(Posts, 'p')
					.innerJoin(UserFollows, 'uf', 'uf.user.id = p.user.id')
					.where('uf.follower.id = :userId', { userId })
					.getQuery();

				const subQuery2 = qb
					.subQuery()
					.select('p.id')
					.from(Posts, 'p')
					.innerJoin(GroupMember, 'gm', 'gm.group.id = p.groupId')
					.where('gm.user.id = :userId', { userId })
					.getQuery();

				const subQuery3 = qb
					.subQuery()
					.select('p.id')
					.from(Posts, 'p')
					.where('p.user.id = :userId', { userId })
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
		}

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
