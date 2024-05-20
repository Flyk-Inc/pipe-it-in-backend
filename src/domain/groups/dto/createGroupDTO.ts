import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateGroupDTO {
	@IsString()
	@IsNotEmpty()
	name: string;

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
}
