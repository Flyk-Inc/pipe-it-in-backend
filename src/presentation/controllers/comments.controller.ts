import {
	Body,
	Controller,
	Delete,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { CreateCommentDTO } from '../../domain/content/comments/createCommentDTO';
import { CommentService } from '../../domain/content/comments/comments.service';
import { UpdateCommentDTO } from '../../domain/content/comments/updateCommentDTO';
import { ReactionService } from '../../domain/content/comments/reactions/reactions.service';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentController {
	constructor(
		private commentService: CommentService,
		private readonly reactionService: ReactionService
	) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	async createComment(
		@Request() req: SignedInRequest,
		@Body() createCommentDTO: CreateCommentDTO
	) {
		const userId = req.user.userId;
		return await this.commentService.createComment(userId, createCommentDTO);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':commentId')
	async updateComment(
		@Request() req: SignedInRequest,
		@Param('commentId', ParseIntPipe) commentId: number,
		@Body() updateCommentDTO: UpdateCommentDTO
	) {
		const userId = req.user.userId;
		return await this.commentService.updateComment(
			userId,
			commentId,
			updateCommentDTO
		);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':commentId')
	async deleteComment(
		@Request() req: SignedInRequest,
		@Param('commentId', ParseIntPipe) commentId: number
	) {
		const userId = req.user.userId;
		return await this.commentService.deleteComment(userId, commentId);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':commentId/reply')
	async replyToComment(
		@Request() req: SignedInRequest,
		@Param('commentId', ParseIntPipe) commentId: number,
		@Body() createCommentDTO: CreateCommentDTO
	) {
		const userId = req.user.userId;
		return await this.commentService.replyToComment(userId, {
			...createCommentDTO,
			parentId: commentId,
		});
	}

	@UseGuards(JwtAuthGuard)
	@Post(':id/react')
	async createReaction(
		@Param('id', ParseIntPipe) commentId: number,
		@Request() req: SignedInRequest,
		@Body() body: { isLike: boolean }
	) {
		const userId = req.user.userId;
		return await this.reactionService.createReaction(
			userId,
			commentId,
			body.isLike
		);
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id/react')
	async updateReaction(
		@Param('id', ParseIntPipe) commentId: number,
		@Request() req: SignedInRequest,
		@Body() body: { isLike: boolean }
	) {
		const userId = req.user.userId;
		return await this.reactionService.updateReaction(
			userId,
			commentId,
			body.isLike
		);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id/react')
	async deleteReaction(
		@Param('id', ParseIntPipe) commentId: number,
		@Request() req: SignedInRequest
	) {
		const userId = req.user.userId;
		return await this.reactionService.deleteReaction(userId, commentId);
	}
}
