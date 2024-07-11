import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Version } from './version.entities';
import { FileTypes } from './file_type.entities';
import { Code } from './code.entities';

@Entity({ name: 'Input_Descriptions' })
export class InputDescription {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => FileTypes, { eager: true })
	fileType: FileTypes;

	@Column()
	description: string;

	@ManyToOne(() => Version, { eager: false })
	version: Version;

	@ManyToOne(() => Code, { eager: false })
	code: Code;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	toJSON() {
		return {
			fileType: this.fileType.extension,
			description: this.description,
		};
	}
}
