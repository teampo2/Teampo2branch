/**
 * Model: Address Model - An address with an attached latitude and longitude - makes lookups by location easy
 */

var dbInstance = require("./database/dbInstance");

var EmailSchema = new dbInstance.Schema({
    To: { type: String, index: true }, //Home, work, office1, office2 etc
    Subject: { type: String },
    Message: { type: String },
    To: { type: String },
    Status: { type: String },
	Attachment: { type: String },
	
    
},
 {
  strict: true
});
 
EmailSchema.index (
  {
    Coordinates: "2d"
  }
);

EmailSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);


var Email = dbInstance.mongoose.model("Email", EmailSchema);


module.exports.Email = Email;
