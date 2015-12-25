import User from '../models/User';
import Todo from '../models/Todo';
import mongo from '../config/mongo';
import BluePromise from 'bluebird';
import Todolist from '../models/Todolist';
import { Constants } from '../config/constants';

export const setUp = async function() {

    console.log('Start Db Setup');
    await mongo.open();
    // Wait for indexes. This is important for the first test that runs.
    await User.ensureIndexes();
    await Todo.ensureIndexes();
    await mongo.drop();

    const data = {};

    // User 1

    const user1 = new User({
        firstname: 'Dog1',
        lastname: 'Cat1',
        password: '12345678',
        username: 'user1',
        salutation: 'Mr',
        avatar: 'http://www.my.avatar.url',
        email: 'christian.steinmann.test@gmail.com',
        todolists: [ new Todolist({name: Constants.defaultTodolistName, defaultList: true}) ]
    });

    data.userDoc1 = await user1.save();

    // User 2

    const user2 = new User({
        firstname: 'Dog2',
        lastname: 'Cat2',
        password: '12345678',
        username: 'user2',
        salutation: 'Mr',
        avatar: 'http://www.my.avatar.url',
        email: 'christian.steinmann.test2@gmail.com',
        todolists: [ new Todolist({name: Constants.defaultTodolistName, defaultList: true}) ]
    });

    data.userDoc2 = await user2.save();

    // User 3

    const user3 = new User({
        firstname: 'Dog3',
        lastname: 'Cat3',
        password: '12345678',
        username: 'user3',
        salutation: 'Mr',
        isAdmin: true,
        avatar: 'http://www.my.avatar.url',
        email: 'christian.steinmann.test3@gmail.com',
        todolists: [ new Todolist({name: Constants.defaultTodolistName, defaultList: true}) ]
    });

    data.userDoc3 = await user3.save();

    data.userDoc1 = await User.findByIdAndUpdate(data.userDoc1._id, { $addToSet: {
        friends: data.userDoc2._id
    }}, {new: true}).exec();

    data.userDoc2 = await User.findByIdAndUpdate(data.userDoc2._id, { $addToSet: {
        friends: data.userDoc1._id
    }}, {new: true}).exec();

    // Wait for indexes to be created because this users are the first ones after drop
    await User.ensureIndexes();

    const todo = new Todo({
        title: 'Test todo',
        description: 'Test description',
        owner: data.userDoc1._id,
        todolistId: data.userDoc1.todolists[0]._id
    });

    const todoDoc = await todo.save();

    await Todo.ensureIndexes();

    await User.update({_id: data.userDoc1._id, 'todolists._id': data.userDoc1.todolists[0]._id}, {
        $addToSet: {
            'todolists.$.todos': todoDoc._id
        }
    });

    return await BluePromise.resolve(data);
};
