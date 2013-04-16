/**
* Pick up any arguments passed into the application, show progress on console log...
**/
console.log('Version: ' + process.version);
console.log ('');
console.log ('Starting Tradesmate ----------------------------------------------------');

var argv = require('optimist').argv;

if (!argv.mode)
{
	console.log('Usage is: node app.js --mode <execution mode>');
	console.log('                      --log <log file>');
	console.log('                      --logEx <unhandled exception log file>');
	console.log('                      --port <app port>');
	console.log('                      --dbUri <db connection string>');
	console.log('                      --routePrefix <route prefix for url routing>');
}

var pMode = argv.mode ? argv.mode : 'development';
var pMainLogFile = argv.log ? argv.log : './logs/tradesmate.log';
var pExceptionLogFile = argv.logEx ? argv.logEx : './logs/tradesmateUnhExc.log';
var pDBUri = argv.dbUri ? argv.dbUri : 'mongodb://127.0.0.1/tradesmate-dev';
var pRoutePrefix = argv.routePrefix ? argv.routePrefix : '/app';
var pPort = argv.port ? argv.port : '3000';

console.log('Params: Mode is : ' + pMode);
console.log('Params: Main log file is: ' + pMainLogFile);
console.log('Params: Unhandled exception log file is: ' + pExceptionLogFile);
console.log('Params: DBConnStr is: ' + pDBUri);
console.log('Params: Route prefix is: ' + pRoutePrefix);
console.log('Params: Port is: ' + pPort);

//
// Module dependencies ---------------------------------------------------------------------
//

var express = require('express');
var http = require('http');
var path = require('path');
var winston = require('winston');
var loggly = require('winston-loggly').Loggly
var mongoose = require('mongoose');
var app = express();
var nodemailer = require('nodemailer');
var fileupload = require('fileupload').createFileUpload('/uploadDir').middleware


//
// Create Logger and notify app execution
//

var logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console ({ timestamp: true, colorize: true }),
    new winston.transports.File ({ filename: pMainLogFile, timestamp: true, maxsize: 100000, handleExceptions: true }),
    new winston.transports.Loggly ({ timestamp: true, colorize: true, subdomain: 'btek', inputToken: 'daf1695b-e73a-4db0-aa70-e972db0c6963' })
  ]
});

logger.info('Starting Tradesmate --------------------------------------------------');

//
// General URL logger
//

function URLLogger (req, res, next) {
  logger.info(req.method + ' ' + req.protocol + '://' + req.get('host') + req.url);
  
  next();
};



function HandleErrors(err, req, res, next) {
  logger.error(err.stack);
  next(err);
}

//Email Monitor


//
// 404 Not found handler
//
function Handle404Error(err,req, res, next) {
  logger.warn('Resource not found: ' + req.method + ' ' + req.protocol + '://' + req.get('host') + req.url);
   res.status(404);

  res.writeHead(404, {'Content-Type': 'text/plain'});
   res.write(
    JSON.stringify({ 
      "success": "false", 
      "message": "404: Resource Not Found "+err.status, 
     "total": 0,
	 "data": [ ],
	 
    })
  );
  res.end();
  };

//
// 500 Its broke handler
//

function Handle500Error(req, res, next) {
  logger.error(err);
  res.status(500);

  res.writeHead(500, {'Content-Type': 'text/plain'});
   res.write(
    JSON.stringify({ 
      "success": "false", 
      "message": "500: Resource Broken "+err, 
     "total": 0,
	 "data": [ ],
	 
    })
  );
  res.end();

};

//
// CORS XDomain support handler
//

function HandleCrossDomainRequests(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(204);
    }
    else {
      next();
    }
};

logger.info('Configuring application...');


// Log uncaught exceptions
process.on('uncaughtException', function(err) {
  logger.error('UNCAUGHT EXCEPTION!!\r\n' + err.stack);
});

// Log Ctrl - C Shutdown
process.on( 'SIGINT', function() {
  logger.info('Tradesmate shutting down from Ctrl+C');
  setTimeout(function(){ process.exit(); }, 2000);
})


// Configuration that applies to all environments

app.configure(function(){
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: 'layouts/default_layout' });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('tradesmate01'));
  app.use(express.session({ secret: 'tradesmateSess01', cookie: { maxAge: 60000 }}));
  app.use(express.cookieParser());
  app.use(HandleCrossDomainRequests); 
  app.use(URLLogger);
  app.use(app.router);
  app.use(HandleErrors);
  app.use(Handle404Error);
  app.use(Handle500Error);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Configuration that applies just to development mode

app.configure('development', function(){
  app.set('view options', { layout: 'layouts/default_layout', pretty: true });
  app.use(express.logger(':method :url :status'));
  app.disable('view cache');
  app.disable('model cache');
  app.disable('eval cache');
  app.enable('log actions');
  app.enable('env info');
  app.use(express.static(__dirname + '/public'));
});

app.configure('production', function(){
  var oneMonthMS = 2628000000;
  app.use(express.logger(':method :url :status'));
  app.use(express.errorHandler());
  app.use(express.static(__dirname + '/public', { maxAge: oneMonthMS }));
});



//
// Connect to database
//

// logger.info('Connecting to database...');

//mongoose.connect(pDBUri, function(err) {
//  if (err) 
//  {
//    logger.error(err);
//  }
//});

// Getting Controllers and Repositories
logger.info('Retreiving Controllers and Repositories!');
var gc = require("./controllers/genericController");
var userController = require("./controllers/userController");
var locationController = require("./controllers/locationController");
var servicedirectoryController = require("./controllers/servicedirectoryController");
var emailController = require("./controllers/emailController");


// Get temporary models
var AddressModel = require("./models/address").Address;
var ServiceModel = require("./models/servicedirectory").Service;
var EmailModel = require("./models/email").Email;


var AuditModel = require("./models/audit").Audit;
var RatesModel = require("./models/rates").Rates;
var InvitationModel = require("./models/invitation").Invitation;
var LocationModel = require("./models/location").Location;
var LogModel = require("./models/log").Log;
var LogBookModel = require("./models/logbook").LogBook;
var MemberModel = require("./models/member").Member;
var OrganisationModel = require("./models/organisation").Organisation;
var UserModel = require("./models/user").User;
var AppModel = require("./models/app").App;
var UserTrackingProfileModel = require("./models/userTrackingProfile").UserTrackingProfile;

var fileupload = require('fileupload').createFileUpload('./attachments').middleware



//var uController = require('./models/userprovider');
//var uProvider = require('./models/userprovider').UserRepository;
//var UserProvider = new uProvider();

//
// Default Routes
//
logger.info('Defining routes...');
var stringHelper = require("./helpers/stringhelper");


// Handle 500 
app.use(function(error, req, res, next) 
{ 
console.error(error); 
if (ISLOCALHOST()) 
{ res.json(error, 500); } 
else { 
res.send('500: Internal Server Error', 500);
 } 
 }
);

//
// Generic Route
//
app.get(pRoutePrefix + '/*', function(req, res, next){
  var token = req.query["token"];
  var authorized = stringHelper.checkToken(token);
  if(authorized)
  {
    next();
  }
  else
  {
    res.send({success: false, message: "Unauthorized Access!", total: 0, data: {}});    
  }
});

// API is alive
app.get(pRoutePrefix + '/alive', function (req, res) {
  res.send('Alive!');
});



// App
app.get (pRoutePrefix + '/app', function(req,res)      { gc.list(AppModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/app/:id', function(req,res)  { gc.get(AppModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/app', function(req,res)      { gc.create(AppModel, req, res) }); //Create
app.put (pRoutePrefix + '/app/:id', function(req,res)  { gc.update(AppModel, req, res) }); //Update
app.del (pRoutePrefix + '/app/:id', function(req,res)  { gc.delete(AppModel, req, res) }); //Delete

//Email
//app.post(pRoutePrefix + '/email', function(req,res)      { emailController.sendmail(EmailModel, req, res) }); //Create
 app.post(pRoutePrefix + '/email', fileupload, function(req, res) {
   emailController.sendmail(EmailModel, req, res) });

// Address
app.get (pRoutePrefix + '/address', function(req,res)      { gc.list(AddressModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/address/:id', function(req,res)  { gc.get(AddressModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/address', function(req,res)      { gc.create(AddressModel, req, res) }); //Create
app.put (pRoutePrefix + '/address/:id', function(req,res)  { gc.update(AddressModel, req, res) }); //Update
app.del (pRoutePrefix + '/address/:id', function(req,res)  { gc.delete(AddressModel, req, res) }); //Delete


// Service Directory
app.get (pRoutePrefix + '/services', function(req,res)      { gc.list(ServiceModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/services/:id', function(req,res)  { gc.get(ServiceModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/services', function(req,res)      { gc.create(ServiceModel, req, res) }); //Create
app.put (pRoutePrefix + '/services/:id', function(req,res)  { gc.update(ServiceModel, req, res) }); //Update
app.del (pRoutePrefix + '/services/:id', function(req,res)  { gc.delete(ServicesModel, req, res) }); //Delete



// Audit
app.get (pRoutePrefix + '/audit', function(req,res)      { gc.list(AuditModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/audit/:id', function(req,res)  { gc.get(AuditModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/audit', function(req,res)      { gc.create(AuditModel, req, res) }); //Create
app.put (pRoutePrefix + '/audit/:id', function(req,res)  { gc.update(AuditModel, req, res) }); //Update
app.del (pRoutePrefix + '/audit/:id', function(req,res)  { gc.delete(AuditModel, req, res) }); //Delete

// Invitation
app.get (pRoutePrefix + '/invitation', function(req,res)      { gc.list(InvitationModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/invitation/:id', function(req,res)  { gc.get(InvitationModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/invitation', function(req,res)      { gc.create(InvitationModel, req, res) }); //Create
app.put (pRoutePrefix + '/invitation/:id', function(req,res)  { gc.update(InvitationModel, req, res) }); //Update
app.del (pRoutePrefix + '/invitation/:id', function(req,res)  { gc.delete(InvitationModel, req, res) }); //Delete

// Job
app.get (pRoutePrefix + '/job', function(req,res)      { gc.list(JobModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/job/:id', function(req,res)  { gc.get(JobModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/job', function(req,res)      { gc.create(JobModel, req, res) }); //Create
app.put (pRoutePrefix + '/job/:id', function(req,res)  { gc.update(JobModel, req, res) }); //Update
app.del (pRoutePrefix + '/job/:id', function(req,res)  { gc.delete(JobModel, req, res) }); //Delete

// Location
app.get (pRoutePrefix + '/location', function(req,res)      { gc.list(LocationModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/location/:id', function(req,res)  { gc.get(LocationModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/location', function(req,res)      { gc.create(LocationModel, req, res) }); //Create
app.put (pRoutePrefix + '/location/:id', function(req,res)  { gc.update(LocationModel, req, res) }); //Update
app.del (pRoutePrefix + '/location/:id', function(req,res)  { gc.delete(LocationModel, req, res) }); //Delete

// Log
app.get (pRoutePrefix + '/log', function(req,res)      { gc.list(LogModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/log/:id', function(req,res)  { gc.get(LogModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/log', function(req,res)      { gc.create(LogModel, req, res) }); //Create
app.put (pRoutePrefix + '/log/:id', function(req,res)  { gc.update(LogModel, req, res) }); //Update
app.del (pRoutePrefix + '/log/:id', function(req,res)  { gc.delete(LogModel, req, res) }); //Delete

// LogBook
app.get (pRoutePrefix + '/logbook', function(req,res)      { gc.list(LogBookModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/logbook/:id', function(req,res)  { gc.get(LogBookModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/logbook', function(req,res)      { gc.create(LogBookModel, req, res) }); //Create
app.put (pRoutePrefix + '/logbook/:id', function(req,res)  { gc.update(LogBookModel, req, res) }); //Update
app.del (pRoutePrefix + '/logbook/:id', function(req,res)  { gc.delete(LogBookModel, req, res) }); //Delete

// Organisation
app.get (pRoutePrefix + '/organisation', function(req,res)      { gc.list(OrganisationModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/organisation/:id', function(req,res)  { gc.get(OrganisationModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/organisation', function(req,res)      { gc.create(OrganisationModel, req, res) }); //Create
app.put (pRoutePrefix + '/organisation/:id', function(req,res)  { gc.update(OrganisationModel, req, res) }); //Update
app.del (pRoutePrefix + '/organisation/:id', function(req,res)  { gc.delete(OrganisationModel, req, res) }); //Delete

// Rates Model
app.get (pRoutePrefix + '/rates', function(req,res)      { gc.list(RatesModel, req, res)   }); //Get filtered
app.get(pRoutePrefix + '/rates/:id', function (req, res) { gc.get(RatesModel, req, res) }); //Get one
app.post(pRoutePrefix + '/rates', function (req, res) { gc.create(RatesModel, req, res) }); //Create
app.put(pRoutePrefix + '/rates/:id', function (req, res) { gc.update(RatesModel, req, res) }); //Update
app.del(pRoutePrefix + '/rates/:id', function (req, res) { gc.delete(RatesModel, req, res) }); //Delete

// User
app.get (pRoutePrefix + '/user', function(req,res)      { gc.list(UserModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/user/:id', function(req,res)  { gc.get(UserModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/user', function(req,res)      { gc.create(UserModel, req, res) }); //Create
app.put (pRoutePrefix + '/user/:id', function(req,res)  { gc.update(UserModel, req, res) }); //Update
app.del (pRoutePrefix + '/user/:id', function(req,res)  { gc.delete(UserModel, req, res) }); //Delete

// Member
app.get(pRoutePrefix + '/member', function (req, res) { gc.list(MemberModel, req, res) }); //Get filtered
app.get(pRoutePrefix + '/member/:id', function (req, res) { gc.get(MemberModel, req, res) }); //Get one
app.post(pRoutePrefix + '/member', function (req, res) { gc.create(MemberModel, req, res) }); //Create
app.put(pRoutePrefix + '/member/:id', function (req, res) { gc.update(MemberModel, req, res) }); //Update
app.del(pRoutePrefix + '/member/:id', function (req, res) { gc.delete(MemberModel, req, res) }); //Delete



// User authentication
app.post(pRoutePrefix + "/user/authenticate", function(req, res){
  userController.Authenticate(req.body.Username, req.body.Password, req.body.AppKey, function(user, token, appKey){
    logger.info('Authenticating User...');
    if(appKey != null)
    {
      if(user == null && token == null)
      {
        res.send({success: false, message: "Authentication Failed!", total: 0, data: [{}]})
      }
      else
      {
        res.send({success: true, message: "Successfully Authenticated!", total: 1, data: {user: user, token: token}});
      }
    }
    else
    {
      res.send({success: false, message: "Unknown Application Access!", total: 0, data: [{}]})
    }
  });
});

// User Tracking Profile
app.get (pRoutePrefix + '/userTrackingProfile', function(req,res)      { gc.list(UserTrackingProfileModel, req, res)   }); //Get filtered
app.get (pRoutePrefix + '/userTrackingProfile/:id', function(req,res)  { gc.get(UserTrackingProfileModel, req, res)    }); //Get one
app.post(pRoutePrefix + '/userTrackingProfile', function(req,res)      { gc.create(UserTrackingProfileModel, req, res) }); //Create
app.put (pRoutePrefix + '/userTrackingProfile/:id', function(req,res)  { gc.update(UserTrackingProfileModel, req, res) }); //Update
app.del (pRoutePrefix + '/userTrackingProfile/:id', function(req,res)  { gc.delete(UserTrackingProfileModel, req, res) }); //Delete


//
// Load the sessions user and attach to the request - this should be token based - for alex
//

function loadUser(req, res, next) {
  if (req.session.user_id) {
    UserModel.findById(req.session.user_id, function(user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        //Couldnt do it, next
        next();
      }
    });
  } else {
    //Couldnt do it, next
    next();
  }
}

//
// Start her up
//
app.listen(pPort);
logger.info('Tradesmate server listening on port ' + pPort + ' in ' + app.settings.env + ' mode');
