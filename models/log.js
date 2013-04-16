/**
 * Model: User Log
 */

 var dbInstance = require("./database/dbInstance");
 
 var LogSchema = new dbInstance.Schema({
    UserID:     { type: dbInstance.Schema.ObjectId, required: true, index: true },
    Generated:  { type: Date, required: true, index: true },
    Object:     { type: String },
    Method:     { type: String },
    Severity:   { type: String },
    Message:    { type: String }
}, {
  strict: true
});

LogSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Log = dbInstance.mongoose.model("Log", LogSchema);

module.exports.Log = Log;
