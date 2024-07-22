import {
	Body,
	Controller,
	Get,
	Param,
	ParseFilePipeBuilder,
	ParseIntPipe,
	Patch,
	Post,
	Request,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { PipelineService } from '../../domain/pipelines/service/pipeline.service';
import { CreatePipelineDTO } from '../../domain/pipelines/dto/create_pipeline.dto';
import { Pipeline } from '../../domain/pipelines/code-runner/pipeline.entities';
import { PipeLineStepInfos } from '../../domain/pipelines/code-runner/pipeline_run_step.entities';
import { EndPipelineStepDTO } from '../../domain/pipelines/dto/end_pipeline_step.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectStorageService } from '../../infrastructure/object-storage/object-storage.service';
import { FileService } from '../../domain/pipelines/code-runner/file.service';

@Controller('pipeline')
export class PipelineController {
	constructor(
		private readonly pipelineService: PipelineService,
		private minioService: ObjectStorageService,
		private fileService: FileService
	) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	async getPersonalPipelines(
		@Request() req: SignedInRequest
	): Promise<Pipeline[]> {
		return this.pipelineService.getPersonalPipelines(req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':pipelineId')
	async getPipelineById(
		@Request() req: SignedInRequest,
		@Param('pipelineId', ParseIntPipe) pipelineId: number
	): Promise<Pipeline> {
		return this.pipelineService.getPipelineById(pipelineId, req.user.userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post()
	async createPipeline(
		@Request() req: SignedInRequest,
		@Body() createPipelineDto: CreatePipelineDTO
	): Promise<Pipeline> {
		return this.pipelineService.createPipeline(
			createPipelineDto,
			req.user.userId
		);
	}

	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file'))
	@Post(':pipelineId/run')
	async runPipeline(
		@Request() req: SignedInRequest,
		@Param('pipelineId', ParseIntPipe) pipelineId: number,
		@UploadedFile(
			new ParseFilePipeBuilder().addMaxSizeValidator({ maxSize: 2048 }).build({
				fileIsRequired: false,
			})
		)
		file: Express.Multer.File
	): Promise<void> {
		let fileId: string | undefined = undefined;
		if (file) {
			console.log(file);
			const fileName = await this.minioService.uploadFile(file);
			const savedFile = await this.fileService.saveFile(file, fileName);
			fileId = savedFile.id;
		}
		await this.pipelineService.runPipeline(pipelineId, req.user.userId, fileId);
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
