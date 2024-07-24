import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
import { Code, CodeStatus } from '../code.entities';
import { UpdatePipelineDTO } from '../dto/update_pipeline.dto';
import { UserFollows } from '../../users/user_follows.entities';

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
		private readonly rabbitMQService: RabbitMQService,
		private dataSource: DataSource
	) {}

	async createPipeline(
		createPipelineDto: CreatePipelineDTO,
		userId: number
	): Promise<Pipeline> {
		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
			const pipeline = this.pipelineRepository.create({
				title: createPipelineDto.title,
				description: createPipelineDto.description,
				pipelineCodes: [],
				user: { id: userId },
			});

			const savedPipeline = await queryRunner.manager.save(pipeline);

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
								const previousCodeVersion =
									await this.versionRepository.findOne({
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

				await queryRunner.manager.save(pipelineCodes);
				savedPipeline.pipelineCodes = pipelineCodes;
			}

			await queryRunner.commitTransaction();
			return this.pipelineRepository.findOne({
				where: { id: savedPipeline.id },
				relations: ['pipelineCodes'],
			});
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw err;
		} finally {
			// you need to release a queryRunner which was manually instantiated
			await queryRunner.release();
		} /*
		const pipeline = this.pipelineRepository.create({
			title: createPipelineDto.title,
			description: createPipelineDto.description,
			pipelineCodes: [],
			user: { id: userId },
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
		});*/
	}

	async runPipeline(
		pipelineId: number,
		userId: number,
		fileId: string | undefined
	): Promise<Run> {
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

		// check if the pipeline needs input
		if (
			pipeline.pipelineCodes[0].version.input.length > 0 &&
			fileId === undefined
		) {
			throw new BadRequestException('Pipeline requires an input file');
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
		if (fileId !== undefined) {
			pipelineRunSteps.sort((a, b) => {
				return a.step - b.step;
			});
			pipelineRunSteps[0].inputFile = { id: fileId } as any;
		}

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
		let codeRunStep = await this.pipelineRunStepRepository.findOne({
			where: { id: stepId },
			relations: ['run', 'inputFile', 'outputFile'],
		});

		if (!codeRunStep) {
			throw new NotFoundException(`Step with ID ${stepId} not found`);
		}

		codeRunStep.executed = true;
		codeRunStep.error = endPipelineStepDto.isError;
		codeRunStep.stderr = endPipelineStepDto.stderr;
		codeRunStep.stdout = endPipelineStepDto.stdout;

		if (endPipelineStepDto.outputFileId) {
			codeRunStep.outputFile = {
				id: endPipelineStepDto.outputFileId.toString(),
			} as any;
		}

		await this.pipelineRunStepRepository.save(codeRunStep);
		codeRunStep = await this.pipelineRunStepRepository.findOne({
			where: { id: stepId },
			relations: ['run', 'inputFile', 'outputFile'],
		});

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
			if (nextStep.needsInput) {
				if (codeRunStep.outputFile === null) {
					nextStep.error = true;
					nextStep.stderr =
						'Output file is required and previous step did not produce any output';
					await this.pipelineRunStepRepository.save(nextStep);
					throw new BadRequestException('Output file is required');
				}
				nextStep.inputFile = {
					id: codeRunStep.outputFile.id,
				} as any;
				await this.pipelineRunStepRepository.save(nextStep);
			}
			await this.postToQueueService(nextStep);
		}
	}

	async getPersonalPipelines(userId: number) {
		return await this.pipelineRepository.find({
			where: { user: { id: userId } },
			relations: [
				'pipelineCodes',
				'pipelineCodes.version',
				'pipelineCodes.version.input',
				'pipelineCodes.version.output',
				'user',
				'user.profilePicture',
			],
			order: { createdAt: 'DESC' },
		});
	}

	getPipelineById(pipelineId: number, userId: number) {
		return this.pipelineRepository.findOne({
			where: [
				{ id: pipelineId, user: { id: userId } },
				{ id: pipelineId, status: CodeStatus.active },
			],
			relations: [
				'pipelineCodes',
				'pipelineCodes.version',
				'pipelineCodes.version.input',
				'pipelineCodes.version.output',
				'user',
				'user.profilePicture',
				'runs',
				'runs.pipelineRunSteps',
				'runs.pipelineRunSteps.inputFile',
				'runs.pipelineRunSteps.outputFile',
			],
			order: { createdAt: 'DESC' },
		});
	}

	async updatePipeline(
		pipelineId: number,
		updatePipelineDto: UpdatePipelineDTO,
		userId: number
	): Promise<Pipeline> {
		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const pipeline = await this.pipelineRepository.findOne({
				where: { id: pipelineId, user: { id: userId } },
				relations: [
					'pipelineCodes',
					'pipelineCodes.version',
					'pipelineCodes.version.input',
					'pipelineCodes.version.output',
					'user',
					'user.profilePicture',
					'runs',
					'runs.pipelineRunSteps',
					'runs.pipelineRunSteps.inputFile',
					'runs.pipelineRunSteps.outputFile',
				],
			});

			if (!pipeline) {
				throw new NotFoundException(`Pipeline with ID ${pipelineId} not found`);
			}

			// Update main pipeline properties
			pipeline.title = updatePipelineDto.title;
			pipeline.description = updatePipelineDto.description;

			await queryRunner.manager.save(pipeline);

			if (
				updatePipelineDto.pipelineCodes &&
				updatePipelineDto.pipelineCodes.length > 0
			) {
				await queryRunner.manager.remove(pipeline.pipelineCodes);

				for (const pipelineCodeDto of updatePipelineDto.pipelineCodes) {
					const version = await this.versionRepository.findOne({
						where: { id: pipelineCodeDto.code_version_id },
						relations: ['input', 'output'],
					});

					if (!version) {
						throw new NotFoundException(
							`Version with ID ${pipelineCodeDto.code_version_id} not found`
						);
					}

					const newPipelineCode = this.pipelineCodeRepository.create({
						version,
						step: pipelineCodeDto.step,
						pipeline,
					});

					await queryRunner.manager.save(newPipelineCode);
				}
			}

			await queryRunner.commitTransaction();

			return this.pipelineRepository.findOne({
				where: { id: pipelineId },
				relations: [
					'pipelineCodes',
					'pipelineCodes.version',
					'pipelineCodes.version.input',
					'pipelineCodes.version.output',
					'user',
					'user.profilePicture',
					'runs',
					'runs.pipelineRunSteps',
					'runs.pipelineRunSteps.inputFile',
					'runs.pipelineRunSteps.outputFile',
				],
			});
		} catch (err) {
			await queryRunner.rollbackTransaction();
			throw err;
		} finally {
			await queryRunner.release();
		}
	}

	async getAllRelatedPipelines(userId: number) {
		const query = this.pipelineRepository
			.createQueryBuilder('pipelines')
			.leftJoinAndSelect('pipelines.pipelineCodes', 'pipelineCodes')
			.leftJoinAndSelect('pipelineCodes.version', 'version')
			.leftJoinAndSelect('version.input', 'input')
			.leftJoinAndSelect('version.output', 'output')
			.leftJoinAndSelect('output.fileType', 'outputFileType')
			.leftJoinAndSelect('input.fileType', 'inputFileType')
			.leftJoinAndSelect('pipelines.user', 'user')
			.leftJoinAndSelect('user.profilePicture', 'profilePicture')
			.where(qb => {
				const subQuery1 = qb
					.subQuery()
					.select('c.id')
					.from(Pipeline, 'c')
					.innerJoin(UserFollows, 'uf', 'uf.user.id = c.user.id')
					.where('uf.follower.id = :userId', { userId })
					// .andWhere('c.status = :status', { status: CodeStatus.active })
					.getQuery();

				const subQuery3 = qb
					.subQuery()
					.select('c.id')
					.from(Pipeline, 'c')
					.where('c.user.id = :userId', { userId })
					.getQuery();

				return `pipelines.id IN (${subQuery1} UNION ${subQuery3})`;
			})
			.orderBy('pipelines.createdAt', 'DESC');

		const [pipelines] = await query.getManyAndCount();

		return pipelines;
	}
}
