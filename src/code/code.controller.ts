import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { CreateCodeDTO } from '../domain/pipelines/dto/createCodeDTO';
import { Code } from '../domain/pipelines/code.entities';
import { UpdateCodeDTO } from '../domain/pipelines/dto/updateCode.dto';
import { CodeService } from './code.service';
import { SignedInRequest } from '../infrastructure/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../infrastructure/auth/guards/jwt-auth.guard';

@Controller('code')
export class CodeController {
	constructor(private readonly codeService: CodeService) {}

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
}
