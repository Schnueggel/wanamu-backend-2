import mongoose from 'mongoose';
import BluePromise from 'bluebird';

export const Colors = {
    color1: 'color1',
    color2: 'color2',
    color3: 'color3',
    color4: 'color4',
    color5: 'color5'
};

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
        enum: {
            values: Object.keys(Colors),
            message: 'Invalid color {VALUE}'
        },
        default: Colors.color1
    },
    finished: {
        type: Boolean,
        default: false
    },
    parent:  {
        type: mongoose.Schema.Types.ObjectId
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    },
    shared: [mongoose.Schema.Types.ObjectId],
    accepted: {
        type: Boolean,
        default: false
    },
    todolistId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: 'Todolist id is required'
    }
}, { timestamps: true });

const Model = mongoose.model('Todo', todoSchema);

export default Model;