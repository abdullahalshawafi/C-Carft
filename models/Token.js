const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TokenSchema = new mongoose.Schema({
    _userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200
    }
});

module.exports = mongoose.model('Token', TokenSchema, 'Tokens');