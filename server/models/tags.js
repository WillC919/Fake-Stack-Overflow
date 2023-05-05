// Tag Document Schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TagsSchema = new Schema({
    name: {type: String, required: true, maxLength: 20},
})

TagsSchema.virtual('url').get(function () {
    return '/posts/tag/' + this._id;
});

//Export model
module.exports = mongoose.model('Tags', TagsSchema);