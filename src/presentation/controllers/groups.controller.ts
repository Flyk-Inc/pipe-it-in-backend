import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateGroupDTO } from '../../domain/groups/dto/createGroupDTO';
import { GroupService } from '../../domain/groups/service/groups.service';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { UpdateGroupDTO } from '../../domain/groups/dto/UpdateGroupDTO';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
	constructor(private groupService: GroupService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	async createGroup(
		@Request() req: SignedInRequest,
		@Body() createGroupDTO: CreateGroupDTO
	) {
		const userId = req.user.userId;
		return await this.groupService.createGroup(userId, createGroupDTO);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':groupId/join')
	async joinGroup(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number
	) {
		const userId = req.user.userId;
		return await this.groupService.joinGroup(userId, groupId);
	}

	@UseGuards(JwtAuthGuard)
	@Post(':groupId/request-access')
	async requestAccess(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number
	) {
		const userId = req.user.userId;
		return await this.groupService.requestAccess(userId, groupId);
	}

	@UseGuards(JwtAuthGuard)
	@Put(':groupId')
	async updateGroup(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number,
		@Body() updateGroupDTO: UpdateGroupDTO
	) {
		const userId = req.user.userId;
		return await this.groupService.updateGroup(userId, groupId, updateGroupDTO);
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':groupId/leave')
	async leaveGroup(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number
	) {
		const userId = req.user.userId;
		return await this.groupService.leaveGroup(userId, groupId);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	async getUserGroups(@Request() req: SignedInRequest) {
		const userId = req.user.userId;
		return await this.groupService.getUserGroups(userId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('popular')
	async getPopularGroups(@Request() req: SignedInRequest) {
		const userId = req.user.userId;
		return await this.groupService.getPopularGroups(userId);
	}
}
