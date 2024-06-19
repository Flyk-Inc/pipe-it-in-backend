import { IsInt } from 'class-validator';

export class PinPostDto {
	@IsInt()
	postId: number;
}
