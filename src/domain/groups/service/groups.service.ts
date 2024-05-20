import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups.entities';
import { User } from '../../users/users.entities';
import { CreateGroupDTO } from '../dto/createGroupDTO';
import { UpdateGroupDTO } from '../dto/UpdateGroupDTO';
import { GroupMember } from '../groupMembers.entities';

@Injectable()
export class GroupService {
	constructor(
		@InjectRepository(Group) private groupRepository: Repository<Group>,
		@InjectRepository(GroupMember)
		private groupMemberRepository: Repository<GroupMember>,
		@InjectRepository(User) private userRepository: Repository<User>
	) {}

	async createGroup(
		userId: number,
		createGroupDTO: CreateGroupDTO
	): Promise<Group> {
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const group = this.groupRepository.create({
			...createGroupDTO,
			creatorId: userId,
		});
		await this.groupRepository.save(group);

		const groupMember = this.groupMemberRepository.create({
			groupId: group.id,
			userId: userId,
			isAdmin: true,
		});
		await this.groupMemberRepository.save(groupMember);

		return group;
	}

	async joinGroup(userId: number, groupId: number): Promise<void> {
		const group = await this.groupRepository.findOneBy({ id: groupId });

		if (!group) {
			throw new NotFoundException('Group not found');
		}

		if (group.isPrivate) {
			throw new ForbiddenException('Group is private. Request access instead.');
		}

		const existingMember = await this.groupMemberRepository.findOne({
			where: { groupId: groupId, userId: userId },
		});
		if (existingMember) {
			throw new InternalServerErrorException(
				'User is already a member of this group'
			);
		}

		const groupMember = this.groupMemberRepository.create({
			groupId: groupId,
			userId: userId,
			isAdmin: false,
		});
		await this.groupMemberRepository.save(groupMember);
	}

	async requestAccess(userId: number, groupId: number): Promise<void> {
		const user = await this.userRepository.findOneBy({ id: userId });
		const group = await this.groupRepository.findOneBy({ id: groupId });

		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (!group) {
			throw new NotFoundException('Group not found');
		}

		if (!group.isPrivate) {
			throw new BadRequestException('Group is public. You can join directly.');
		}

		// Implement your logic to request access to the group
	}

	async updateGroup(
		userId: number,
		groupId: number,
		updateGroupDTO: UpdateGroupDTO
	): Promise<Group> {
		const group = await this.groupRepository.findOneBy({ id: groupId });
		if (!group) {
			throw new NotFoundException('Group not found');
		}

		const groupMember = await this.groupMemberRepository.findOne({
			where: { groupId: groupId, userId: userId },
		});
		if (!groupMember || !groupMember.isAdmin) {
			throw new ForbiddenException(
				'User does not have permission to update this group'
			);
		}

		Object.assign(group, updateGroupDTO);
		await this.groupRepository.save(group);
		return group;
	}

	async leaveGroup(userId: number, groupId: number): Promise<void> {
		const group = await this.groupRepository.findOneBy({ id: groupId });
		if (!group) {
			throw new NotFoundException('Group not found');
		}

		const groupMember = await this.groupMemberRepository.findOne({
			where: { groupId: groupId, userId: userId },
		});
		if (!groupMember) {
			throw new InternalServerErrorException(
				'User is not a member of this group'
			);
		}

		await this.groupMemberRepository.remove(groupMember);
	}

	async getUserGroups(userId: number): Promise<Group[]> {
		const groupMembers = await this.groupMemberRepository.find({
			where: { userId: userId },
			relations: ['group'],
		});
		return groupMembers.map(member => member.group);
	}
}
