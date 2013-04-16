var stringHelper = require('../helpers/stringhelper');

exports.hashPassword = function(req, res){
  res.send({hashedPassword: stringHelper.hashString(req.params.password)});
}