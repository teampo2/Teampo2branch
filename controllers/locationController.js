var LocationModel = require("../models/location");

var Location = LocationModel.Location;

module.exports.SaveLocation = SaveLocation;
module.exports.GetAllLocations = GetAllLocations;
module.exports.GetLocationByUser = GetLocationByUser;

function SaveLocation(location, callback)
{
	var newLocation = new Location(location);
	newLocation.save(function(err){
		callback(newLocation);
	});
}

function GetAllLocations(callback)
{
	Location.find({}).exec(function(err, allLocations){
		callback(allLocations);
	});
}

function GetLocationByUser(userId, callback)
{
	Location.find({UserId: userId}).exec(function(err, locations){
		callback(locations);
	});
}