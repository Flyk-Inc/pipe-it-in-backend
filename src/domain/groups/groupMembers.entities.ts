import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './groups.entities';
import { User } from '../users/users.entities';

@Entity({ name: 'GroupMembers' })
export class GroupMember {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	groupId: number;

	@Column()
	userId: number;

	@ManyToOne(() => Group, group => group.members)
	group: Group;

	@ManyToOne(() => User, user => user.groups)
	user: User;

	@Column({ type: 'boolean', default: false })
	isAdmin: boolean;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	joinedAt: Date;

	@Column({ type: 'boolean', default: false })
	isBanned: boolean;
}
