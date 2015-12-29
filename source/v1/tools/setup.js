'use strict';

/**
 * This script delivers some convenient functions for debugging and testing
 */

import User from '../models/User';
import Todo from '../models/Todo';
import mongo from '../config/mongo';
import BluePromise from 'bluebird';
import Todolist from '../models/Todolist';
import userService from '../services/user';
import { Constants } from '../config/constants';
import http from 'http';
import v1 from '../v1';

/**
 * Db Setup
 * @returns {*|string|Promise.<{}>}
 */
export const setupDb = async function() {

    console.log('Start Db Setup');
    await mongo.open();
    // Wait for indexes. This is important for the first test that runs.
    //await User.ensureIndexes();
    //await Todo.ensureIndexes();
    await mongo.drop();

    const data = {};

    data.userDoc1 = await userService.createUser({
        firstname: 'Dog1',
        lastname: 'Cat1',
        password: '12345678',
        username: 'user1',
        salutation: 'Mr',
        avatar: 'http://www.my.avatar.url',
        email: 'christian.steinmann.test@gmail.com'
    });

    // User 2
    data.userDoc2 = await userService.createUser({
        firstname: 'Dog2',
        lastname: 'Cat2',
        password: '12345678',
        username: 'user2',
        salutation: 'Mr',
        avatar: 'http://www.my.avatar.url',
        email: 'christian.steinmann.test2@gmail.com'
    });

    // User 3
    data.userDoc3 = await userService.createUser({
        firstname: 'Dog3',
        lastname: 'Cat3',
        password: '12345678',
        username: 'user3',
        salutation: 'Mr',
        isAdmin: true,
        avatar: 'http://www.my.avatar.url',
        email: 'christian.steinmann.test3@gmail.com'
    });

    data.userDoc1 = await User.findByIdAndUpdate(data.userDoc1._id, { $addToSet: {
        friends: data.userDoc2._id
    }}, {new: true}).exec();

    data.userDoc2 = await User.findByIdAndUpdate(data.userDoc2._id, { $addToSet: {
        friends: data.userDoc1._id
    }}, {new: true}).exec();

    // Wait for indexes to be created because this users are the first ones after drop
    await User.ensureIndexes();

    const todoDoc = await Todo.create({
        title: 'Test todo',
        description: 'Test description',
        owner: data.userDoc1._id,
        todolistId: data.userDoc1.defaultTodolistId
    });

    await Todo.ensureIndexes();

    await User.update({_id: data.userDoc1._id, 'todolists._id': data.userDoc1.defaultTodolistId}, {
        $addToSet: {
            'todolists.$.todos': todoDoc._id
        }
    });

    return await BluePromise.resolve(data);
};

/**
 * Creates a server from v1
 * @param port
 * @param host
 * @param callback
 * @returns {*}
 */
export const createServer = (port, host='localhost', callback=()=>{}) => {
    const server = http.createServer();
    const app = v1.create(server);

    server.on('request', app.callback());

    server.listen(port, host, callback);

    return server;
};