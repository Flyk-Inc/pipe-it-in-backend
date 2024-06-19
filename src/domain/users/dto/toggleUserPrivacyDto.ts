import { IsBoolean } from 'class-validator';

export class ToggleUserPrivacyDto {
	@IsBoolean()
	isPrivate: boolean;
}
