import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { PipelineService } from '../../domain/pipelines/service/pipeline.service';
import { CreatePipelineDTO } from '../../domain/pipelines/dto/create_pipeline.dto';
import { Pipeline } from '../../domain/pipelines/code-runner/pipeline.entities';
import { PipeLineStepInfos } from '../../domain/pipelines/code-runner/pipeline_run_step.entities';
import { EndPipelineStepDTO } from '../../domain/pipelines/dto/end_pipeline_step.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';

@Controller('pipeline')
export class PipelineController {
	constructor(private readonly pipelineService: PipelineService) {}

	@Post()
	async createPipeline(
		@Body() createPipelineDto: CreatePipelineDTO
	): Promise<Pipeline> {
		return this.pipelineService.createPipeline(createPipelineDto);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':pipelineId/run')
	async runPipeline(
		@Request() req: SignedInRequest,
		@Param('pipelineId', ParseIntPipe) pipelineId: number
	): Promise<void> {
		await this.pipelineService.runPipeline(pipelineId, req.user.userId);
	}

	// get pipeline step infos
	@Get('step/:stepId/infos')
	async getPipelineStepInfos(
		@Param('stepId', ParseIntPipe) stepId: number
	): Promise<PipeLineStepInfos> {
		return this.pipelineService.getPipelineRunStepInfos(stepId);
	}

	@Patch('step/:stepId/end')
	async endPipelineStep(
		@Param('stepId', ParseIntPipe) stepId: number,
		@Body() endPipelineStepDto: EndPipelineStepDTO
	) {
		await this.pipelineService.endPipelineRunStep(stepId, endPipelineStepDto);
	}
}
