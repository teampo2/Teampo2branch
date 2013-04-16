/**
 * Model: Member Rates - used to determine how to charge for different things - could be role, thing etc, can be overriden per job item
 */

var dbInstance = require("./database/dbInstance");

var RatesSchema = new dbInstance.Schema({
    OrganisationId: { type: dbInstance.Schema.ObjectId, required: true, index: true },
    Role: { type: String, required: true },
    ChargeHourly: { type: Boolean, default: true },
    Rate: { type: Number, default: 0.0 }
}, {
  strict: true
});


RatesSchema.virtual('id').get( function () 
  {
    return this._id.toHexString();
  }
);

var Rates = dbInstance.mongoose.model("Rates", RatesSchema);

module.exports.RatesSchema = RatesSchema;
module.exports.Rates = Rates;
