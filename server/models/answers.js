// Answer Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AnswersSchema = new Schema({
    text: {type: String, required: true},
    ans_by: {type: String, required: true},
    ans_date_time: {type: Date, default: new Date()},
    
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments'}],
    
    upvotes: [{type: Schema.Types.ObjectId, ref: 'Users'}],
    downvotes: [{type: Schema.Types.ObjectId, ref: 'Users'}]
});

AnswersSchema.virtual('url').get(function () {
    return '/posts/answer/' + this._id;
});

module.exports = mongoose.model('Answers', AnswersSchema);