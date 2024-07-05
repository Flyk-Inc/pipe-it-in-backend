import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { InputDescriptionDTO, OutputDescriptionDTO } from './input.dto';
import { Type } from 'class-transformer';

export class UpdateCodeDTO {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	draft?: string;

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => InputDescriptionDTO)
	input?: InputDescriptionDTO[];

	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => OutputDescriptionDTO)
	output?: OutputDescriptionDTO[];
}
