import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../infrastructure/auth/roles.entities';
import { GroupMember } from '../groups/groupMembers.entities';
import { UserFollows } from './user_follows.entities';
import { FollowRequest } from './follow_requests.entities';
import { Posts } from '../content/posts.entities';
import { Comment } from '../content/comments/comments.entities';
import { Like } from '../content/likes/likes.entities';
import { Reaction } from '../content/comments/reactions/reactions.entities';
import { Code } from '../pipelines/code.entities';
import { FileEntity } from '../pipelines/code-runner/file.entities';
import { Pipeline } from '../pipelines/code-runner/pipeline.entities';
import { GroupRequest } from '../groups/group_request.entities';

export interface MinifiedUser {
	firstName: string;
	lastName: string;
	username: string;
	id: number;
	profilePicture: { id: string };
}

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

	@Column()
	username: string;

	@ManyToOne(() => FileEntity)
	@JoinColumn({ name: 'profile_picture' })
	profilePicture: FileEntity;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@ManyToMany(() => Role, { eager: true })
	@JoinTable({ name: 'UserRoles' }) // Customize the join table name
	roles: Role[];

	@OneToMany(() => GroupMember, groupMember => groupMember.user)
	groups: GroupMember[];

	@OneToMany(() => Comment, comment => comment.user)
	comments: Comment[];

	@OneToMany(() => Reaction, reaction => reaction.user)
	reactions: Reaction[];

	@Column({ default: false })
	isPrivate: boolean;

	@Column({ nullable: true })
	description: string;

	@OneToMany(() => UserFollows, userFollow => userFollow.follower)
	following: UserFollows[];

	@OneToMany(() => UserFollows, userFollow => userFollow.user)
	followers: UserFollows[];

	@OneToMany(() => FollowRequest, followRequest => followRequest.follower)
	sentFollowRequests: FollowRequest[];

	@OneToMany(() => FollowRequest, followRequest => followRequest.user)
	receivedFollowRequests: FollowRequest[];

	@OneToMany(() => GroupRequest, groupRequest => groupRequest.requester)
	sentGroupRequests: GroupRequest[];

	@OneToMany(() => Posts, post => post.user)
	posts: Posts[];

	@OneToMany(() => Like, like => like.user)
	likes: Like[];

	@Column({ nullable: true })
	pinnedPost: number;

	@OneToMany(() => Code, code => code.author)
	codes: Code[];

	@OneToMany(() => Pipeline, pipeline => pipeline.user)
	pipelines: Pipeline[];

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	lastTokenUpdate: Date;
}
