import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { Posts } from '../posts.entities';
import { User } from '../../users/users.entities';

@Entity('comments')
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.comments, { eager: true })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Posts, post => post.comments, { eager: true })
	@JoinColumn({ name: 'post_id' })
	post: Posts;

	@ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
	@JoinColumn({ name: 'parent_id' })
	parent: Comment;

	@Column({ type: 'text' })
	content: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	@OneToMany(() => Comment, comment => comment.parent)
	replies: Comment[];
}
