import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/users.entities';
import { Posts } from '../posts.entities';

@Entity('likes')
export class Like {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.likes, { eager: true })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Posts, post => post.likes, { eager: true })
	@JoinColumn({ name: 'post_id' })
	post: Posts;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
