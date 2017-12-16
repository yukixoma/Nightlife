var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ongoingSchema = new Schema ({
    bar: String,
    username: []
}, {strict: false},)

var ModelClass = mongoose.model("ongoing", ongoingSchema);

module.exports = ModelClass;