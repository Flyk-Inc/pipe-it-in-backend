import {
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Request,
	Res,
	StreamableFile,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectStorageService } from '../../infrastructure/object-storage/object-storage.service';
import { FileService } from '../../domain/pipelines/code-runner/file.service';
import { Response } from 'express';
import { UsersService } from '../../domain/users/service/users.service';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';

@Controller('files')
export class FileController {
	constructor(
		private minioService: ObjectStorageService,
		private fileService: FileService,
		private usersService: UsersService
	) {}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async getFile(
		@Param('id') fileId: string,
		@Res({ passthrough: true }) res: Response
	) {
		console.log('coucou');
		const fileEntity = await this.fileService.getFile(fileId);
		try {
			const storageFile = await this.minioService.getFile(
				fileEntity.storagePath
			);
			res.set({
				'Content-Type': 'image/jpeg',
				'Content-Disposition': `attachment; filename="${fileId}"`,
			});
			return new StreamableFile(storageFile);
		} catch (error) {
			console.error('Error fetching file:', error);
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post()
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@Request() req: SignedInRequest,
		@UploadedFile() file: Express.Multer.File
	) {
		const fileName = await this.minioService.uploadFile(file);
		return await this.fileService.saveFile(file, fileName);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('profile-picture')
	@UseInterceptors(FileInterceptor('file'))
	async uploadProfilePicture(
		@Request() req: SignedInRequest,
		@UploadedFile() file: Express.Multer.File
	) {
		const fileName = await this.minioService.uploadFile(file);
		const fileEntity = await this.fileService.saveFile(file, fileName);
		return await this.usersService.updateUserProfile(req.user.userId, {
			profilePicture: fileEntity,
		});
	}
}
