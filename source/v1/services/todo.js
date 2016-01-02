import Todo from '../models/Todo';
import Todolist from '../models/Todolist';
import User from '../models/User';
import bluebird from 'bluebird';
import mongoose from 'mongoose';

/**
 * @namespace wu.service
 */

/**
 * @class TodoServer
 * @memberOf wu.service
 */
export class TodoService {

    /**
     * Get a list of Todos
     * @param {object} [conditions]
     * @param {number} [page]
     * @param {number} [limit]
     * @param {string} [sort]
     * @returns {Promise<Array<wu.model.Todo>>}
     */
    async getTodos(conditions = {}, page = 1, limit = 100, sort = 'sorting') {
        const todos = await Todo.find(conditions).sort(sort).limit(limit).skip((page - 1) * limit).exec();
        const sharedInfo = await this.getTodosShareInfo(todos.map(v => v._id ));

        const newTodos = todos.map( v => v.toJSON()).map( v => {
            v.sharedInfo = sharedInfo[v._id];
            return v;
        });

        return await bluebird.resolve(newTodos);
    }

    /**
     * Get the count of todos for certain condition.
     * @param {object} [conditions]
     * @returns {Promise<number>}
     */
    getTodosCount(conditions = {}) {
        return Todo.count(conditions).exec();
    }

    /**
     * @name ShareInfo
     * @memberOf wu.service
     * @type object
     * @property {boolean} finished
     * @property {boolean} accepted
     * @property {string} username
     * @property {string} firstname
     * @property {string} lastname
     * @property {Mongoose.Types.ObjectId} _id todo ID
     * @property {Mongoose.Types.ObjectId} parent parent ID
     */

    /**
     * @name ShareInfoMap
     * @memberOf wu.service
     * @type object
     * @property {number} acceptedCount
     * @property {number} finishedCount
     * @property {Array<wu.service.ShareInfo>} info
     */

    /**
     * Fetches the share info for a list of todo IDs. The share information shows if a shared todo got accepted or finished and the user information
     * Result is a map of ShareInfo object grouped by parent id
     * @param {Array<Mongoose.Types.ObjectId>} todoIds
     * @returns {Object.<string,Array<wu.service.ShareInfoMap>>}
     */
    async getTodosShareInfo(todoIds) {
        if (Array.isArray(todoIds) === false) {
            throw new TypeError('Parameter todoIds must be of type array');
        }

        if (todoIds.length === 0) {
            return await bluebird.resolve({});
        }

        const todos = await Todo.find({
            parent: {
                $in: todoIds
            }
        }).exec();

        const users = await User.find({
            _id: {
                $in: todos.map(v => v.owner)
            }
        }).exec();

        const userMap = {};
        //Group by user ID
        users.forEach(v => userMap[v._id] = v);

        const sharedInfo = todos.map(v => {
            return {
                _id: v._id,
                parent: v.parent,
                username: userMap[v.owner].username,
                firstname: userMap[v.owner].firstname,
                lastname: userMap[v.owner].lastname,
                accepted: v.accepted,
                finished: v.finished
            };
        });

        const sharedInfoMap = {};

        //Group by parent and count accepted and finished
        sharedInfo.forEach(v => {
            if (sharedInfoMap[v.parent]) {
                sharedInfoMap[v.parent].info.push(v);
            } else {
                sharedInfoMap[v.parent] = {
                    acceptedCount: 0,
                    finishedCount: 0,
                    info: [v]
                };
            }

            if (v.accepted) sharedInfoMap[v.parent].acceptedCount += 1;
            if (v.finished) sharedInfoMap[v.parent].finishedCount += 1;
        });

        return await bluebird.resolve(sharedInfoMap);
    }
}

export default new TodoService();