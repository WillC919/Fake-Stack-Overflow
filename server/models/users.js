// Question Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    email: {type: String, required: true},
    user: {type: String, required: true},
    password: {type: String, required: true},
    
    reputation: {type: Number, default: 0},
    accType: {type: String, enum: ["Admin", "User"], default: 'User'},
    member_since: {type: Date, default: new Date()},
    
    questions: [{type: Schema.Types.ObjectId, ref: 'Questions', default: []}],
    answers: [{type: Schema.Types.ObjectId, ref: 'Answers', default: []}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments', default: []}],
    tags: [{type: Schema.Types.ObjectId, ref: 'Tags', default: []}],
});

UsersSchema.virtual('url').get(function () {
    return '/posts/users/' + this._id;
});

module.exports = mongoose.model('Users', UsersSchema);