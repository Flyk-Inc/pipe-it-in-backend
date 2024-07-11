import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InputDescriptionDTO, OutputDescriptionDTO } from './input.dto';

export class UpdateVersionDTO {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	version?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	codeContent?: string;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => InputDescriptionDTO)
	input?: InputDescriptionDTO[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OutputDescriptionDTO)
	output?: OutputDescriptionDTO[];
}
