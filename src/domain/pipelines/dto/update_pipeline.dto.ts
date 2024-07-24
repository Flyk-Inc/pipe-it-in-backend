import {
	IsString,
	IsInt,
	IsArray,
	ValidateNested,
	IsOptional,
	IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CodeStatus } from '../code.entities';

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

	@IsOptional()
	@IsEnum(CodeStatus)
	status: CodeStatus;
}

export class CreatePipelineCodeDTO {
	@IsInt()
	code_version_id: number;

	@IsInt()
	step: number;
}
