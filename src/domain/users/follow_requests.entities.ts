import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './users.entities';

@Entity('follow_request')
export class FollowRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.sentFollowRequests)
	@JoinColumn({ name: 'follower_id' })
	follower: User;

	@ManyToOne(() => User, user => user.receivedFollowRequests)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ name: 'is_accepted', type: 'boolean', default: false })
	isAccepted: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
