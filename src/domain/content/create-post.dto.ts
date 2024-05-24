import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreatePostDto {
	@IsString()
	@IsNotEmpty()
	text: string;

	@IsInt()
	@IsOptional()
	groupId: number;
}
