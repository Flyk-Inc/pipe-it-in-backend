import { Injectable } from '@nestjs/common';
import { User } from '../users.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../dto/createUserDTO';
import { Role } from '../../../infrastructure/auth/roles.entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async createUser(userToCreate: CreateUserDTO): Promise<User> {
    if (await this.getUserByEmail(userToCreate.email)) {
      throw new Error('User already exists');
    }
    const userRole = await this.rolesRepository.findOne({
      where: { name: 'user' },
    });
    return await this.usersRepository.save({
      ...userToCreate,
      roles: [userRole],
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }
}
