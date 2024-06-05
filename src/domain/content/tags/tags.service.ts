import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tags.entities';
import { Posts } from '../posts.entities';

@Injectable()
export class TagService {
	constructor(
		@InjectRepository(Tag)
		private tagRepository: Repository<Tag>,
		@InjectRepository(Posts)
		private postsRepository: Repository<Posts>
	) {}

	async addTagToPost(postId: number, tagName: string): Promise<Posts> {
		const post = await this.postsRepository.findOne({
			where: { id: postId },
			relations: ['tags'],
		});
		if (!post) {
			throw new NotFoundException('Post not found');
		}

		let tag = await this.tagRepository.findOne({ where: { name: tagName } });
		if (!tag) {
			tag = this.tagRepository.create({ name: tagName });
			await this.tagRepository.save(tag);
		}

		if (post.tags.some(existingTag => existingTag.name === tagName)) {
			throw new ConflictException(`Tag '${tagName}' already added to the post`);
		}

		post.tags.push(tag);
		return await this.postsRepository.save(post);
	}

	async removeTagFromPost(postId: number, tagName: string): Promise<Posts> {
		const post = await this.postsRepository.findOne({
			where: { id: postId },
			relations: ['tags'],
		});
		if (!post) {
			throw new NotFoundException('Post not found');
		}

		post.tags = post.tags.filter(tag => tag.name !== tagName);
		return await this.postsRepository.save(post);
	}

	async getPostsByTags(tagNames: string[]): Promise<Posts[]> {
		const tags = await this.tagRepository.find({
			where: tagNames.map(name => ({ name })),
			relations: ['posts'],
		});

		const postsMap = new Map<number, Posts>();
		tags.forEach(tag => {
			tag.posts.forEach(post => {
				postsMap.set(post.id, post);
			});
		});

		return Array.from(postsMap.values());
	}
}
