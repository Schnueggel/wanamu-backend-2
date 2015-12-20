import mongoose from 'mongoose';

export const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: 'Username is required'
    },
    password: {
        type: String,
        required: 'Lastname is required'
    }
});


const Model = mongoose.model('Login', loginSchema);

export default Model;