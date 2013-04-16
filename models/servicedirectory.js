var dbInstance = require("./database/dbInstance");

var ServiceDirectorySchema = new dbInstance.Schema({
    Type:         { type: String, index: true, required: true },    //Home, work, office1, office2 etc
    SystemName:     { type: String },
    ServiceName:     { type: String },
    ServiceVersion:       { type: String },
    ServiceURL:     { type: String },
	},
   {
  strict: true
});
 


ServiceDirectorySchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Service = dbInstance.mongoose.model("Service", ServiceDirectorySchema);

module.exports.Service = Service;
