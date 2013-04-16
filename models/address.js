/**
 * Model: Address Model - An address with an attached latitude and longitude - makes lookups by location easy
 */

var dbInstance = require("./database/dbInstance");

var AddressSchema = new dbInstance.Schema({
    MemberId: { type: dbInstance.Schema.ObjectId, index: true },
    Type: { type: String, index: true, required: true }, //Home, work, office1, office2 etc
    Address1: { type: String },
    Address2: { type: String },
    Suburb: { type: String },
    Postcode: { type: String },
    State: { type: String },
    Country: { type: String },
    Phone: { type: String },
    Coordinates: {
      xLat: { type: Number, default: 0.0 },
      yLon: { type: Number, default: 0.0 }
    },
}, {
  strict: true
});
 
AddressSchema.index (
  {
    Coordinates: "2d"
  }
);

AddressSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Address = dbInstance.mongoose.model("Address", AddressSchema);

module.exports.AddressSchema = AddressSchema;
module.exports.Address = Address;
