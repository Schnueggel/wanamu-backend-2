import mongoose from 'mongoose';
import config from '../config';
import BluePromise from 'bluebird';

mongoose.Promise = BluePromise;

const mongoUtil = {
    conn: mongoose.connection,
    open() {
        return new BluePromise((resolve) => {
            mongoose.connect(config.WU_MONGO, {
                autoIndex: config.WU_MONGO_AUTOINDEX
            }, resolve);
        });
    },
    drop() {
        return mongoose.connection.db.dropDatabase();
    },
    dropCollection(coll) {
        return mongoose.connection.db.dropCollection(coll);
    }
};

export default mongoUtil;