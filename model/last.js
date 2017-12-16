var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var lastSchema = new Schema ({
    username: String,
    last: String
}, {strict: false},)

var ModelClass = mongoose.model("last", lastSchema);

module.exports = ModelClass;