import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDTO {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	@MinLength(6)
	password: string;

	@IsNotEmpty()
	firstName: string;

	@IsNotEmpty()
	lastName: string;

	@MinLength(3)
	@IsNotEmpty()
	username: string;
}
