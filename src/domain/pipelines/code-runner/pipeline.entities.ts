import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { PipelineCode } from './pipeline_code.entities';
import { Run } from './run.entities';

@Entity({ name: 'Pipelines' })
export class Pipeline {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'text' })
	description: string;

	@OneToMany(() => PipelineCode, pipelineCode => pipelineCode.pipeline, {
		cascade: true,
	})
	pipelineCodes: PipelineCode[];

	@OneToMany(() => Run, run => run.pipeline)
	runs: Run[];

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;
}
