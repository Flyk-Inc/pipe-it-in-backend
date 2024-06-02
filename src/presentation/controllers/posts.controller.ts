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
import { LikeService } from '../../domain/content/likes/likes.service';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly commentService: CommentService,
		private readonly likeService: LikeService,
		private readonly tagService: TagService
		private readonly commentService: CommentService,
		private readonly likeService: LikeService
	) {}

	@Get('/user/:userId')
	async getPostsToDisplayByUser(@Request() req: SignedInRequest) {
		return await this.postsService.getPostsByUser(
			parseInt(req.params.userId),
			req.user.userId
		);
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
	async getPostsByTags(@Query('tags') tags: string) {
		// If no tag is provided, the research should return all posts
		if (!tags) return this.postsService.getAll();

		const tagList = tags.split(',').filter(tag => tag.trim() !== '');
		if (tagList.length === 0) return [];

		return await this.tagService.getPostsByTags(tagList);
	}
}
