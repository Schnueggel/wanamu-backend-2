'use strict';

/**
 * This script delivers some convenient functions for debugging and testing
 */

import User from '../models/User';
import Todo from '../models/Todo';
import Notification from '../models/Notification';
import mongo from '../config/mongo';
import BluePromise from 'bluebird';
import userService from '../services/user';

/**
 * Db Setup
 * @returns {*|string|Promise.<{}>}
 */
export const setupDb = async function (dbPostFix = '') {

    console.log('Start Db Setup');
    await mongo.open(dbPostFix);
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

    data.userDoc1 = await User.findByIdAndUpdate(data.userDoc1._id, {
        $addToSet: {
            friends: data.userDoc2._id
        }
    }, {new: true}).exec();

    data.userDoc2 = await User.findByIdAndUpdate(data.userDoc2._id, {
        $addToSet: {
            friends: data.userDoc1._id
        }
    }, {new: true}).exec();

    // Wait for indexes to be created because this users are the first ones after drop
    await User.ensureIndexes();

    //Create Todos

    data.todoDoc1 = await Todo.create({
        title: 'Test todo',
        description: 'Test description',
        owner: data.userDoc1._id,
        todolistId: data.userDoc1.defaultTodolistId
    });

    data.todoDoc2 = await Todo.create({
        title: data.todoDoc1.title,
        description: data.todoDoc1.description,
        owner: data.userDoc2._id,
        todolistId: data.userDoc2.defaultTodolistId,
        accepted: true,
        parent: data.todoDoc1._id
    });

    data.todoDoc3 = await Todo.create({
        title: 'Test Todo 2',
        description: 'Test Description 2',
        owner: data.userDoc1._id,
        todolistId: data.userDoc1.defaultTodolistId,
        accepted: false
    });

    data.todoDoc1 = await Todo.findByIdAndUpdate(data.todoDoc1._id, {
        $addToSet: {
            shared: data.todoDoc2._id
        }
    }, {new: true}).exec();

    await Todo.ensureIndexes();

    // Create notifications

    let notes = [];

    for (let i = 0; i < 53; i++) {
        notes.push({
            title: 'Notification',
            message: 'Message',
            owner: data.userDoc1._id,
            read: i < 25
        });
    }

    await new BluePromise((resolve, reject) => {
        Notification.collection.insert(notes, (err, doc) => {
            if (err) {
                reject(err);
            } else {
                resolve(doc);
            }
        });
    });

    await Notification.ensureIndexes();

    return await BluePromise.resolve(data);
};