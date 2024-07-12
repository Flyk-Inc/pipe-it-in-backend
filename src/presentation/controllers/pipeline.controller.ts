import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import { PipelineService } from '../../domain/pipelines/service/pipeline.service';
import { CreatePipelineDTO } from '../../domain/pipelines/dto/create_pipeline.dto';
import { Pipeline } from '../../domain/pipelines/code-runner/pipeline.entities';
import { PipeLineStepInfos } from '../../domain/pipelines/code-runner/pipeline_run_step.entities';

@Controller('pipeline')
export class PipelineController {
	constructor(private readonly pipelineService: PipelineService) {}

	@Post()
	async createPipeline(
		@Body() createPipelineDto: CreatePipelineDTO
	): Promise<Pipeline> {
		return this.pipelineService.createPipeline(createPipelineDto);
	}

	@Post(':pipelineId/run')
	async runPipeline(
		@Param('pipelineId', ParseIntPipe) pipelineId: number
	): Promise<void> {
		await this.pipelineService.runPipeline(pipelineId);
	}

	// get pipeline step infos
	@Get('step/:stepId/infos')
	async getPipelineStepInfos(
		@Param('stepId', ParseIntPipe) stepId: number
	): Promise<PipeLineStepInfos> {
		return this.pipelineService.getPipelineRunStepInfos(stepId);
	}
}
