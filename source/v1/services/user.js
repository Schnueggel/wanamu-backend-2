import User from '../models/User';
import Todolist from '../models/Todolist';
import {Constants} from '../config/constants';

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

    /**
     *
     * @param data
     * @returns {*}
     */
    async createUser(data){
        let userDoc = await User.create(data);
        const todolist = await Todolist.create({name: Constants.defaultTodolistName, owner: userDoc._id});

        userDoc = await User.findByIdAndUpdate(userDoc._id, {
            defaultTodolistId: todolist._id
        }, {new:true});

        return userDoc;
    }
}

export default new UserService();
