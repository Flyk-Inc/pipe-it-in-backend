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
import { RelationshipService } from './domain/users/relationship.service';
import { UserFollows } from './domain/users/user_follows.entities';
import { FollowRequest } from './domain/users/follow_requests.entities';
import { PostsController } from './presentation/controllers/posts.controller';
import { PostsService } from './domain/content/posts.service';
import { Posts } from './domain/content/posts.entities';
import { Comment } from './domain/content/comments/comments.entities';
import { CommentController } from './presentation/controllers/comments.controller';
import { CommentService } from './domain/content/comments/comments.service';
import { LikeService } from './domain/content/likes/likes.service';
import { Like } from './domain/content/likes/likes.entities';
import { Reaction } from './domain/content/comments/reactions/reactions.entities';
import { ReactionService } from './domain/content/comments/reactions/reactions.service';
import { Tag } from './domain/content/tags/tags.entities';
import { TagService } from './domain/content/tags/tags.service';
import { CodeController } from './code/code.controller';
import { CodeService } from './code/code.service';
import { Code } from './domain/pipelines/code.entities';
import { FileTypes } from './domain/pipelines/file_type.entities';
import { InputDescription } from './domain/pipelines/input_description.entities';
import { OutputDescription } from './domain/pipelines/output_description.entities';
import { Version } from './domain/pipelines/version.entities';
import { RabbitMQService } from './infrastructure/messaging/rabbitmq.service';
import { MessagesController } from './infrastructure/messaging/messages.controller';
import { ObjectStorageModule } from './infrastructure/object-storage/object-storage.module';
import { FileService } from './domain/pipelines/code-runner/file.service';
import { FileEntity } from './domain/pipelines/code-runner/file.entities';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			Role,
			UserFollows,
			FollowRequest,
			Posts,
			Tag,
			Comment,
			Like,
			Reaction,
			Group,
			GroupMember,
			Code,
			Version,
			FileTypes,
			InputDescription,
			OutputDescription,
			FileEntity,
		]),
		TypeOrmModule.forRoot(dbdatasource),
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: jwtConstants.expiresIn },
		}),
		ObjectStorageModule,
	],
	controllers: [
		AppController,
		UsersController,
		AuthController,
		GroupController,
		UserFollowController,
		PostsController,
		CommentController,
		CodeController,
		MessagesController,
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
		PostsService,
		TagService,
		CommentService,
		LikeService,
		ReactionService,
		CodeService,
		RabbitMQService,
		FileService,
	],
})
export class AppModule {}
