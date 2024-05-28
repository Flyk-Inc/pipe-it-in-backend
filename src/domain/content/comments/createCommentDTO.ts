import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDTO {
	@IsString()
	@IsNotEmpty()
	content: string;

	@IsInt()
	@IsNotEmpty()
	postId: number;

	@IsInt()
	@IsOptional()
	parentId?: number;
}
