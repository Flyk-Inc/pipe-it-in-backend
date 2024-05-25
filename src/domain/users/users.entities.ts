import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../infrastructure/auth/roles.entities';
import { GroupMember } from '../groups/groupMembers.entities';
import { UserFollows } from './user_follows.entities';
import { FollowRequest } from './follow_requests.entities';

@Entity({ name: 'Users' })
export class User {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	email: string;

	@Column()
	password: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@ManyToMany(() => Role, { eager: true })
	@JoinTable({ name: 'UserRoles' }) // Customize the join table name
	roles: Role[];

	@OneToMany(() => GroupMember, groupMember => groupMember.user)
	groups: GroupMember[];

	@Column({ default: false })
	isPrivate: boolean;

	@OneToMany(() => UserFollows, userFollow => userFollow.follower)
	following: UserFollows[];

	@OneToMany(() => UserFollows, userFollow => userFollow.user)
	followers: UserFollows[];

	@OneToMany(() => FollowRequest, followRequest => followRequest.follower)
	sentFollowRequests: FollowRequest[];

	@OneToMany(() => FollowRequest, followRequest => followRequest.user)
	receivedFollowRequests: FollowRequest[];

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	lastTokenUpdate: Date;
}
