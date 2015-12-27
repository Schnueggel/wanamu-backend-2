import mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: 'Title is required'
    },
    type: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true,
        required: 'Message is required'
    },
    read:  {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true });

const Model = mongoose.model('Notification', notificationSchema);

export default Model;