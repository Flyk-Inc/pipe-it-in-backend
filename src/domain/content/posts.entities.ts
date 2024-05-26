import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entities';

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

	// @OneToMany(() => Comment, comment => comment.post)
	// comments: Comment[];
	//
	// @OneToMany(() => Like, like => like.post)
	// likes: Like[];
	//
	// @OneToMany(() => Tag, tag => tag.post)
	// tags: Tag[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
