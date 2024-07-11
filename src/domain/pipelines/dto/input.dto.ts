import { IsNotEmpty, IsString } from 'class-validator';

export class InputDescriptionDTO {
	@IsNotEmpty()
	@IsString()
	fileType: string;

	@IsNotEmpty()
	@IsString()
	description: string;
}

export class OutputDescriptionDTO {
	@IsNotEmpty()
	@IsString()
	fileType: string;

	@IsNotEmpty()
	@IsString()
	description: string;
}
