import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateGroupDTO {
	@IsString()
	@Length(1, 255)
	name: string;

	@IsString()
	@IsOptional()
	@Length(0, 500)
	description?: string;

	@IsBoolean()
	isPrivate: boolean;
}
