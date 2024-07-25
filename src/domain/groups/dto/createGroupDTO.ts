import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FileEntity } from '../../pipelines/code-runner/file.entities';

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

	@ValidateNested()
	@Type(() => FileEntity)
	@IsOptional()
	profilePicture?: FileEntity;

	@IsInt()
	@IsOptional()
	pinnedPost?: number;
}
