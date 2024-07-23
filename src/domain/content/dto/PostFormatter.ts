import { Posts } from '../posts.entities';
import { TimelinePost } from './TimelinePost';

export const postToTimelinePost = (post: Posts): TimelinePost => {
	return new TimelinePost(
		post.id,
		post.text,
		post.createdAt,
		post.updatedAt,
		post.user,
		post.comments.length,
		post.likes.length,
		post.version
	);
};
