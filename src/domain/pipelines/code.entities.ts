import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entities';
import { Version } from './version.entities';
import { OutputDescription } from './output_description.entities';
import { InputDescription } from './input_description.entities';
import { PipelineRunStep } from './code-runner/pipeline_run_step.entities';
import { userToMinifiedUser } from '../content/dto/UserFormatter';

@Entity({ name: 'Codes' })
export class Code {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'text' })
	description: string;

	@ManyToOne(() => User, user => user.codes)
	author: User;

	@Column({ type: 'text', default: '' })
	draft: string;

	@Column()
	language: CodeLanguages;

	@Column({ default: '' })
	versionTitleDraft: string;

	@Column({ default: '' })
	versionDescriptionDraft: string;

	@Column({ default: '' })
	versionVersionDraft: string;

	@Column()
	@Column({ default: 'active' })
	status: CodeStatus;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@OneToMany(() => Version, version => version.code)
	versions: Version[];

	@OneToMany(() => PipelineRunStep, testResult => testResult.code)
	testRuns: PipelineRunStep[];

	@OneToMany(() => InputDescription, inputDescription => inputDescription.code)
	input: InputDescription[];

	@OneToMany(
		() => OutputDescription,
		outputDescription => outputDescription.code
	)
	output: OutputDescription[];

	toJSON() {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			author: userToMinifiedUser(this.author),
			versionDraft: {
				title: this.versionTitleDraft,
				version: this.versionVersionDraft,
				description: this.versionDescriptionDraft,
			},
			language: this.language,
			draft: this.draft,
			input: this.input,
			output: this.output,
			versions: this.versions
				? this.versions.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
				: [],
			testRuns: this.testRuns
				? this.testRuns.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
				: [],
			status: this.status,
			createAt: this.createdAt,
			updateAt: this.updatedAt,
		};
	}
}

export enum CodeLanguages {
	python = 'python',
	javascript = 'javascript',
}

export enum CodeStatus {
	active = 'active',
	hidden = 'hidden',
}
