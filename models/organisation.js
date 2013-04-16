/**
 * Model: Organisation Model
 */

var dbInstance = require("./database/dbInstance");

var AddressSchema = require("./address").AddressSchema;
var MemberSchema = require("./member").MemberSchema;

var OrganisationSchema = new dbInstance.Schema({
    OrgUrl:         { type: String, required: true, unique: true },       // Unique url for later exosure eg tradestek.com/Org/OrgUrl
    OwnerId:        { type: dbInstance.Schema.ObjectId, index: true },
    Name:           { type: String, required: true },
    Addresses:      [ AddressSchema ],
    Members:        [ MemberSchema ],
    AccountType:    { type: Number, default: 0 },
    AccountStatus:  { type: Number, default: 0 },
    DateCreated:    { type: Date, default: Date.now, index: true},
    DateUpdated:    { type: Date, default: Date.now, index: true},
    DateExpires:    { type: Date, index: true }
}, {
  strict: true
});

OrganisationSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Organisation = dbInstance.mongoose.model("Organisation", OrganisationSchema);

module.exports.Organisation = Organisation;
