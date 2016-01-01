import Todo from '../models/Todo';
import * as _ from 'lodash';
import mongoose from 'mongoose';

export class TodoService {

    /**
     *
     * @param {object} [conditions]
     * @param {number} [page]
     * @param {number} [limit]
     * @param {string} sort
     * @returns {Array|{index: number, input: string}|Promise|*}
     */
    getTodos(conditions={}, page=1, limit=100, sort='sorting') {
        return Todo.find(conditions).sort(sort).limit(limit).skip((page-1)*limit).exec();
    }

    getTodosCount(conditions) {
        return Todo.count(conditions).exec();
    }
}

export default new TodoService();