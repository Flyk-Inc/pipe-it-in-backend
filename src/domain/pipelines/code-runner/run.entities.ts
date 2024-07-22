import {
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Pipeline } from './pipeline.entities';
import { PipelineRunStep } from './pipeline_run_step.entities';

@Entity({ name: 'Runs' })
export class Run {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Pipeline, pipeline => pipeline.runs)
	pipeline: Pipeline;

	@OneToMany(() => PipelineRunStep, pipelineRunStep => pipelineRunStep.run)
	pipelineRunSteps: PipelineRunStep[];

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	toJSON() {
		return {
			id: this.id,
			pipeline: this.pipeline,
			runReport: this.pipelineRunSteps.sort((a, b) => a.step - b.step),
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
