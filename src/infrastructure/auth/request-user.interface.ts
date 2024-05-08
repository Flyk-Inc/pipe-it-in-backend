import { User } from '../../domain/users/users.entities';

export interface RequestUser extends Omit<User, 'password'> {}
