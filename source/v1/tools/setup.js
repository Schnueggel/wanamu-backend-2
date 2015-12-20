import User from '../models/User';
import mongo from '../config/mongo';
import BluePromise from 'bluebird';

export const setUp = async function() {

    await mongo.open();
    // Wait for indexes this is important for the first test that runs.
    await User.ensureIndexes();
    await mongo.drop();

    const user = new User({
        firstname: 'Dog',
        lastname: 'Cat',
        password: '12345678',
        username: 'huhu',
        saluation: 'Mr',
        email: 'christian.steinmann.test@gmail.com'
    });

    await user.save();
    // Wait for indexes to be created if cause this user is the first after drop
    await User.ensureIndexes();
};
