import {
  BadRequestException,
  Body,
  Controller, Get,
  InternalServerErrorException,
  Post, UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from '../../domain/users/dto/createUserDTO';
import { UsersService } from '../../domain/users/service/users.service';
import { User } from '../../domain/users/users.entities';
import { AuthGuard } from '../../infrastructure/auth/auth.guards';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() user: CreateUserDTO) {
    let newUser: User;
    try {
      newUser = await this.usersService.createUser(user);
    } catch (e) {
      switch (e.message) {
        case 'User already exists':
          throw new BadRequestException('User with this email already exists');
        default:
          throw new InternalServerErrorException('Error creating user');
      }
    }

    return newUser;
  }

  @UseGuards(AuthGuard)
  @Get('protected')
  async thisIsProtected() {
    return 'This is a protected route';
  }
}
