import { IsNotEmpty, IsString } from 'class-validator';

export class InputDescriptionDTO {
	@IsNotEmpty()
	@IsString()
	fileType: string; // This can be the extension or an identifier

	@IsNotEmpty()
	@IsString()
	description: string;
}

export class OutputDescriptionDTO {
	@IsNotEmpty()
	@IsString()
	fileType: string; // This can be the extension or an identifier

	@IsNotEmpty()
	@IsString()
	description: string;
}
