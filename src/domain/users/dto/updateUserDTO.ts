import { IsOptional, IsString } from 'class-validator';

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
}
