import { Injectable } from '@nestjs/common';
import { User } from '../users.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../dto/createUserDTO';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(userToCreate: CreateUserDTO): Promise<User> {
    if (await this.getUserByEmail(userToCreate.email)) {
      throw new Error('User already exists');
    }
    return await this.usersRepository.save(userToCreate);
  }

  async getUserByEmail(email: string): Promise<User|null> {
    return await this.usersRepository.findOne({ where: { email } });
  }
}
