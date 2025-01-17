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
import { GroupMember } from '../groupMembers.entities';
import { GroupRequest } from '../group_request.entities';
import { Posts } from '../../content/posts.entities';

@Injectable()
export class GroupService {
	constructor(
		@InjectRepository(Group) private groupRepository: Repository<Group>,
		@InjectRepository(GroupMember)
		private groupMemberRepository: Repository<GroupMember>,
		@InjectRepository(User) private userRepository: Repository<User>,
		@InjectRepository(GroupRequest)
		private groupRequestRepository: Repository<GroupRequest>,
		@InjectRepository(Posts) private postsRepository: Repository<Posts>
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
			throw new BadRequestException('User is already a member of this group');
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

		const groupRequest = new GroupRequest();
		groupRequest.requester = user;
		groupRequest.group = group;

		await this.groupRequestRepository.save(groupRequest);
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
		const group = await this.groupRepository.findOne({
			where: { id: groupId },
			relations: ['members'],
		});
		if (!group) {
			throw new NotFoundException('Group not found');
		}

		const groupMember = await this.groupMemberRepository.findOne({
			where: { groupId: groupId, userId: userId },
		});
		if (!groupMember) {
			throw new BadRequestException('User is not a member of this group');
		}

		await this.groupMemberRepository.remove(groupMember);

		// Check if the user was the admin
		if (groupMember.isAdmin) {
			// Get the remaining members sorted by join date
			const remainingMembers = await this.groupMemberRepository.find({
				where: { groupId: groupId },
				order: { joinedAt: 'ASC' },
			});

			if (remainingMembers.length > 0) {
				// Assign the admin role to the oldest remaining member
				const oldestMember = remainingMembers[0];
				oldestMember.isAdmin = true;
				await this.groupMemberRepository.save(oldestMember);
			}
		}

		// Check if the group has no more members
		const memberCount = await this.groupMemberRepository.count({
			where: { groupId: groupId },
		});
		if (memberCount === 0) {
			await this.groupRepository.remove(group);
		}
	}

	async getUserGroups(userId: number): Promise<Group[]> {
		const queryBuilder = this.groupRepository
			.createQueryBuilder('group')
			.leftJoinAndSelect('group.members', 'members')
			.leftJoinAndSelect('group.profilePicture', 'profilePicture')
			.leftJoinAndSelect('group.receivedGroupRequests', 'receivedGroupRequests')
			.innerJoin(
				'group.members',
				'userGroupMembers',
				'userGroupMembers.userId = :userId',
				{ userId }
			)
			.groupBy('group.id')
			.addGroupBy('profilePicture.id')
			.addGroupBy('members.id')
			.addGroupBy('receivedGroupRequests.id')
			.addSelect('COUNT(members.id)', 'memberCount');

		const rawAndEntities = await queryBuilder.getRawAndEntities();
		const { raw, entities } = rawAndEntities;

		return entities.map((entity, index) => ({
			...entity,
			memberCount: parseInt(raw[index].memberCount, 10),
		}));
	}

	async getPopularGroups(userId: number): Promise<Group[]> {
		// Subquery to find groups the user is a member of
		const subQuery = this.groupMemberRepository
			.createQueryBuilder('groupMember')
			.select('groupMember.groupId')
			.where('groupMember.userId = :userId', { userId });

		// Main query to find popular public groups, excluding groups the user is a member of
		const queryBuilder = this.groupRepository
			.createQueryBuilder('group')
			.leftJoin('group.members', 'members')
			.where('group.isPrivate = :isPrivate', { isPrivate: false })
			.andWhere(`group.id NOT IN (${subQuery.getQuery()})`)
			.groupBy('group.id')
			.orderBy('COUNT(members.id)', 'DESC')
			.addSelect('COUNT(members.id)', 'memberCount')
			.setParameter('userId', userId);

		const rawAndEntities = await queryBuilder.getRawAndEntities();
		const { raw, entities } = rawAndEntities;

		return entities.map((entity, index) => ({
			...entity,
			memberCount: parseInt(raw[index].memberCount, 10),
		}));
	}

	async getGroupById(groupId: number): Promise<Group> {
		const group = await this.groupRepository.findOne({
			where: { id: groupId },
			relations: ['members', 'profilePicture', 'receivedGroupRequests'],
		});
		if (!group) {
			throw new NotFoundException('Group not found');
		}

		// Calculate member count
		const memberCount = await this.groupMemberRepository.count({
			where: { group: { id: groupId } },
		});

		// Calculate post count
		const postCount = await this.postsRepository.count({
			where: { groupId: groupId },
		});

		group.memberCount = memberCount;
		group.postCount = postCount;

		return group;
	}
}
