import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Code } from './code.entities';
import { PipelineCode } from './code-runner/pipeline_code.entities';
import { PipelineRunStep } from './code-runner/pipeline_run_step.entities';

@Entity({ name: 'Versions' })
export class Version {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column()
	version: string;

	@Column({ type: 'text' })
	description: string;

	@Column()
	status: string;

	@ManyToOne(() => Code, code => code.versions)
	code: Code;

	@Column({ type: 'text' })
	codeContent: string;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@OneToMany(() => PipelineCode, pipelineCode => pipelineCode.version)
	pipelineCodes: PipelineCode[];

	@OneToMany(() => PipelineRunStep, pipelineRunStep => pipelineRunStep.version)
	pipelineRunSteps: PipelineRunStep[];
}
