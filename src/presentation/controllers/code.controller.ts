import {
	Body,
	Controller,
	Get,
	Param,
	ParseFilePipeBuilder,
	ParseIntPipe,
	Patch,
	Post,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { CreateCodeDTO } from '../../domain/pipelines/dto/createCodeDTO';
import { Code } from '../../domain/pipelines/code.entities';
import { UpdateCodeDTO } from '../../domain/pipelines/dto/updateCode.dto';
import { CodeService } from '../../domain/pipelines/service/code.service';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { Version } from '../../domain/pipelines/version.entities';
import { CreateVersionDTO } from '../../domain/pipelines/dto/create-version.dto';
import { UpdateVersionDTO } from '../../domain/pipelines/dto/update-version.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RunTestCodeDTO } from '../../domain/pipelines/dto/run_test_code.dto';
import { PipelineService } from '../../domain/pipelines/service/pipeline.service';
import { ObjectStorageService } from '../../infrastructure/object-storage/object-storage.service';
import { FileService } from '../../domain/pipelines/code-runner/file.service';

@Controller('codes')
export class CodeController {
	constructor(
		private readonly codeService: CodeService,
		private readonly pipelineService: PipelineService,
		private minioService: ObjectStorageService,
		private fileService: FileService
	) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async createCode(
		@Body() createCodeDto: CreateCodeDTO,
		@Req() req: SignedInRequest
	): Promise<Code> {
		const userId = req.user.userId;
		return this.codeService.createCode(createCodeDto, userId);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async updateCode(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCodeDto: UpdateCodeDTO,
		@Req() req: SignedInRequest
	): Promise<Code> {
		const userId = req.user.userId;
		return this.codeService.updateCode(id, updateCodeDto, userId);
	}

	@Get('')
	@UseGuards(JwtAuthGuard)
	async getCodesByAuhtenticatedUser(
		@Req() req: SignedInRequest
	): Promise<Code[]> {
		return this.codeService.getCodesByUser(req.user.userId);
	}

	@Post(':codeId/version')
	@UseGuards(JwtAuthGuard)
	async createVersion(
		@Param('codeId', ParseIntPipe) codeId: number,
		@Body() createVersionDto: CreateVersionDTO
	): Promise<Version> {
		return this.codeService.createVersion(codeId, createVersionDto);
	}

	@Patch('version/:versionId')
	@UseGuards(JwtAuthGuard)
	async updateVersion(
		@Param('versionId', ParseIntPipe) versionId: number,
		@Body() updateVersionDto: UpdateVersionDTO
	): Promise<Version> {
		return this.codeService.updateVersion(versionId, updateVersionDto);
	}

	@Get(':codeId/versions')
	@UseGuards(JwtAuthGuard)
	async getVersionsByCode(
		@Param('codeId', ParseIntPipe) codeId: number
	): Promise<Version[]> {
		return this.codeService.getVersionsByCode(codeId);
	}

	@Get(':codeId')
	@UseGuards(JwtAuthGuard)
	async getCodeDetailById(
		@Param('codeId', ParseIntPipe) codeId: number,
		@Req() req: SignedInRequest
	): Promise<Code> {
		return this.codeService.getCodeDetailById(codeId, req.user.userId);
	}

	@Post(':codeId/test')
	@UseInterceptors(FileInterceptor('file'))
	async runTestcode(
		@Param('codeId', ParseIntPipe) codeId: number,
		@Body() runTestCodeDto: RunTestCodeDTO,
		@UploadedFile(
			new ParseFilePipeBuilder().addMaxSizeValidator({ maxSize: 2048 }).build({
				fileIsRequired: false,
			})
		)
		file: Express.Multer.File
	) {
		let fileId: string | undefined = undefined;
		if (file) {
			console.log(file);
			const fileName = await this.minioService.uploadFile(file);
			const savedFile = await this.fileService.saveFile(file, fileName);
			fileId = savedFile.id;
		}
		await this.pipelineService.runTestCode(codeId, runTestCodeDto, fileId);
	}
}
