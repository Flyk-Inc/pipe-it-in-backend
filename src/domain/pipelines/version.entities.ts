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

	@ManyToOne(() => Code, code => code.versions, { eager: false })
	code: Code;

	@Column({ type: 'text' })
	codeContent: string;

	@OneToMany(
		() => InputDescription,
		inputDescription => inputDescription.version,
		{ eager: true }
	)
	input: InputDescription[];

	@OneToMany(
		() => OutputDescription,
		outputDescription => outputDescription.version,
		{ eager: true }
	)
	output: OutputDescription[];

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

	toJSON() {
		return {
			id: this.id,
			title: this.title,
			version: this.version,
			description: this.description,
			status: this.status,
			codeContent: this.codeContent,
			input: this.input,
			output: this.output,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
