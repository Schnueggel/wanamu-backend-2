import mongoose from 'mongoose';
import BluePromise from 'bluebird';

export const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: 'Title is required'
    },
    description: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    finished: {
        type: Boolean,
        default: false
    },
    parent:  {
        type: mongoose.Schema.Types.ObjectId
    },
    todolistId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: 'Todolist id is required'
    },
    shared: [mongoose.Schema.Types.ObjectId],
    editable: Boolean,
    deletedAt: {
        type: Date
    }
}, { timestamps: true });

const Model = mongoose.model('Todo', todoSchema);

export default Model;