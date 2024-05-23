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
import { Role } from './infrastructure/auth/roles.entities';
import { GroupController } from './presentation/controllers/groups.controller';
import { GroupService } from './domain/groups/service/groups.service';
import { Group } from './domain/groups/groups.entities';
import { GroupMember } from './domain/groups/groupMembers.entities';
import { UserFollowController } from './presentation/controllers/user-follow.controller';
import { RelationshipService } from './relationship/relationship.service';
import { UserFollows } from './domain/users/user_follows.entities';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Role, UserFollows]),
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Group]),
		TypeOrmModule.forFeature([GroupMember]),
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
		UserFollowController,
	],
	providers: [
		AppService,
		AuthService,
		UsersService,
		GroupService,
		// Passport Strategies
		LocalStrategy,
		JwtStrategy,
		RelationshipService,
	],
})
export class AppModule {}
