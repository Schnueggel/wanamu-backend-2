import mongoose from 'mongoose';

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
    finishedChilds: [mongoose.Schema.Types.ObjectId],
    todolistId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: 'Todolist id is required'
    }
}, { timestamps: true });

/**
 * @namespace wu.model
 */

/**
 *
 * @name Todo
 * @extends Mongoose.Model
 * @augments todoSchema
 * @memberOf wu.model
 * @property {Mongoose.Schema.Types.ObjectId} _id
 */
const Model = mongoose.model('Todo', todoSchema);

export default Model;