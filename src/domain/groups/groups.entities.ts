import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entities';
import { GroupMember } from './groupMembers.entities';

@Entity({ name: 'Groups' })
export class Group {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'boolean', default: false })
	isPrivate: boolean;

	@Column({ nullable: true })
	profilePicture?: number;

	@Column({ nullable: true })
	pinnedPost?: number;

	@Column()
	creatorId: number;

	@ManyToOne(() => User, user => user.groups)
	creator: User;

	@OneToMany(() => GroupMember, groupMember => groupMember.group)
	members: GroupMember[];

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;
}
