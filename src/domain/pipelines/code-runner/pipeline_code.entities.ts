import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Version } from '../version.entities';
import { Pipeline } from './pipeline.entities';

@Entity({ name: 'Pipeline_Codes' })
export class PipelineCode {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Version, version => version.pipelineCodes)
	version: Version;

	@ManyToOne(() => Pipeline, pipeline => pipeline.pipelineCodes)
	pipeline: Pipeline;

	@Column()
	step: number;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	toJSON() {
		return {
			version: this.version,
			step: this.step,
		};
	}
}
