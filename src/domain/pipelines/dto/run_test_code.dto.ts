import { IsString } from 'class-validator';

export class RunTestCodeDTO {
	@IsString()
	codeContent: string;

	@IsString()
	language: string;
}
