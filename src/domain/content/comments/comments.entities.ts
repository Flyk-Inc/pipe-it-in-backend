import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Posts } from '../posts.entities';
import { User } from '../../users/users.entities';
import { Reaction } from './reactions/reactions.entities';
import { userToMinifiedUser } from '../dto/UserFormatter';

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

	@OneToMany(() => Reaction, reaction => reaction.comment)
	reactions: Reaction[];

	toJSON() {
		return {
			id: this.id,
			user: this.user ? userToMinifiedUser(this.user) : null,
			post: this.post,
			parent: this.parent ?? null,
			content: this.content,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			replies: this.replies,
			reactions: this.reactions,
		};
	}
}
