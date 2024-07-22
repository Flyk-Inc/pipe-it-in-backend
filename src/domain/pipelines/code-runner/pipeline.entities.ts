import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
} from 'typeorm';
import { PipelineCode } from './pipeline_code.entities';
import { Run } from './run.entities';
import { User } from '../../users/users.entities';
import { userToMinifiedUser } from '../../content/dto/UserFormatter';

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

	@OneToMany(() => Run, run => run.pipeline, { cascade: ['remove'] })
	runs: Run[];

	@ManyToOne(() => User, user => user.pipelines)
	user: User;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	toJSON() {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			pipelineCodes: this.pipelineCodes
				? this.pipelineCodes.sort((a, b) => a.step - b.step)
				: [],
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
			user: this.user ? userToMinifiedUser(this.user) : undefined,
			runs: this.runs
				? this.runs.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
				: [],
		};
	}
}
