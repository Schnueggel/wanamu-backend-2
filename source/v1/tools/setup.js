import User from '../models/User';
import Todo from '../models/Todo';
import mongo from '../config/mongo';
import BluePromise from 'bluebird';
import Todolist from '../models/Todolist';
import { Constants } from '../config/constants';

export const setUp = async function() {

    await mongo.open();
    // Wait for indexes. This is important for the first test that runs.
    await User.ensureIndexes();
    await Todo.ensureIndexes();
    await mongo.drop();

    const user = new User({
        firstname: 'Dog',
        lastname: 'Cat',
        password: '12345678',
        username: 'huhu',
        saluation: 'Mr',
        email: 'christian.steinmann.test@gmail.com',
        todolists: [ new Todolist({name: Constants.defaultTodolistName, defaultList: true}) ]
    });

    const userDoc = await user.save();
    // Wait for indexes to be created because this user is the first after drop
    await User.ensureIndexes();

    const todo = new Todo({
        title: 'Test todo',
        description: 'Test description',
        todolistId: user.todolists[0]._id
    });

    const todoDoc = await todo.save();

    await Todo.ensureIndexes();

    await User.update({_id: userDoc._id, 'todolists._id': userDoc.todolists[0]._id}, {
        $addToSet: {
            'todolists.$.todos': todoDoc._id
        }
    });
};
