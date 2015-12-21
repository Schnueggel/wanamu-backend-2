import mongoose from 'mongoose';
import BluePromise from 'bluebird';

export const todolistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    defaultList: {
        type: Boolean,
        default: false
    },
    todos: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true });

const Model = mongoose.model('Todolist', todolistSchema);

export default Model;