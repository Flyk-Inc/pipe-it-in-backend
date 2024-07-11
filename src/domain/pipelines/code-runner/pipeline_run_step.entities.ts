import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Run } from './run.entities';
import { Version } from '../version.entities';
import { FileEntity } from './file.entities';

@Entity({ name: 'Pipeline_Run_Steps' })
export class PipelineRunStep {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Run, run => run.pipelineRunSteps)
	run: Run;

	@ManyToOne(() => Version, version => version.pipelineRunSteps)
	version: Version;

	@Column()
	step: number;

	@Column({ default: false })
	executed: boolean;

	@Column({ default: false })
	error: boolean;

	@Column({ type: 'text' })
	stdout: string;

	@Column({ type: 'text' })
	stderr: string;

	@ManyToOne(() => FileEntity)
	inputFile: FileEntity;

	@ManyToOne(() => FileEntity)
	outputFile: FileEntity;

	@Column({ type: 'timestamp' })
	timestamps: Date;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;
}
