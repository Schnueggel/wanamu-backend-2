import mongoose from 'mongoose';

export const Salutations = {
    Mr: 'Mr',
    Mrs: 'Mrs',
    Neutrum: 'Neutrum',
    Human: 'Human'
};

export const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    salutation: String,
    username: String,
    email: {
        type: String,
        validate: [(v) => {
            return /[^ @]*@[^ @]*/.test(v);
        }, 'Invalid Email']
    },
    password: String,
    avatar: String,
    friends: [mongoose.Schema.Types.ObjectId],
    todolists: [mongoose.Schema.Types.ObjectId],
    updated: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
    deleted: { type: Date}
});

export default mongoose.model('User', userSchema);