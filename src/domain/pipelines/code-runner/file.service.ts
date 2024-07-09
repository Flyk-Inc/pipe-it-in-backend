import { FileEntity } from './file.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class FileService {
	constructor(
		@InjectRepository(FileEntity)
		private fileRepository: Repository<FileEntity>
	) {}

	async saveFile(file: Express.Multer.File, storagePath: string) {
		const newFile = new FileEntity();
		newFile.name = file.originalname;
		newFile.size = file.size;
		newFile.storagePath = storagePath;
		return await this.fileRepository.save(newFile);
	}
}
