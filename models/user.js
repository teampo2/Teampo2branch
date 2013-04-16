/**
 * Model: User Model
 */

var dbInstance = require("./database/dbInstance");

var AddressSchema = require("./address").AddressSchema;

var UserSchema = new dbInstance.Schema({
    Username:       { type: String, required: true, unique: true },
    Password:       { type: String, required: true },
    Email:          { type: String, required: true },
    WPUserId:       { type: Number, index: true },
    PrimaryPhone:   { type: String },
    FirstName:      { type: String },
    LastName:       { type: String },
    Addresses:      [ AddressSchema ],                            // The user can define multiple addresses
    AccountType:    { type: Number, default: 0 },                 // 0 - system, 1 - admin, 2 - org, 3 - tradie, 4 - customer
    AccountStatus:  { type: Number, default: 0 },                 // 0 - Active, 1 - Disabled
    DateCreated:    { type: Date, default: Date.now, index: true},//When this account was created
    DateUpdated:    { type: Date, default: Date.now, index: true},//When it was last udpated
    DateExpires:    { type: Date, index: true}                    //When it exires
}, {
  strict: true
});

UserSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var User = dbInstance.mongoose.model("User", UserSchema);

module.exports.User = User;
