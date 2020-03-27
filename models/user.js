const mongoose = require('mongoose');
const passsportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String, 
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passsportLocalMongoose);

module.exports = mongoose.model('User', userSchema);