import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import BluePromise from 'bluebird';
import { todolistSchema } from './Todolist';

export const Salutations = {
    Mr: 'Mr',
    Mrs: 'Mrs',
    Neutrum: 'Neutrum',
    Human: 'Human'
};

export const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        trim: true,
        required: 'Firstname is required'
    },
    lastname: {
        type: String,
        trim: true,
        required: 'Lastname is required'
    },
    salutation: {
        type: String,
        enum: {
            values: Object.keys(Salutations),
            message: 'Invalid salutation {VALUE}'
        }
    },
    username: { //Username should also stored in lowercase with unique index to make case insensitive search easy but guarantee uniqueness
        type: String,
        index: {unique: true},
        unique: true,
        trim: true,
        match: [/[a-zA-Z_-]+/, 'Username can only contain letters, numbers, _ and -'],
        required: 'A username is required'
    },
    email: {
        type: String,
        index: {unique: true},
        unique: true,
        lowercase: true,
        trim: true,
        validate: [
            (v) => /[^ @]*@[^ @]*/.test(v),
            'Invalid Email'
        ]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        minlength: [8, 'Invalid Password']
    },
    avatar: {
        type: String,
        trim: true
    },
    ignorelist: {
        type: [],
        index: true
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        index: true
    },
    defaultTodolistId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true });

userSchema.methods = {
    encryptPassword(password){
        return new BluePromise((resolve, reject) => {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            });
        });
    },
    comparePassword(password) {
        return new BluePromise((resolve, reject) => {
            bcrypt.compare(password, this.password, function (err, res) {
                if (res) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
};

userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const password = await this.encryptPassword(this.password);

        if (password instanceof Error) {
            next(password);
        } else {
            this.password = password;
            next();
        }
    }
});

/**
 * @namespace wu.model
 */

/**
 *
 * @name User
 * @extends Mongoose.Model
 * @augments userSchema
 * @memberOf wu.model
 * @property {Mongoose.Types.ObjectId} _id
 * @property {Mongoose.Types.ObjectId} owner
 */
export default mongoose.model('User', userSchema);

