import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups.entities';
import { User } from '../../users/users.entities';
import { CreateGroupDTO } from '../dto/createGroupDTO';
import { UpdateGroupDTO } from '../dto/UpdateGroupDTO';

@Injectable()
export class GroupService {
	constructor(
		@InjectRepository(Group) private groupRepository: Repository<Group>,
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

		const group = this.groupRepository.create(createGroupDTO);
		group.admins = [user];

		return this.groupRepository.save(group);
	}

	async joinGroup(userId: number, groupId: number): Promise<Group> {
		const user = await this.userRepository.findOneBy({ id: userId });
		const group = await this.groupRepository.findOne({
			where: { id: groupId },
			relations: ['members'],
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (!group) {
			throw new NotFoundException('Group not found');
		}

		if (group.isPrivate) {
			throw new ForbiddenException('Group is private. Request access instead.');
		}

		group.members.push(user);
		return this.groupRepository.save(group);
	}

	async requestAccess(userId: number, groupId: number): Promise<void> {
		const user = await this.userRepository.findOneBy({ id: userId });
		const group = await this.groupRepository.findOne({
			where: { id: groupId },
			relations: ['members'],
		});

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
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['adminGroups'],
		});
		const group = await this.groupRepository.findOneBy({ id: groupId });

		if (!group) {
			throw new NotFoundException('Group not found');
		}

		if (!user?.adminGroups.some(adminGroup => adminGroup.id === groupId)) {
			throw new ForbiddenException('You are not an admin of this group');
		}

		Object.assign(group, updateGroupDTO);
		return this.groupRepository.save(group);
	}

	async leaveGroup(userId: number, groupId: number): Promise<void> {
		const group = await this.groupRepository.findOne({
			where: { id: groupId },
			relations: ['members'],
		});

		if (!group) {
			throw new NotFoundException('Group not found');
		}

		group.members = group.members.filter(member => member.id !== userId);
		await this.groupRepository.save(group);
	}

	async getUserGroups(userId: number): Promise<Group[]> {
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['groups', 'adminGroups'],
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		return [...user.groups, ...user.adminGroups];
	}
}
