const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Slug: {
        type: String,
        default: ""
    },
    Email: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Gender: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    Bio: {
        type: String,
        default: ""
    },
    Image: {
        type: String,
        default: ""
    },
    Courses: [{
        type: Schema.Types.ObjectId,
        ref: "Course"
    }]
});

module.exports = mongoose.model('User', UserSchema, 'Users');