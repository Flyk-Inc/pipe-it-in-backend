import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateGroupDTO {
	@IsString()
	@IsOptional()
	@Length(1, 255)
	name?: string;

	@IsString()
	@IsOptional()
	@Length(0, 500)
	description?: string;

	@IsBoolean()
	@IsOptional()
	isPrivate?: boolean;
}
