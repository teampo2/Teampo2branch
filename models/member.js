/**
 * Model: Member Model - used to denote membership and role in something
 */

var dbInstance = require("./database/dbInstance");

var MemberSchema  = new dbInstance.Schema({
    UserId:         { type: dbInstance.Schema.ObjectId, required: true, index: true },
    Role:           { type: String, required: true }
}, {
  strict: true
});


MemberSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Member = dbInstance.mongoose.model("Member", MemberSchema);

module.exports.MemberSchema = MemberSchema;
module.exports.Member = Member;
