/**
 * Model: Location Model
 */

 var dbInstance = require("./database/dbInstance");
 
var LocationSchema = new dbInstance.Schema({
    UserId:         { type: dbInstance.Schema.ObjectId, required: true, index: true },
    Recorded:       { type: Date, default: Date.now, index: true },
    Source:         { type: String, required: true },
    Accuracy:       { type: Number, default: 0 },
    Altitude:       { type: Number, default: 0.0 },
    Bearing:        { type: Number, default: 0.0 },
    Speed:          { type: Number, default: 0.0 },
    Coordinates:    {
      xlon:           { type: Number, default: 0.0 },
      ylat:           { type: Number, default: 0.0 }
    }
}, {
    strict: true
});

LocationSchema.index (
  {
    Coordinates: "2d"
  }
);

LocationSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Location = dbInstance.mongoose.model("Location", LocationSchema);

module.exports.Location = Location;
