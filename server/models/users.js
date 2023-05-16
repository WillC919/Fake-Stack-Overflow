// Question Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    email: {type: String, required: true},
    user: {type: String, required: true},
    password: {type: String, required: true},
    reputation: {type: Number, default: 0},
    questions: [{type: Schema.Types.ObjectId, ref: 'Questions'}],
    answers: [{type: Schema.Types.ObjectId, ref: 'Answers'}],
    tags: [{type: Schema.Types.ObjectId, ref: 'Tags'}],
    member_since: {type: Date, default: new Date()},
    accType: {type: String, enum: ["Admin", "User"], default: 'User'}
});

UsersSchema.virtual('url').get(function () {
    return '/posts/users/' + this._id;
});

module.exports = mongoose.model('Users', UsersSchema);