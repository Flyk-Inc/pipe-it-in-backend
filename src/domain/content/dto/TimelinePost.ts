import { MinifiedUser, User } from '../../users/users.entities';
import { Version } from '../../pipelines/version.entities';

export class TimelinePost {
	id: number;
	text: string;
	createdAt: Date;
	updatedAt: Date;
	user: MinifiedUser;
	comments: number;
	likes: number;
	version?: Version;

	constructor(
		id: number,
		text: string,
		createdAt: Date,
		updatedAt: Date,
		user: User,
		comments: number,
		likes: number,
		version: Version = undefined
	) {
		this.id = id;
		this.text = text;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.user = {
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			id: user.id,
			profilePicture: user.profilePicture
				? { id: user.profilePicture.id }
				: undefined,
		};
		this.comments = comments;
		this.likes = likes;
		this.version = version;
	}
}
