import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { PostsService } from '../../domain/content/posts.service';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { CreatePostDto } from '../../domain/content/create-post.dto';
import { CommentService } from '../../domain/content/comments/comments.service';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly commentService: CommentService
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
}
