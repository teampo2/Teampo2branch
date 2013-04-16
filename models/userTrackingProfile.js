/**
 * Model: Tracking Profile
 */

var dbInstance = require("./database/dbInstance");

var UserTrackingProfileSchema = new dbInstance.Schema({
    UserId:    { type: dbInstance.Schema.ObjectId, required: true, index: true }, //Who the profile is for
    OrgId:     { type: dbInstance.Schema.ObjectId, index: true }, //Which organisation this profile is for (if set)
    Mon:       { type: Boolean, default: false },
    MonFrom:   { type: Number, default: 0.0 },
    MonTo:     { type: Number, default: 0.0 },
    Tue:       { type: Boolean, default: false },
    TueFrom:   { type: Number, default: 0.0 },
    TueTo:     { type: Number, default: 0.0 },
    Wed:       { type: Boolean, default: false },
    WedFrom:   { type: Number, default: 0.0 },
    WedTo:     { type: Number, default: 0.0 },
    Thu:       { type: Boolean, default: false },
    ThuFrom:   { type: Number, default: 0.0 },
    ThuTo:     { type: Number, default: 0.0 },
    Fri:       { type: Boolean, default: false },
    FriFrom:   { type: Number, default: 0.0 },
    FriTo:     { type: Number, default: 0.0 },
    Sat:       { type: Boolean, default: false },
    SatFrom:   { type: Number, default: 0.0 },
    SatTo:     { type: Number, default: 0.0 },
    Sun:       { type: Boolean, default: false },
    SunFrom:   { type: Number, default: 0.0 },
    SunTo:     { type: Number, default: 0.0 }
}, {
  strict: true
});

UserTrackingProfileSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var UserTrackingProfile = dbInstance.mongoose.model("UserTrackingProfile", UserTrackingProfileSchema);

module.exports.UserTrackingProfile = UserTrackingProfile;
