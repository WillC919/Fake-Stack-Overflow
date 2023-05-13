var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentsSchema = new Schema({
    text: {type: String, required: true},
    commented_by: {type: String, default: 'Anonyoums'},
    commented_date: {type: Date, default: new Date()},
});

CommentsSchema.virtual('url').get(function () {
    return '/posts/comment/' + this._id;
});

module.exports = mongoose.model('Comments', CommentsSchema);