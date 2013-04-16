var crypto = require('crypto');

var UserModel = require("../models/user");
var AppModel = require("../models/app");

var User = UserModel.User;
var App = AppModel.App;

exports.hashString = function(str){
	return crypto.createHash('md5').update(str).digest('hex');
};

exports.checkToken = function(token)
{
	return AuthenticateToken(token);
}

function AuthenticateToken(token)
{
	var username = token.split(':')[0];
	var validUsername = false;
	var appKey = token.split(':')[1];
	var validAppKey = false;
	var expiry = token.split(':')[2];
	var isExpired = false;
	User.find({Username: username}).exec(function(err, user){
		if(user.length > 0)
		{
			validUsername = true;
		}
	});
	App.find({AppKey: appKey}).exec(function(err, app){
		if(app.length > 0)
		{
			validAppKey = true;
		}
	});
	
	return validUsername && validAppKey && !isExpired;
}

exports.generateToken = function(username, appKey)
{
	return username + ":" + appKey + ":" + "never";
}