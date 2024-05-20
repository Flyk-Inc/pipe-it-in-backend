import {
	Body,
	Controller,
	Delete,
	Get,
	InternalServerErrorException,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CreateGroupDTO } from '../../domain/groups/dto/createGroupDTO';
import { UpdateGroupDTO } from '../../domain/groups/dto/updateGroupDTO';
import { GroupService } from '../../domain/groups/service/groups.service';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
	constructor(private groupService: GroupService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	@ApiOperation({ summary: 'Create a new group' })
	@ApiBody({
		type: CreateGroupDTO,
		description: 'Details of the group to be created',
	})
	@ApiResponse({
		status: 201,
		description: 'The group has been successfully created.',
	})
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async createGroup(
		@Request() req: SignedInRequest,
		@Body() createGroupDTO: CreateGroupDTO
	) {
		try {
			const userId = req.user.userId;
			return await this.groupService.createGroup(userId, createGroupDTO);
		} catch (error) {
			throw new InternalServerErrorException('Internal server error');
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post(':groupId/join')
	@ApiOperation({ summary: 'Join a group' })
	@ApiResponse({ status: 200, description: 'Successfully joined the group.' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async joinGroup(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number
	) {
		try {
			const userId = req.user.userId;
			return await this.groupService.joinGroup(userId, groupId);
		} catch (error) {
			throw new InternalServerErrorException('Internal server error');
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post(':groupId/request-access')
	@ApiOperation({ summary: 'Request access to a private group' })
	@ApiResponse({ status: 200, description: 'Access requested successfully.' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async requestAccess(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number
	) {
		try {
			const userId = req.user.userId;
			return await this.groupService.requestAccess(userId, groupId);
		} catch (error) {
			throw new InternalServerErrorException('Internal server error');
		}
	}

	@UseGuards(JwtAuthGuard)
	@Put(':groupId')
	@ApiOperation({ summary: 'Update group details' })
	@ApiBody({
		type: UpdateGroupDTO,
		description: 'Updated details of the group',
	})
	@ApiResponse({
		status: 200,
		description: 'Group details updated successfully.',
	})
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async updateGroup(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number,
		@Body() updateGroupDTO: UpdateGroupDTO
	) {
		try {
			const userId = req.user.userId;
			return await this.groupService.updateGroup(
				userId,
				groupId,
				updateGroupDTO
			);
		} catch (error) {
			throw new InternalServerErrorException('Internal server error');
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':groupId/leave')
	@ApiOperation({ summary: 'Leave a group' })
	@ApiResponse({ status: 200, description: 'Successfully left the group.' })
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async leaveGroup(
		@Request() req: SignedInRequest,
		@Param('groupId', ParseIntPipe) groupId: number
	) {
		try {
			const userId = req.user.userId;
			return await this.groupService.leaveGroup(userId, groupId);
		} catch (error) {
			throw new InternalServerErrorException('Internal server error');
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiOperation({ summary: 'Get groups of the user' })
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved user groups.',
	})
	@ApiResponse({ status: 500, description: 'Internal server error' })
	async getUserGroups(@Request() req: SignedInRequest) {
		try {
			const userId = req.user.userId;
			return await this.groupService.getUserGroups(userId);
		} catch (error) {
			throw new InternalServerErrorException('Internal server error');
		}
	}
}
