import { User } from '../../users/users.entities';

export class TimelinePost {
	id: number;
	text: string;
	createdAt: Date;
	updatedAt: Date;
	user: { firstName: string; lastName: string; username: string; id: number };
	comments: number;
	likes: number;

	constructor(
		id: number,
		text: string,
		createdAt: Date,
		updatedAt: Date,
		user: User,
		comments: number,
		likes: number
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
		};
		this.comments = comments;
		this.likes = likes;
	}
}
