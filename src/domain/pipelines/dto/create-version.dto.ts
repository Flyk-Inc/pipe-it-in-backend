import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InputDescriptionDTO, OutputDescriptionDTO } from './input.dto';

export class CreateVersionDTO {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsNotEmpty()
	@IsString()
	version: string;

	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@IsString()
	status: string;

	@IsNotEmpty()
	@IsString()
	codeContent: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => InputDescriptionDTO)
	input: InputDescriptionDTO[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OutputDescriptionDTO)
	output: OutputDescriptionDTO[];
}
