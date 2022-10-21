import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    userStatus: {
        type: String,
        required: true
    },
});

const Users = mongoose.model('user', userSchema);

export {
    Users
}