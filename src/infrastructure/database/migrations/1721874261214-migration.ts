import { MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../../../domain/users/users.entities';
import { Role } from '../../auth/roles.entities';
import { Group } from '../../../domain/groups/groups.entities';
import { GroupMember } from '../../../domain/groups/groupMembers.entities';
import { UserFollows } from '../../../domain/users/user_follows.entities';
import { Posts } from '../../../domain/content/posts.entities';
import { Comment } from '../../../domain/content/comments/comments.entities';
import { Like } from '../../../domain/content/likes/likes.entities';
import { Reaction } from '../../../domain/content/comments/reactions/reactions.entities';
import {
	Code,
	CodeLanguages,
	CodeStatus,
} from '../../../domain/pipelines/code.entities';
import { Pipeline } from '../../../domain/pipelines/code-runner/pipeline.entities';
import { faker } from '@faker-js/faker';
import { Version } from '../../../domain/pipelines/version.entities';
import { PipelineCode } from '../../../domain/pipelines/code-runner/pipeline_code.entities';

export class Migration1721874261214 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		const userRepository = queryRunner.manager.getRepository(User);
		const roleRepository = queryRunner.manager.getRepository(Role);
		const groupRepository = queryRunner.manager.getRepository(Group);
		const groupMemberRepository =
			queryRunner.manager.getRepository(GroupMember);
		const userFollowsRepository =
			queryRunner.manager.getRepository(UserFollows);
		const postRepository = queryRunner.manager.getRepository(Posts);
		const commentRepository = queryRunner.manager.getRepository(Comment);
		const likeRepository = queryRunner.manager.getRepository(Like);
		const reactionRepository = queryRunner.manager.getRepository(Reaction);
		const codeRepository = queryRunner.manager.getRepository(Code);
		const versionRepository = queryRunner.manager.getRepository(Version);
		const pipelineRepository = queryRunner.manager.getRepository(Pipeline);
		const pipelineCodeRepository =
			queryRunner.manager.getRepository(PipelineCode);

		const roles = await roleRepository.find();

		// Create Users
		const users = [];
		for (let i = 0; i < 50; i++) {
			const user = userRepository.create({
				email: faker.internet.email(),
				password:
					'a5b4f6b9f8159ce9d26260271fbd9b9859c296e3612ef1d53e4d52fe446c2e9e', // lolalola
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				username: faker.internet.userName(),
				isActive: true,
				roles: faker.helpers.arrayElements(roles),
				isPrivate: false,
				description: faker.lorem.sentence(),
				pinnedPost: null,
			});
			users.push(user);
		}
		await userRepository.save(users);

		// Create Groups
		const groups = [];
		for (let i = 0; i < 10; i++) {
			const group = groupRepository.create({
				name: faker.company.name(),
				description: faker.lorem.paragraph(),
				isPrivate: faker.datatype.boolean(),
				pinnedPost: null,
				creator: faker.helpers.arrayElement(users),
			});
			groups.push(group);
		}
		await groupRepository.save(groups);

		// Create Group Members
		const groupMembers = [];
		groups.forEach(group => {
			const groupSize = faker.datatype.number({ min: 1, max: 7 });
			for (let i = 0; i < groupSize; i++) {
				const groupMember = groupMemberRepository.create({
					group,
					user: faker.helpers.arrayElement(users),
					isAdmin: faker.datatype.boolean(),
					isBanned: faker.datatype.boolean(),
				});
				groupMembers.push(groupMember);
			}
		});
		await groupMemberRepository.save(groupMembers);

		// Create User Follows
		const userFollows = [];
		users.forEach(user => {
			const followingCount = faker.datatype.number({ min: 5, max: 10 });
			for (let i = 0; i < followingCount; i++) {
				const following = userFollowsRepository.create({
					follower: user,
					user: faker.helpers.arrayElement(users.filter(u => u.id !== user.id)),
				});
				userFollows.push(following);
			}
		});
		await userFollowsRepository.save(userFollows);

		// Create Posts
		const posts = [];
		users.forEach(user => {
			const postCount = faker.datatype.number({ min: 3, max: 5 });
			for (let i = 0; i < postCount; i++) {
				const post = postRepository.create({
					user,
					version: null, // assuming Version entity is already populated
					text: faker.lorem.paragraph(),
					groupId: faker.helpers.arrayElement(groups).id,
				});
				posts.push(post);
			}
		});
		await postRepository.save(posts);

		// Create Comments
		const comments = [];
		posts.forEach(post => {
			const commentCount = faker.datatype.number({ min: 2, max: 5 });
			for (let i = 0; i < commentCount; i++) {
				const comment = commentRepository.create({
					user: faker.helpers.arrayElement(users),
					post,
					parent: null,
					content: faker.lorem.sentence(),
				});
				comments.push(comment);
			}
		});
		await commentRepository.save(comments);

		// Create Likes
		const likes = [];
		posts.forEach(post => {
			const likeCount = faker.datatype.number({ min: 0, max: 20 });
			for (let i = 0; i < likeCount; i++) {
				const like = likeRepository.create({
					user: faker.helpers.arrayElement(users),
					post,
				});
				likes.push(like);
			}
		});
		await likeRepository.save(likes);

		// Create Reactions
		const reactions = [];
		comments.forEach(comment => {
			const reactionCount = faker.datatype.number({ min: 0, max: 5 });
			for (let i = 0; i < reactionCount; i++) {
				const reaction = reactionRepository.create({
					user: faker.helpers.arrayElement(users),
					comment,
					isLike: faker.datatype.boolean(),
				});
				reactions.push(reaction);
			}
		});
		await reactionRepository.save(reactions);

		// Create Codes
		const codes = [];
		users.forEach(user => {
			const codeCount = faker.datatype.number({ min: 0, max: 5 });
			for (let i = 0; i < codeCount; i++) {
				const code = codeRepository.create({
					author: user,
					title: faker.lorem.sentence(),
					description: faker.lorem.sentence(),
					language: CodeLanguages.javascript,
					draft: faker.lorem.paragraph(),
				});
				codes.push(code);
			}
		});
		await codeRepository.save(codes);

		// Create version
		const versions = [];
		codes.forEach(code => {
			const version = versionRepository.create({
				code,
				version: faker.lorem.word(),
				description: faker.lorem.sentence(),
				title: faker.lorem.sentence(),
				codeContent: faker.lorem.paragraph(),
				status: CodeStatus.active,
			});
			versions.push(version);
		});
		await versionRepository.save(versions);

		// Create Pipelines
		const pipelines = [];
		users.forEach(user => {
			const pipelineCount = faker.datatype.number({ min: 0, max: 5 });
			for (let i = 0; i < pipelineCount; i++) {
				const pipeline = pipelineRepository.create({
					user,
					description: faker.lorem.sentence(),
					title: faker.lorem.sentence(),
				});
				pipelines.push(pipeline);
			}
		});
		await pipelineRepository.save(pipelines);

		const pilelineCodes = [];
		pipelines.forEach(pipeline => {
			const pipelineCode = pipelineCodeRepository.create({
				pipeline,
				version:
					versions[faker.datatype.number({ min: 0, max: versions.length - 1 })],
				step: 1,
			});
			pilelineCodes.push(pipelineCode);
		});
		await pipelineCodeRepository.save(pilelineCodes);

		console.log('Database populated successfully!');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		queryRunner.manager.getRepository(User);
	}
}
