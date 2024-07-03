import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'files' })
export class FileEntity {
	@PrimaryGeneratedColumn('increment')
	id: string;

	@Column()
	name: string;

	@Column()
	size: number;

	@Column({ name: 'storage_path' })
	storagePath: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;
}
