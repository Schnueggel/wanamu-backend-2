import mongoose from 'mongoose';
import BluePromise from 'bluebird';

export const todolistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Firstname is required'
    }
}, { timestamps: true });

const Model = mongoose.model('Todolist', todolistSchema);

export default Model;