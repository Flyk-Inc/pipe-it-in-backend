import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Request,
	UseGuards,
} from '@nestjs/common';
import { PostsService } from '../../domain/content/posts.service';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { CreatePostDto } from '../../domain/content/create-post.dto';
import { CommentService } from '../../domain/content/comments/comments.service';
import { LikeService } from '../../domain/content/likes/likes.service';
import { TagService } from '../../domain/content/tags/tags.service';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly commentService: CommentService,
		private readonly likeService: LikeService,
		private readonly tagService: TagService
	) {}

	@Get('/user/:userId')
	async getPostsToDisplayByUser(
		@Param('userId', ParseIntPipe) userId: number,
		@Request() req: SignedInRequest,
		@Query('cursor') cursor: string,
		@Query('limit') limit: number
	) {
		return await this.postsService.getPostsByUser(
			userId,
			req.user.userId,
			cursor,
			limit
		);
	}

	@Get('/details/:postId')
	async getPost(@Param('postId', ParseIntPipe) postId: number) {
		console.log('hey');
		return await this.postsService.getPostById(postId);
	}

	@Post()
	async createPost(
		@Body() post: CreatePostDto,
		@Request() req: SignedInRequest
	) {
		return await this.postsService.createPost(post, req.user.userId);
	}

	@Patch(':id')
	async editPost(
		@Body() post: CreatePostDto,
		@Param('id') postId: number,
		@Request() req: SignedInRequest
	) {
		return await this.postsService.editPost(postId, post, req.user.userId);
	}

	@Delete(':id')
	async deletePost(
		@Param('id') postId: number,
		@Request() req: SignedInRequest
	) {
		return await this.postsService.deletePost(postId, req.user.userId);
	}

	@Get(':id/comments')
	async getCommentsByPostId(@Param('id', ParseIntPipe) postId: number) {
		return await this.commentService.getCommentsByPostId(postId);
	}

	@Post(':id/like')
	async createLike(
		@Param('id', ParseIntPipe) postId: number,
		@Request() req: SignedInRequest
	) {
		return await this.likeService.likePost(req.user.userId, postId);
	}

	@Delete(':id/like')
	async deleteLike(
		@Param('id', ParseIntPipe) postId: number,
		@Request() req: SignedInRequest
	) {
		return await this.likeService.unlikePost(req.user.userId, postId);
	}

	@Get('/timeline')
	async getTimelinePosts(
		@Request() req: SignedInRequest,
		@Query('cursor') cursor: string,
		@Query('limit') limit: number
	) {
		return await this.postsService.getTimelinePosts(
			req.user.userId,
			cursor,
			limit
		);
	}

	@Post(':id/tags')
	async addTagToPost(
		@Param('id', ParseIntPipe) postId: number,
		@Body('tagName') tagName: string
	) {
		return await this.tagService.addTagToPost(postId, tagName);
	}

	@Delete(':id/tags')
	async removeTagFromPost(
		@Param('id', ParseIntPipe) postId: number,
		@Body('tagName') tagName: string
	) {
		return await this.tagService.removeTagFromPost(postId, tagName);
	}

	@Get()
	async getPostsByTags(@Query('tagList') tagList: string[]) {
		// Ensure tagList is always an array
		if (!Array.isArray(tagList)) {
			tagList = [tagList];
		}

		// If no tag is provided, the research should return all posts
		if (!tagList || tagList.length === 0) {
			return this.postsService.getAll();
		}

		return await this.tagService.getPostsByTags(tagList);
	}
}
