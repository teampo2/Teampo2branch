/**
 * Model: Logbook Model
 */

var dbInstance = require("./database/dbInstance");
 
var LogBookSchema = new dbInstance.Schema({
    UserId:         { type: dbInstance.Schema.ObjectId, required: true, index: true },  //User that owns this log
    AssocId:        { type: dbInstance.Schema.ObjectId, index: true },  //Associated object we relate to (optional .e.g. job)
    AddressId:      { type: dbInstance.Schema.ObjectId, index: true },  //Address that this log relates to (optional)
    Started:        { type: Date, default: Date.now, index: true},  //When this log entry was started
    Ended:          { type: Date, default: Date.now, index: true},  //When this log entry ended
    DurationMS:     { type: Number, default: 0.0 }, //How long was there for in milli seconds
    Activity:       { Type: String },  //what we think they were doing
    Confidence:     { type: Number, default: 0.0 }, //how confident we are about the activity as a %
    Notes:          { Type: String },  //Any notes ?
    Source:         { Type: String }, //Where did we source the data from
    AvgAccuracy:    { type: Number, default: 0.0 }, //Average accuracy in meters
    Updates:        { type: Number, default: 0.0 }, //Average accuracy in meters
    Coordinates:    {
      xlon:           { type: Number, default: 0.0 },
      ylat:           { type: Number, default: 0.0 }
    }
    
}, {
    strict: true
});

LogBookSchema.index (
  {
    Coordinates: "2d"
  }
);

LogBookSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var LogBook = dbInstance.mongoose.model("LogBook", LogBookSchema);

module.exports.LogBook = LogBook;
