import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pipeline } from '../code-runner/pipeline.entities';
import { PipelineCode } from '../code-runner/pipeline_code.entities';
import { Version } from '../version.entities';
import { Run } from '../code-runner/run.entities';
import {
	PipelineRunStep,
	PipeLineStepInfos,
} from '../code-runner/pipeline_run_step.entities';
import {
	CreatePipelineCodeDTO,
	CreatePipelineDTO,
} from '../dto/create_pipeline.dto';
import { EndPipelineStepDTO } from '../dto/end_pipeline_step.dto';
import { RabbitMQService } from '../../../infrastructure/messaging/rabbitmq.service';
import * as process from 'node:process';
import { RunTestCodeDTO } from '../dto/run_test_code.dto';
import { Code } from '../code.entities';

@Injectable()
export class PipelineService {
	constructor(
		@InjectRepository(Pipeline)
		private pipelineRepository: Repository<Pipeline>,
		@InjectRepository(PipelineCode)
		private pipelineCodeRepository: Repository<PipelineCode>,
		@InjectRepository(Code)
		private codeRepository: Repository<Code>,
		@InjectRepository(Version)
		private versionRepository: Repository<Version>,
		@InjectRepository(Run)
		private runRepository: Repository<Run>,
		@InjectRepository(PipelineRunStep)
		private pipelineRunStepRepository: Repository<PipelineRunStep>,
		private readonly rabbitMQService: RabbitMQService
	) {}

	async createPipeline(
		createPipelineDto: CreatePipelineDTO
	): Promise<Pipeline> {
		const pipeline = this.pipelineRepository.create({
			title: createPipelineDto.title,
			description: createPipelineDto.description,
			pipelineCodes: [],
		});

		const savedPipeline = await this.pipelineRepository.save(pipeline);

		if (createPipelineDto.pipelineCodes) {
			const pipelineCodes = await Promise.all(
				createPipelineDto.pipelineCodes.map(
					async (pipelineCodeDto: CreatePipelineCodeDTO, index: number) => {
						const version = await this.versionRepository.findOne({
							where: { id: pipelineCodeDto.code_version_id },
							relations: ['input', 'output'],
						});

						if (!version) {
							throw new NotFoundException(
								`Version with ID ${pipelineCodeDto.code_version_id} not found`
							);
						}

						if (index > 0) {
							const previousCodeVersion = await this.versionRepository.findOne({
								where: {
									id: createPipelineDto.pipelineCodes[index - 1]
										.code_version_id,
								},
								relations: ['output'],
							});

							if (!previousCodeVersion) {
								throw new NotFoundException(
									`Previous version with ID ${createPipelineDto.pipelineCodes[index - 1].code_version_id} not found`
								);
							}

							const previousOutput = previousCodeVersion.output[0];
							const currentInput = version.input[0];

							if (currentInput && !previousOutput) {
								throw new BadRequestException(
									`Pipeline step ${index + 1} requires an input of type ${currentInput.fileType.extension} but the previous step does not produce any output`
								);
							}

							if (
								previousOutput &&
								currentInput &&
								previousOutput.fileType.extension !==
									currentInput.fileType.extension
							) {
								throw new BadRequestException(
									`Pipeline step ${index + 1} input type ${currentInput.fileType.extension} does not match the output type ${previousOutput.fileType.extension} of the previous step`
								);
							}
						}

						return this.pipelineCodeRepository.create({
							version: { id: pipelineCodeDto.code_version_id },
							step: pipelineCodeDto.step,
							pipeline: savedPipeline,
						});
					}
				)
			);

			await this.pipelineCodeRepository.save(pipelineCodes);
			savedPipeline.pipelineCodes = pipelineCodes;
		}

		return this.pipelineRepository.findOne({
			where: { id: savedPipeline.id },
			relations: ['pipelineCodes'],
		});
	}

	async runPipeline(pipelineId: number, userId: number): Promise<Run> {
		const pipeline = await this.pipelineRepository.findOne({
			where: { id: pipelineId },
			relations: [
				'pipelineCodes',
				'pipelineCodes.version',
				'pipelineCodes.version.input',
				'pipelineCodes.version.code',
			],
		});

		if (!pipeline) {
			throw new NotFoundException(`Pipeline with ID ${pipelineId} not found`);
		}

		const run = this.runRepository.create({
			pipeline,
			pipelineRunSteps: [],
		});

		const savedRun = await this.runRepository.save(run);

		const pipelineRunSteps = await Promise.all(
			pipeline.pipelineCodes.map(pipelineCode => {
				return this.pipelineRunStepRepository.create({
					run: savedRun,
					step: pipelineCode.step,
					executed: false,
					error: false,
					user: { id: userId },
					needsInput: pipelineCode.version.input.length > 0,
					codeContent: pipelineCode.version.codeContent,
					language: pipelineCode.version.code.language,
				});
			})
		);

		savedRun.pipelineRunSteps =
			await this.pipelineRunStepRepository.save(pipelineRunSteps);
		savedRun.pipelineRunSteps.sort((a, b) => {
			return a.step - b.step;
		});
		await this.postToQueueService(savedRun.pipelineRunSteps[0]);

		return this.runRepository.findOne({
			where: { id: savedRun.id },
			relations: ['pipeline', 'pipelineRunSteps'],
		});
	}

	async runTestCode(
		codeId: number,
		runTestCodeDto: RunTestCodeDTO,
		fileId: string | undefined = undefined
	) {
		const code = await this.codeRepository.findOne({
			where: { id: codeId },
			relations: ['author'],
		});
		const codeRunStep = this.pipelineRunStepRepository.create({
			executed: false,
			error: false,
			needsInput: fileId !== undefined,
			inputFile: fileId ? { id: fileId } : null,
			codeContent: runTestCodeDto.codeContent,
			language: runTestCodeDto.language,
			code: { id: code.id },
			user: { id: code.author.id },
		});

		const savedStep = await this.pipelineRunStepRepository.save(codeRunStep);
		await this.postToQueueService(savedStep);
	}

	private async postToQueueService(step: PipelineRunStep): Promise<void> {
		await this.rabbitMQService.sendMessage({
			pipelineRunStepId: step.id,
			backendHost: process.env.HOST,
		});
	}

	async getPipelineRunStepInfos(stepId: number): Promise<PipeLineStepInfos> {
		const stepinfos = await this.pipelineRunStepRepository.findOne({
			where: { id: stepId },
			relations: ['inputFile'],
		});

		return {
			code: stepinfos.codeContent,
			language: stepinfos.language,
			inputFile: stepinfos.inputFile?.id,
		};
	}

	async endPipelineRunStep(
		stepId: number,
		endPipelineStepDto: EndPipelineStepDTO
	) {
		const codeRunStep = await this.pipelineRunStepRepository.findOne({
			where: { id: stepId },
			relations: ['run', 'inputFile'],
		});

		if (!codeRunStep) {
			throw new NotFoundException(`Step with ID ${stepId} not found`);
		}

		codeRunStep.executed = true;
		codeRunStep.error = endPipelineStepDto.isError;
		codeRunStep.stderr = endPipelineStepDto.stderr;
		codeRunStep.stdout = endPipelineStepDto.stdout;

		if (endPipelineStepDto.outputFileId) {
			codeRunStep.outputFile = { id: endPipelineStepDto.outputFileId } as any;
		}

		await this.pipelineRunStepRepository.save(codeRunStep);

		if (endPipelineStepDto.isError) {
			return;
		}

		if (codeRunStep.step === null || codeRunStep.run === undefined) {
			return;
		}

		const nextStep = await this.pipelineRunStepRepository.findOne({
			where: {
				run: { id: codeRunStep.run.id },
				step: codeRunStep.step + 1,
			},
		});

		if (nextStep) {
			await this.postToQueueService(nextStep);
		}
	}
}
