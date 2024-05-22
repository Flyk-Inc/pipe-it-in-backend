import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateGroupDTO {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	isPrivate?: boolean;

	@IsInt()
	@IsOptional()
	profilePicture?: number;

	@IsInt()
	@IsOptional()
	pinnedPost?: number;
}
