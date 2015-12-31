import mongoose from 'mongoose';

export const Types = {
    Info: 'Info'
};

export const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: 'Title is required'
    },
    type: {
        type: String,
        enum: {
            values: Object.keys(Types),
            message: 'Invalid notification type {VALUE}'
        },
        default: Types.Info
    },
    message: {
        type: String,
        trim: true,
        required: 'Message is required'
    },
    meta: {
        type: mongoose.Schema.Types.Mixed
    },
    read:  {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

/**
 * @namespace wu.model
 */

/**
 *
 * @name Notification
 * @extends Mongoose.Model
 * @augments notificationSchema
 * @memberOf wu.model
 * @property {Mongoose.Schema.Types.ObjectId} _id
 */
const Model = mongoose.model('Notification', notificationSchema);

export default Model;