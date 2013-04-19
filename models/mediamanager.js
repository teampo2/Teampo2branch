/**
 * Model: Media Manager Model - 
 */

var dbInstance = require("./database/dbInstance");

var MediaManagerSchema = new dbInstance.Schema({
    Id: { type: dbInstance.Schema.ObjectId, index: true },
    GUID: { type: String },
    Filename: { type: String },
    Filepath: {type:String},
    Filetype: { type: String}, //Home, work, office1, office2 etc
    Filesize: { type: String },
    Width: { type: Number },
    Height: {type: Number},
    Description: { type: String },
    Dateuploaded: { type: String },
},
    {
  strict: true
});
 
MediaManagerSchema.index (
  {
    Coordinates: "2d"
  }
);

MediaManagerSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var MediaManager = dbInstance.mongoose.model("MediaManager", MediaManagerSchema);

module.exports.MediaManagerSchema = MediaManagerSchema;
module.exports.MediaManager = MediaManager;
