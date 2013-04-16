var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports.mongoose = mongoose;
module.exports.Schema = Schema;

var dbUri = "mongodb://127.0.0.1/tradesmate-dev";
connect();

function connect(){
	mongoose.connect(dbUri);
}

function disconnect(){mongoose.disconnect();}