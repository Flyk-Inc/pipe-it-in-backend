import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from '../domain/pipelines/code.entities';
import { Repository } from 'typeorm';
import { User } from '../domain/users/users.entities';
import { CreateCodeDTO } from '../domain/pipelines/dto/createCodeDTO';
import { UpdateCodeDTO } from '../domain/pipelines/dto/updateCode.dto';
import { InputDescription } from '../domain/pipelines/input_description.entities';
import { OutputDescription } from '../domain/pipelines/output_description.entities';
import { FileTypes } from '../domain/pipelines/file_type.entities';

@Injectable()
export class CodeService {
	constructor(
		@InjectRepository(Code)
		private codeRepository: Repository<Code>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
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
			relations: ['author', 'input', 'output', 'versions'],
		});
	}
}
