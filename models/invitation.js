/**
 * Model: Invitation Model
 */

var dbInstance = require("./database/dbInstance");

var InvitationSchema = new dbInstance.Schema({
    OrgId:          { type: dbInstance.Schema.ObjectId, required: true, index: true }, //Which organisation
    SenderId:       { type: dbInstance.Schema.ObjectId, required: true, index: true }, //Who sent the invitation
    RecipientId:    { type: dbInstance.Schema.ObjectId, required: true, index: true }, //Who is being invited
    Status:         { type: String, required: true, index: true }, //Invitation status
    Type:           { type: String, required: true }, //Invitation type 
    DateCreated:    { type: Date, default: Date.now, index: true},
    DateSent:       { type: Date, default: Date.now},
    DateUpdated:    { type: Date, default: Date.now},
    DateExpires:    { type: Date },
    Message:        { type: String }
}, {
  strict: true
});

InvitationSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Invitation = dbInstance.mongoose.model("Invitation", InvitationSchema);

module.exports.Invitation = Invitation;
