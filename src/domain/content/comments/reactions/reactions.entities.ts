import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../users/users.entities';
import { Comment } from '../comments.entities';

@Entity('reactions')
export class Reaction {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.reactions, { eager: true })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Comment, comment => comment.reactions, { eager: true })
	@JoinColumn({ name: 'comment_id' })
	comment: Comment;

	@Column({ name: 'is_like', type: 'boolean' })
	isLike: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
