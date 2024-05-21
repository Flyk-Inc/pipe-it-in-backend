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
	isPrivate?: boolean;

	@IsInt()
	@IsOptional()
	profilePicture?: number;

	@IsInt()
	@IsOptional()
	pinnedPost?: number;
}
