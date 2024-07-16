import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Run } from './run.entities';
import { FileEntity } from './file.entities';
import { User } from '../../users/users.entities';
import { Code } from '../code.entities';

@Entity({ name: 'Pipeline_Run_Steps' })
export class PipelineRunStep {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Run, run => run.pipelineRunSteps)
	run?: Run;

	@Column({ nullable: true })
	step?: number;

	@Column({ default: false })
	executed: boolean;

	@Column({ default: false })
	error: boolean;

	@Column({ type: 'text', nullable: true })
	stdout?: string;

	@Column({ type: 'text', nullable: true })
	stderr?: string;

	@Column()
	needsInput: boolean;

	@ManyToOne(() => FileEntity, { nullable: true })
	inputFile?: FileEntity;

	@ManyToOne(() => FileEntity, { nullable: true })
	outputFile?: FileEntity;

	@Column({ type: 'text' })
	codeContent: string;

	@Column()
	language: string;

	@ManyToOne(() => Code, code => code.versions, { eager: false })
	code: Code;

	@ManyToOne(() => User)
	user: User;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	toJSON() {
		return {
			id: this.id,
			executed: this.executed,
			error: this.error,
			needsInput: this.needsInput,
			inputFile: this.inputFile ? this.inputFile.id : undefined,
			outputFile: this.outputFile ? this.outputFile.id : undefined,
			stderr: this.stderr,
			stdout: this.stdout,
			step: this.step ? this.step : undefined,
			createdAt: this.createdAt,
		};
	}
}

export class PipeLineStepInfos {
	inputFile: string;
	language: string;
	code: string;
}
