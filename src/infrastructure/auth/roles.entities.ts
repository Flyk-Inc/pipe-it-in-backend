import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Roles' })
export class Role {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	name: string;

	@Column()
	description: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;
}
