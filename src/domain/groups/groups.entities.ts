import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { User } from '../users/users.entities';

@Entity({ name: 'Groups' })
export class Group {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	name: string;

	@Column({ nullable: true })
	description: string;

	@Column({ type: 'boolean', default: false })
	isPrivate: boolean;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;

	@ManyToMany(() => User, user => user.groups)
	@JoinTable({ name: 'GroupMembers' }) // Customize the join table name
	members: User[];

	@ManyToMany(() => User, user => user.adminGroups)
	@JoinTable({ name: 'GroupAdmins' }) // Customize the join table name
	admins: User[];
}
