import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './infrastructure/auth/auth.service';
import { UsersController } from './presentation/controllers/users.controller';
import { UsersService } from './domain/users/service/users.service';
import { User } from './domain/users/users.entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbdatasource } from './infrastructure/database/data.source';
import { LocalStrategy } from './infrastructure/auth/strategies/local.strategy';
import { AuthController } from './presentation/controllers/auth.controller';
import { jwtConstants } from './infrastructure/auth/constants';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infrastructure/auth/strategies/jwt.strategy';
import { GroupController } from './presentation/controllers/groups.controller';
import { GroupService } from './domain/groups/service/groups.service';
import { Group } from './domain/groups/groups.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Group]),
    TypeOrmModule.forRoot(dbdatasource),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [
    AppController,
    UsersController,
    AuthController,
    GroupController,
  ],
  providers: [
    AppService,
    AuthService,
    UsersService,
    GroupService,
    // Passport Strategies
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AppModule {}
