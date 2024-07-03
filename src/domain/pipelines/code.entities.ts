import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entities';
import { Version } from './version.entities';

@Entity({ name: 'Codes' })
export class Code {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'text' })
	description: string;

	@ManyToOne(() => User, user => user.codes)
	author: User;

	@Column({ type: 'text' })
	draft: string;

	@Column()
	language: string;

	@Column()
	status: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@OneToMany(() => Version, version => version.code)
	versions: Version[];
}
