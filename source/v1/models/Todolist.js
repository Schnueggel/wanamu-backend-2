import mongoose from 'mongoose';

export const todolistSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is required'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    },
    todos: [mongoose.Schema.Types.ObjectId]
}, { timestamps: true });

const Model = mongoose.model('Todolist', todolistSchema);

export default Model;