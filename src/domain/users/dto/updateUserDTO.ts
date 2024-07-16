import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { FileEntity } from '../../pipelines/code-runner/file.entities';
import { Type } from 'class-transformer';

export class UpdateUserProfileDto {
	@IsString()
	@IsOptional()
	firstName?: string;

	@IsString()
	@IsOptional()
	lastName?: string;

	@IsString()
	@IsOptional()
	username?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@Type(() => FileEntity)
	@IsOptional()
	profilePicture?: FileEntity;

	@IsBoolean()
	@IsOptional()
	isPrivate?: boolean;
}
