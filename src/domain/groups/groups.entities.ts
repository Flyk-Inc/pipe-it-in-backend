import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entities';
import { GroupMember } from './groupMembers.entities';
import { FileEntity } from '../pipelines/code-runner/file.entities';
import { GroupRequest } from './group_request.entities';

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

	@ManyToOne(() => FileEntity)
	@JoinColumn({ name: 'profile_picture' })
	profilePicture: FileEntity;

	@Column({ nullable: true })
	pinnedPost?: number;

	@Column()
	creatorId: number;

	@ManyToOne(() => User, user => user.groups)
	creator: User;

	@OneToMany(() => GroupMember, groupMember => groupMember.group)
	members: GroupMember[];

	@OneToMany(() => GroupRequest, groupRequest => groupRequest.group)
	receivedGroupRequests: GroupRequest[];

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	memberCount?: number;
	postCount?: number;
}
