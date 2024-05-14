import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../infrastructure/auth/roles.entities';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Direct relationship to the Role entity using ManyToMany
  @ManyToMany(() => Role, { eager: true })
  @JoinTable({ name: 'UserRoles' }) // Customize the join table name
  roles: Role[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastTokenUpdate: Date;
}
