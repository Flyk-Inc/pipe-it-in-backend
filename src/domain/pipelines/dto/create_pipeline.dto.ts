import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePipelineDTO {
	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreatePipelineCodeDTO)
	pipelineCodes: CreatePipelineCodeDTO[];
}

export class CreatePipelineCodeDTO {
	@IsInt()
	code_version_id: number;

	@IsInt()
	step: number;
}
