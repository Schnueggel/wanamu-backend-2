import mongoose from 'mongoose';
import config from '../config';
import BluePromise from 'bluebird';

mongoose.Promise = BluePromise;

const mongoUtil = {
    conn: mongoose.connection,
    open(dbPostFix='') {
        return new BluePromise((resolve) => {
            mongoose.connect(config.WU_MONGO + dbPostFix, {
                autoIndex: config.WU_MONGO_AUTOINDEX
            }, resolve);
        });
    },
    drop() {
        return new BluePromise((resolve, reject) => {
            mongoose.connection.db.collections().then(function (colls) {
                const promises = [];
                colls.forEach((e) => {
                    if(e.s.name.indexOf('System.') === -1 && e.s.name.indexOf('system.') === -1) {
                        promises.push(mongoose.connection.db.dropCollection(e.s.name));
                    }
                });
                BluePromise.all(promises).then(resolve).catch(reject);
            });
        });
    },
    dropCollection(coll) {
        return mongoose.connection.db.dropCollection(coll);
    }
};

export default mongoUtil;