/**
 * Model: Job Model
 */

var dbInstance = require("./database/dbInstance");
 
var AddressSchema = require("./address").AddressSchema;

var JobLineItemSchema = new dbInstance.Schema({
    ItemNumber:     { type: Number, required: true }, //(0,1, 2 etc)
    Description:    { type: String, required: true }, //"Prepare house for painting", "Paint lounge room"
    Value:          { type: Number, default: 0.0 },
    EstHours:       { type: Number, default: 0 },
    ActHours:       { type: Number, default: 0 },
    EstCost:        { type: Number, default: 0.0 },
    ActCost:        { type: Number, default: 0.0 },
    StartDate:      { type: Date, default: Date.now, index: true },
    EndDate:        { type: Date, default: Date.now, index: true },
    Status:         { type: String },
}, {
    strict: true
});

var JobSchema = new dbInstance.Schema({
    OrgId:          { type: dbInstance.Schema.ObjectId, required: true, index: true },      //Org that owns the job
    JobName:        { type: String },                                     //Name of the job
    JobCode:        { type: String },                                     //Job code - user defined, optional
    JobType:        { type: String },                                     //Job type - user defined, optional
    CustFirstName:  { type: String },
    CustLastName:   { type: String },
    CustEmail:      { type: String },
    CustHomePh:     { type: String },
    CustWorkPh:     { type: String },
    CustMobilePh:   { type: String },
    Address:        [ AddressSchema ],
    Status:         { type: String },
    StartDate:      { type: Date, default: Date.now, index: true },
    EndDate:        { type: Date, default: Date.now, index: true },
    LineItems:      [ JobLineItemSchema ],
    QuotedCost:     { type: Number, default: 0.0 },
    QuotedHrs:      { type: Number, default: 0.0 },
    ActualCost:     { type: Number, default: 0.0 },
    ActualHrs:      { type: Number, default: 0.0 },
}, {
    strict: true
});

JobSchema.index (
  {
    Coordinates: "2d"
  }
);

JobSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var JobLineItem = dbInstance.mongoose.model("JobLineItem", JobLineItemSchema);
var Job = dbInstance.mongoose.model("Job", JobSchema);

module.exports.JobLineItem = JobLineItem;
module.exports.Job = Job;
