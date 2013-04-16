/**
 * Model: Audit Log - Contains the previous state of any record that was modified, plus who did it and when
 */

 var dbInstance = require("./database/dbInstance");
 
 var AuditSchema = new dbInstance.Schema({
    UserId:     { type: dbInstance.Schema.ObjectId, required: true, index: true },  //who did it
    Generated:  { type: Date, default: Date.now, index: true },   //when this was done
    RecordId:   { type: dbInstance.Schema.ObjectId, required: true, index: true},   //id of the record being modified/created    
    Collection: { type: String, index: true },                    //table / collection that was modifed
    Operation:  { type: String, index: true },                    //create, update, delete
    PrevState:  { type: String },                                 //Previous state as json string
    NewState:   { type: String }                                  //Ndew state as a json string
}, {
  strict: true
});

AuditSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);


var Audit = dbInstance.mongoose.model("Audit", AuditSchema);

module.exports.Audit = Audit;
