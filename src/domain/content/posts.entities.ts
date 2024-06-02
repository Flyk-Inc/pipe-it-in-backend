import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entities';
import { Comment } from './comments/comments.entities';
import { Like } from './likes/likes.entities';
import { Tag } from './tags/tags.entities';

@Entity('posts')
export class Posts {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.posts, { eager: true })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ type: 'text' })
	text: string;

	@Column({ name: 'group_id', type: 'int', nullable: true })
	groupId: number;

	@OneToMany(() => Comment, comment => comment.post)
	comments: Comment[];

	@OneToMany(() => Like, like => like.post)
	likes: Like[];

	@ManyToMany(() => Tag, tag => tag.posts)
	@JoinTable({
		name: 'post_tags',
		joinColumn: { name: 'post_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
	})
	tags: Tag[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
