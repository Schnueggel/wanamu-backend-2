import User from '../models/User';
import Todolist from '../models/Todolist';
import {Constants} from '../config/constants';

export class UserService {

    /**
     * Returns an object containg friends, invitations for a user and pending invitations of a user
     * @param {User} user
     * @returns {Array<User>}
     */
    async getFriendList(user) {
        let result;

        const friends = await User.find({
            _id: {
                $in: user.friends
            },
            friends: user._id
        }, '_id firstname lastname username avatar salutation').exec();

        //Friends that didn't accept the invitation so far

        const pending = await User.find({
            _id: {
                $in: user.friends
            },
            friends: {
                $nin: [user._id]
            }
        }, '_id username avatar').exec();

        
        pending.forEach(v => v.pending = true);
        result = friends.concat(pending);

        //Invitations that the user got

        const invitations = await User.find({
            _id: {
                $nin: user.friends
            },
            friends: user._id
        }, '_id firstname lastname username avatar salutation').exec();

        invitations.forEach(v => v.invitation = true);
        result = result.concat(invitations);

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

    /**
     * 
     * @param username
     * @returns {User}
     */
    async findUserByEmailOrUsername(username) {
        return await User.findOne({
            '$or': [{email: username.toLowerCase()}, {username: username}]
        }).exec();
    }
}

export default new UserService();
