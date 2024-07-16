import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from '../code.entities';
import { Version } from '../version.entities';
import { Repository } from 'typeorm';
import { User } from '../../users/users.entities';
import { CreateCodeDTO } from '../dto/createCodeDTO';
import { UpdateCodeDTO } from '../dto/updateCode.dto';
import { InputDescription } from '../input_description.entities';
import { OutputDescription } from '../output_description.entities';
import { FileTypes } from '../file_type.entities';
import { CreateVersionDTO } from '../dto/create-version.dto';
import { UpdateVersionDTO } from '../dto/update-version.dto';
import { PipelineRunStep } from '../code-runner/pipeline_run_step.entities';

@Injectable()
export class CodeService {
	constructor(
		@InjectRepository(Code)
		private codeRepository: Repository<Code>,
		@InjectRepository(Version)
		private versionRepository: Repository<Version>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(PipelineRunStep)
		private testRunRepository: Repository<PipelineRunStep>,
		@InjectRepository(InputDescription)
		private inputDescriptionRepository: Repository<InputDescription>,
		@InjectRepository(OutputDescription)
		private outputDescriptionRepository: Repository<OutputDescription>,
		@InjectRepository(FileTypes)
		private fileTypesRepository: Repository<FileTypes>
	) {}

	async createCode(
		createCodeDto: CreateCodeDTO,
		creatorId: number
	): Promise<Code> {
		const author = await this.userRepository.findOne({
			where: { id: creatorId },
		});
		if (!author) {
			throw new NotFoundException('Author not found');
		}

		const code = this.codeRepository.create({
			author,
			...createCodeDto,
			input: [],
			output: [],
		});

		const savedCode = await this.codeRepository.save(code);

		if (createCodeDto.input) {
			const input = await Promise.all(
				createCodeDto.input.map(async input => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: input.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${input.fileType} not found`
						);
					}
					return this.inputDescriptionRepository.create({
						...input,
						fileType,
						code: savedCode,
					});
				})
			);
			await this.inputDescriptionRepository.save(input);
		}

		if (createCodeDto.output) {
			const output = await Promise.all(
				createCodeDto.output.map(async output => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: output.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${output.fileType} not found`
						);
					}
					return this.outputDescriptionRepository.create({
						...output,
						fileType,
						code: savedCode,
					});
				})
			);
			await this.outputDescriptionRepository.save(output);
		}

		return this.codeRepository.findOne({
			where: { id: savedCode.id },
			relations: ['author', 'input', 'output'],
		});
	}

	async updateCode(
		id: number,
		updateCodeDto: UpdateCodeDTO,
		creatorId: number
	): Promise<Code> {
		const code = await this.codeRepository.findOne({
			where: { id },
			relations: ['author', 'input', 'output'],
		});
		if (!code) {
			throw new NotFoundException('Code not found');
		}

		if (code.author.id !== creatorId) {
			throw new ForbiddenException(
				'You are not authorized to update this code'
			);
		}

		Object.assign(code, updateCodeDto);

		const updatedCode = await this.codeRepository.save(code);

		if (updateCodeDto.input) {
			await this.inputDescriptionRepository.delete({ code: updatedCode });
			const input = await Promise.all(
				updateCodeDto.input.map(async input => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: input.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${input.fileType} not found`
						);
					}
					return this.inputDescriptionRepository.create({
						...input,
						fileType,
						code: updatedCode,
					});
				})
			);
			await this.inputDescriptionRepository.save(input);
		}

		if (updateCodeDto.output) {
			await this.outputDescriptionRepository.delete({ code: updatedCode });
			const output = await Promise.all(
				updateCodeDto.output.map(async output => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: output.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${output.fileType} not found`
						);
					}
					return this.outputDescriptionRepository.create({
						...output,
						fileType,
						code: updatedCode,
					});
				})
			);
			await this.outputDescriptionRepository.save(output);
		}

		return this.codeRepository.findOne({
			where: { id: updatedCode.id },
			relations: ['author', 'input', 'output'],
		});
	}

	async getCodesByUser(userId: number): Promise<Code[]> {
		return this.codeRepository.find({
			where: { author: { id: userId } },
			relations: {
				author: true,
				versions: { input: { fileType: true }, output: { fileType: true } },
			},
		});
	}

	async createVersion(
		codeId: number,
		createVersionDto: CreateVersionDTO
	): Promise<Version> {
		const code = await this.codeRepository.findOne({ where: { id: codeId } });
		if (!code) {
			throw new NotFoundException('Code not found');
		}

		const version = this.versionRepository.create({
			code,
			...createVersionDto,
			input: [],
			output: [],
		});

		const savedVersion = await this.versionRepository.save(version);

		if (createVersionDto.input) {
			const input = await Promise.all(
				createVersionDto.input.map(async input => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: input.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${input.fileType} not found`
						);
					}
					return this.inputDescriptionRepository.create({
						...input,
						fileType,
						version: savedVersion,
					});
				})
			);
			await this.inputDescriptionRepository.save(input);
			const inputForCodeDraft = await Promise.all(
				createVersionDto.input.map(async input => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: input.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${input.fileType} not found`
						);
					}
					await this.inputDescriptionRepository.delete({ code });
					return this.inputDescriptionRepository.create({
						...input,
						fileType,
						code,
					});
				})
			);
			await this.inputDescriptionRepository.save(inputForCodeDraft);
		}

		if (createVersionDto.output) {
			const output = await Promise.all(
				createVersionDto.output.map(async output => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: output.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${output.fileType} not found`
						);
					}
					return this.outputDescriptionRepository.create({
						...output,
						fileType,
						version: savedVersion,
					});
				})
			);
			await this.outputDescriptionRepository.save(output);
			const outputForCodeDraft = await Promise.all(
				createVersionDto.output.map(async output => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: output.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${output.fileType} not found`
						);
					}
					await this.outputDescriptionRepository.delete({ code });
					return this.outputDescriptionRepository.create({
						...output,
						fileType,
						code,
					});
				})
			);
			await this.outputDescriptionRepository.save(outputForCodeDraft);
		}

		await this.codeRepository.update(code.id, {
			draft: version.codeContent,
			versionDescriptionDraft: version.description,
			versionTitleDraft: version.title,
			versionVersionDraft: version.version,
		});

		return this.versionRepository.findOne({
			where: { id: savedVersion.id },
			relations: ['input', 'output'],
		});
	}

	async updateVersion(
		versionId: number,
		updateVersionDto: UpdateVersionDTO
	): Promise<Version> {
		const version = await this.versionRepository.findOne({
			where: { id: versionId },
			relations: ['code', 'input', 'output'],
		});
		if (!version) {
			throw new NotFoundException('Version not found');
		}

		Object.assign(version, updateVersionDto);

		const updatedVersion = await this.versionRepository.save(version);

		if (updateVersionDto.input) {
			await this.inputDescriptionRepository.delete({ version: updatedVersion });
			const input = await Promise.all(
				updateVersionDto.input.map(async input => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: input.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${input.fileType} not found`
						);
					}
					return this.inputDescriptionRepository.create({
						...input,
						fileType,
						version: updatedVersion,
					});
				})
			);
			await this.inputDescriptionRepository.save(input);
		}

		if (updateVersionDto.output) {
			await this.outputDescriptionRepository.delete({
				version: updatedVersion,
			});
			const output = await Promise.all(
				updateVersionDto.output.map(async output => {
					const fileType = await this.fileTypesRepository.findOne({
						where: { extension: output.fileType },
					});
					if (!fileType) {
						throw new NotFoundException(
							`File type with extension ${output.fileType} not found`
						);
					}
					return this.outputDescriptionRepository.create({
						...output,
						fileType,
						version: updatedVersion,
					});
				})
			);
			await this.outputDescriptionRepository.save(output);
		}

		return this.versionRepository.findOne({
			where: { id: updatedVersion.id },
			relations: ['input', 'output'],
		});
	}

	getVersionsByCode(codeId: number) {
		return this.versionRepository.find({
			where: { code: { id: codeId } },
			relations: { input: { fileType: true }, output: { fileType: true } },
		});
	}

	async getCodeDetailById(codeId: number, userId: number) {
		const code = await this.codeRepository.findOne({
			where: { id: codeId, author: { id: userId } },
			relations: {
				author: true,
				input: { fileType: true },
				output: { fileType: true },
				versions: { input: { fileType: true }, output: { fileType: true } },
				testRuns: { outputFile: true, inputFile: true },
			},
		});

		if (!code) {
			throw new NotFoundException('Code not found');
		}
		if (code.status === 'hidden' && code.author.id !== userId) {
			throw new ForbiddenException(
				'You are not authorized to access this code'
			);
		}

		return code;
	}

	async getCodeTestRuns(codeId: number, userId: number) {
		return await this.testRunRepository.find({
			where: { code: { id: codeId }, user: { id: userId } },
			relations: { inputFile: true, outputFile: true },
		});
	}
}
