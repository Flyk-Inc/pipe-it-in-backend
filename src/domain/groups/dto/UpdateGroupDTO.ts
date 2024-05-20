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
	is_private?: boolean;

	@IsInt()
	@IsOptional()
	profile_picture?: number;

	@IsInt()
	@IsOptional()
	pinned_post?: number;

	@IsInt()
	@IsOptional()
	creator_id?: number;
}
