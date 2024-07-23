import {
	IsString,
	IsInt,
	IsArray,
	ValidateNested,
	IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePipelineDTO {
	@IsOptional()
	@IsString()
	title: string;

	@IsOptional()
	@IsString()
	description: string;

	@IsOptional()
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
