import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt } from 'class-validator';

export class EndPipelineStepDTO {
	@ApiProperty({
		description: 'Standard output of the script',
		example: 'Output text here...',
	})
	@IsString()
	stdout: string;

	@ApiProperty({
		description: 'Standard error output of the script',
		example: 'Error text here...',
	})
	@IsString()
	stderr: string;

	@ApiProperty({
		description: 'Indicates if there was an error during script execution',
		example: false,
	})
	@IsBoolean()
	isError: boolean;

	@ApiProperty({
		description: 'Output file generated by the script',
		type: 'string',
		format: 'binary',
	})
	@IsInt()
	outputFileId: number;
}
