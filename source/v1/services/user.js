import User from '../models/User';

export class UserService {

    /**
     * Returns an object containg friends, invitations for a user and pending invitations of a user
     * @param {User} user
     * @returns {{
     *    friends: {}
     *    pending: {}
     *    invitations: {}
     * }}
     */
    async getFriendList(user) {
        const result = {};

        result.friends = await User.find({
            _id: {
                $in: user.friends
            },
            friends: user._id
        }, '_id firstname lastname username avatar salutation').exec();

        result.pending = await User.find({
            _id: {
                $in: user.friends
            },
            friends: {
                $nin: [user._id]
            }
        }, '_id username avatar').exec();

        result.invitations = await User.find({
            _id: {
                $nin: user.friends
            },
            friends: user._id
        }, '_id username avatar').exec();

        return result;
    }
}

export default new UserService();
