import mongoose from 'mongoose';

export const todolistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true });

/**
 * @namespace wu.model
 */

/**
 *
 * @name Todolist
 * @extends Mongoose.Model
 * @augments todolistSchema
 * @memberOf wu.model
 * @property {Mongoose.Types.ObjectId} _id
 * @property {Mongoose.Types.ObjectId} owner
 */
const TodolistModel = mongoose.model('Todolist', todolistSchema);

export default TodolistModel;