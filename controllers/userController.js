var UserModel = require("../models/user");
var AppModel = require("../models/app");
var stringHelper = require("../helpers/stringhelper");

var User = UserModel.User;
var App = AppModel.App;

module.exports.SyncUser = SyncUser;
module.exports.GetAllUsers = GetAllUsers;
module.exports.GetUserById = GetUserById;
module.exports.Authenticate = Authenticate;

function SyncUser(user, callback)
{
	var newUser = new User(user);
	newUser.save(function(err){
		callback(newUser);
	});
}

function GetAllUsers(callback)
{
	User.find({}).exec(function(err, allUsers){
		callback(allUsers);
	});
}

function GetUserById(userId, callback)
{
	User.find({UserId: userId}).exec(function(err, user){
		callback(user);
	});
}

function Authenticate(username, password, appKey, callback)
{
	App.find({AppKey: appKey}).exec(function(err, app){
		if(app.length <= 0)
		{
			callback(null, null, null);
		}
		else
		{			
			User.find({Username: username, Pass: password}).exec(function(err, user){
				if(user.length <= 0)
				{
					callback(null, null, appKey);
				}
				else
				{		
					var token = stringHelper.generateToken(user[0].Username, appKey);
					callback(user[0], token, appKey);			
				}
			});
		}
	});
}