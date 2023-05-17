// Question Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var QuestionsSchema = new Schema({
    title: {type: String, required: true, maxLength: 50},
    summary: {type: String, required: false},
    text: {type: String, required: true},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tags', required: true}],

    asked_by: {type: String, default: 'Anonyoums'},
    ask_date_time: {type: Date, default: new Date()},
    views: {type: Number, default: 0},

    answers: [{type: Schema.Types.ObjectId, ref: 'Answers'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments'}],
    
    upvotes: [{type: Schema.Types.ObjectId, ref: 'Users'}],
    downvotes: [{type: Schema.Types.ObjectId, ref: 'Users'}]
});

QuestionsSchema.virtual('url').get(function () {
    return '/posts/question/' + this._id;
});

module.exports = mongoose.model('Questions', QuestionsSchema);