import {
	Body,
	Controller,
	Get,
	Patch,
	Request,
	Res,
	StreamableFile,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { UsersService } from '../../domain/users/service/users.service';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Role } from '../../infrastructure/auth/roles.enum';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { UpdateUserProfileDto } from '../../domain/users/dto/updateUserDTO';
import { ToggleUserPrivacyDto } from '../../domain/users/dto/toggleUserPrivacyDto';
import { PinPostDto } from '../../domain/users/dto/pinPostDTO';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectStorageService } from '../../infrastructure/object-storage/object-storage.service';
import { FileService } from '../../domain/pipelines/code-runner/file.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		private minioService: ObjectStorageService,
		private fileService: FileService
	) {}

	@UseGuards(RolesGuard)
	@UseGuards(JwtAuthGuard)
	@Roles(Role.User)
	@Get('profile')
	getProfile(@Request() req: SignedInRequest) {
		return this.usersService.getUserByEmail(req.user.email);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('profile')
	updateProfile(
		@Request() req: SignedInRequest,
		@Body() updateUserProfileDto: UpdateUserProfileDto
	) {
		return this.usersService.updateUserProfile(
			req.user.userId,
			updateUserProfileDto
		);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('profile-picture')
	@UseInterceptors(FileInterceptor('file'))
	async uploadProfilePicture(
		@Request() req: SignedInRequest,
		@UploadedFile() file: Express.Multer.File
	) {
		const fileName = await this.minioService.uploadFile(file);
		await this.fileService.saveFile(file, fileName);
		return this.usersService.updateUserProfilePicture(
			req.user.userId,
			fileName
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile-picture')
	async getProfilePicture(
		@Request() req: SignedInRequest,
		@Res({ passthrough: true }) res: Response
	) {
		const fileName = await this.usersService.getUserProfilePicture(
			req.user.userId
		);
		const file = await this.minioService.getFile(fileName);
		res.set({
			'Content-Type': 'image/jpeg',
			'Content-Disposition': `attachment; filename="${fileName}"`,
		});

		return new StreamableFile(file);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('privacy')
	togglePrivacy(
		@Request() req: SignedInRequest,
		@Body() toggleUserPrivacyDto: ToggleUserPrivacyDto
	) {
		return this.usersService.toggleUserPrivacy(
			req.user.userId,
			toggleUserPrivacyDto
		);
	}

	@UseGuards(JwtAuthGuard)
	@Patch('pin-post')
	pinPost(@Request() req: SignedInRequest, @Body() pinPostDto: PinPostDto) {
		return this.usersService.pinPost(req.user.userId, pinPostDto);
	}
}
