import {
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Version } from './version.entities';
import { FileTypes } from './file_type.entities';

@Entity({ name: 'Output_Descriptions' })
export class Output_Description {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => FileTypes)
	fileType: FileTypes;

	@ManyToOne(() => Version)
	version: Version;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;
}
