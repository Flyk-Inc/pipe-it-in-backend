import {
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './users.entities';

@Entity('user_follows')
export class UserFollows {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.followers)
	@JoinColumn({ name: 'follower_id' })
	follower: User;

	@ManyToOne(() => User, user => user.followees)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
