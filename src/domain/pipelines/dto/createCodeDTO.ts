import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { CodeLanguages } from '../code.entities';
import { InputDescriptionDTO, OutputDescriptionDTO } from './input.dto';
import { Type } from 'class-transformer';

export class CreateCodeDTO {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	@IsString()
	draft: string;

	@IsNotEmpty()
	@IsEnum(CodeLanguages)
	language: CodeLanguages;

	@ValidateNested({ each: true })
	@Type(() => InputDescriptionDTO)
	input: InputDescriptionDTO[];

	@ValidateNested({ each: true })
	@Type(() => OutputDescriptionDTO)
	output: OutputDescriptionDTO[];
}
