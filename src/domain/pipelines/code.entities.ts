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

	@Column({ default: 'active' })
	status: CodeStatus;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@OneToMany(() => Version, version => version.code)
	versions: Version[];

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
			author: {
				firstName: this.author.firstName,
				lastName: this.author.lastName,
				username: this.author.username,
				id: this.author.id,
			},
			language: this.language,
			draft: this.draft,
			input: this.input,
			output: this.output,
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
