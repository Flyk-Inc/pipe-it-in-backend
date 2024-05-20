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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
import { User as UserEntity } from '../../domain/users/users.entities';
import { User } from '../../infrastructure/auth/user.decorator';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
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
    @User() user: UserEntity,
    @Body() createGroupDTO: CreateGroupDTO,
  ) {
    try {
      return await this.groupService.createGroup(user.id, createGroupDTO);
    } catch (e) {
      throw new InternalServerErrorException(
        'Error creating group: ' + e.message,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':groupId/join')
  @ApiOperation({ summary: 'Join a group' })
  @ApiResponse({ status: 200, description: 'Successfully joined the group.' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async joinGroup(
    @User() user: UserEntity,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    try {
      return await this.groupService.joinGroup(user.id, groupId);
    } catch (e) {
      throw new InternalServerErrorException(
        'Error joining group: ' + e.message,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':groupId/request-access')
  @ApiOperation({ summary: 'Request access to a private group' })
  @ApiResponse({ status: 200, description: 'Access requested successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async requestAccess(
    @User() user: UserEntity,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    try {
      return await this.groupService.requestAccess(user.id, groupId);
    } catch (e) {
      throw new InternalServerErrorException(
        'Error requesting access: ' + e.message,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
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
    @User() user: UserEntity,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() updateGroupDTO: UpdateGroupDTO,
  ) {
    try {
      return await this.groupService.updateGroup(
        user.id,
        groupId,
        updateGroupDTO,
      );
    } catch (e) {
      throw new InternalServerErrorException(
        'Error updating group: ' + e.message,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':groupId')
  @ApiOperation({ summary: 'Leave a group' })
  @ApiResponse({ status: 200, description: 'Successfully left the group.' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async leaveGroup(
    @User() user: UserEntity,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    try {
      return await this.groupService.leaveGroup(user.id, groupId);
    } catch (e) {
      throw new InternalServerErrorException(
        'Error leaving group: ' + e.message,
      );
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Get groups of the user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user groups.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserGroups(@User() user: UserEntity) {
    try {
      return await this.groupService.getUserGroups(user.id);
    } catch (e) {
      throw new InternalServerErrorException(
        'Error retrieving user groups: ' + e.message,
      );
    }
  }
}
