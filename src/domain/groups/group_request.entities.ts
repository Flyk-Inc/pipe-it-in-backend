import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entities';
import { Group } from './groups.entities';

@Entity('group_request')
export class GroupRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.sentGroupRequests)
	@JoinColumn({ name: 'requester_id' })
	requester: User;

	@ManyToOne(() => Group, group => group.receivedGroupRequests)
	@JoinColumn({ name: 'group_id' })
	group: Group;

	@Column({ name: 'is_accepted', type: 'boolean', default: false })
	isAccepted: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
