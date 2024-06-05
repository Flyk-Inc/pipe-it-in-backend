import { User } from '../users.entities';

export const userToTimelineUser = (user: User) => {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
	};
};
