import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Posts } from '../posts.entities';

@Entity('tags')
export class Tag {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany(() => Posts, post => post.tags)
	posts: Posts[];
}
