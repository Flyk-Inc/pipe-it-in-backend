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
import { InputDescription } from './input_description.entities';
import { OutputDescription } from './output_description.entities';

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

	@OneToMany(
		() => InputDescription,
		inputDescription => inputDescription.version
	)
	inputDescriptions: InputDescription[];

	@OneToMany(
		() => OutputDescription,
		outputDescription => outputDescription.version
	)
	outputDescriptions: OutputDescription[];

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@OneToMany(() => PipelineCode, pipelineCode => pipelineCode.version, {
		eager: false,
	})
	pipelineCodes: PipelineCode[];

	@OneToMany(
		() => PipelineRunStep,
		pipelineRunStep => pipelineRunStep.version,
		{ eager: false }
	)
	pipelineRunSteps: PipelineRunStep[];
}
