import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './infrastructure/auth/auth.service';
import { UsersController } from './presentation/controllers/users.controller';
import { UsersService } from './domain/users/service/users.service';
import { User } from './domain/users/users.entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbdatasource } from './infrastructure/database/data.source';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRoot(dbdatasource),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, AuthService, UsersService],
})
export class AppModule {}
