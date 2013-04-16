/**
 * Model: Application - Contains registered app that has valid access to our services
 */

 var dbInstance = require("./database/dbInstance");
 
 var AppSchema = new dbInstance.Schema({
    AppName:   { type: String },
    AppKey:   { type: String }
}, {
  strict: true
});

AppSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var App = dbInstance.mongoose.model("App", AppSchema);

module.exports.App = App;
