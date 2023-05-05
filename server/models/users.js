// Question Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    email: {type: String, required: true},
    user: {type: String, required: true},
    password: {type: String, required: true},
    reputation: {type: Number, default: 0}
});

UsersSchema.virtual('url').get(function () {
    return '/posts/users/' + this._id;
});

module.exports = mongoose.model('Users', UsersSchema);