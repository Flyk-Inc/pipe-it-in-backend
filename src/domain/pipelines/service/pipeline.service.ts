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

@Injectable()
export class PipelineService {
	constructor(
		@InjectRepository(Pipeline)
		private pipelineRepository: Repository<Pipeline>,
		@InjectRepository(PipelineCode)
		private pipelineCodeRepository: Repository<PipelineCode>,
		@InjectRepository(Version)
		private versionRepository: Repository<Version>,
		@InjectRepository(Run)
		private runRepository: Repository<Run>,
		@InjectRepository(PipelineRunStep)
		private pipelineRunStepRepository: Repository<PipelineRunStep>
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

	async runPipeline(pipelineId: number): Promise<Run> {
		const pipeline = await this.pipelineRepository.findOne({
			where: { id: pipelineId },
			relations: ['pipelineCodes', 'pipelineCodes.version'],
		});

		if (!pipeline) {
			throw new NotFoundException(`Pipeline with ID ${pipelineId} not found`);
		}

		const run = this.runRepository.create({
			pipeline,
			pipelineRunSteps: [],
		});

		const savedRun = await this.runRepository.save(run);

		console.log(pipeline.pipelineCodes);
		const pipelineRunSteps = await Promise.all(
			pipeline.pipelineCodes.map(pipelineCode => {
				return this.pipelineRunStepRepository.create({
					run: savedRun,
					version: pipelineCode.version,
					step: pipelineCode.step,
					executed: false,
					error: false,
				});
			})
		);

		const savedPipelineRunSteps =
			await this.pipelineRunStepRepository.save(pipelineRunSteps);
		savedRun.pipelineRunSteps = savedPipelineRunSteps;
		console.log(savedPipelineRunSteps);
		// Stub to post the first step job to a queue service
		await this.postToQueueService(savedRun.pipelineRunSteps[0]);

		return this.runRepository.findOne({
			where: { id: savedRun.id },
			relations: ['pipeline', 'pipelineRunSteps', 'pipelineRunSteps.version'],
		});
	}

	// Stub function to simulate posting to a queue service
	private async postToQueueService(firstStep: PipelineRunStep): Promise<void> {
		console.log(
			`Posting step ${firstStep.step} of run ID ${firstStep.run.id} to the queue service`
		);
		// Implementation to post to the actual queue service would go here
	}

	async getPipelineRunStepInfos(stepId: number): Promise<PipeLineStepInfos> {
		const stepinfos = await this.pipelineRunStepRepository.findOne({
			where: { id: stepId },
			relations: ['version', 'version.code', 'inputFile'],
		});

		return {
			code: stepinfos.version.codeContent,
			language: stepinfos.version.code.language,
			inputFile: stepinfos.inputFile?.id,
		};
	}
}
