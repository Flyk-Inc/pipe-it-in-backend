import { MinifiedUser, User } from '../../users/users.entities';

export const userToMinifiedUser = (user: User): MinifiedUser => {
	return {
		firstName: user.firstName,
		lastName: user.lastName,
		username: user.username,
		id: user.id,
		profilePicture: { id: user.profilePicture?.id },
	};
};
