/// <reference path="./nodelib/node.js" />
var express = require('express');
var mongoose = require('mongoose');

var app = express();
var nodemailer = require('nodemailer');
var fs = require('fs'), fileStream;
var EmailModel = require("./models/email").Email;
var winston = require('winston');
var loggly = require('winston-loggly').Loggly

var argv = require('optimist').argv;

if (!argv.mode)
{
    console.log('Usage is: node emailmonitor.js');
	console.log('                      --log <log file>');
	console.log('                      --logEx <unhandled exception log file>');
	console.log('                      --port <app port>');
	console.log('                      --dbUri <db connection string>');
	console.log('                      --imapEmail <Email to use for IMAP service>');
	console.log('                      --imapPassword <Password to use for IMAP service>');
	console.log('                      --smtpEmail <Email to use for SMTP service>');
	console.log('                      --smtpPassword <Password to use for SMTP service>');
	console.log('                      --smtpPassword <Password to use for SMTP service>');
	console.log('                      --rmq_interval <Interval for checking the Email tasks queue>');
	console.log('                      --rm_interval <Interval for checking the Email inbox for bounced emails>');
	console.log('                      --attachments_folder <Interval for checking the Email inbox for bounced emails>');
	
	//console.log('                      --routePrefix <route prefix for url routing>');
}


var pMainLogFile = argv.log ? argv.log : './logs/tradesmate.log';
var pExceptionLogFile = argv.logEx ? argv.logEx : './logs/tradesmateUnhExc.log';
var pDBUri = argv.dbUri ? argv.dbUri : 'mongodb://127.0.0.1/tradesmate-dev';

var imapEmail = argv.imapEmail ? imapEmail : 'teampo2@gmail.com';
var imapPassword = argv.imapPassword ? imapPassword : 'teampo2@gmail.com';

var smtpEmail = argv.smtpEmail ? imapEmail : 'teampo2@gmail.com';
var smtpPassword = argv.smtpPassword ? imapPassword : 'teampo2@gmail.com';

var pPort = argv.port ? argv.port : '3000';
var rm_interval = argv.rm_interval ? argv.rm_interval : '10000';
var rmq_interval = argv.rmq_interval ? argv.rmq_interval : '10000';
var attachments_folder = argv.attachments_folder ? argv.attachments_folder : 'attachments';


console.log('Params: Main log file is: ' + pMainLogFile);
console.log('Params: Unhandled exception log file is: ' + pExceptionLogFile);
console.log('Params: DBConnStr is: ' + pDBUri);

console.log('Params: IMAP Email is: ' + imapEmail);
console.log('Params: SMTP Email is: ' + smtpEmail);

console.log('Params: Port is: ' + pPort);


var logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console ({ timestamp: true, colorize: true }),
    new winston.transports.File ({ filename: pMainLogFile, timestamp: true, maxsize: 100000, handleExceptions: true }),
    new winston.transports.Loggly ({ timestamp: true, colorize: true, subdomain: 'btek', inputToken: 'daf1695b-e73a-4db0-aa70-e972db0c6963' })
  ]
});

logger.info('Starting Email Monitor --------------------------------------------------');


// Create a SMTP transport object
var transport = nodemailer.createTransport("SMTP", {
        //service: 'Gmail', // use well known service.
                            // If you are using @gmail.com address, then you don't
                            // even have to define the service name
        auth: {
            user: smtpEmail,
            pass: smtpPassword
        }
    });


console.log('SMTP Configured');

var Imap = require('imap'),
    inspect = require('util').inspect;

var imap = new Imap({
      user: imapEmail,
      password: imapPassword,
      host: 'imap.gmail.com',
      port: 993,
      secure: true
    });
	

function show(obj) {
    return inspect(obj, false, Infinity);
}



function die(err) {
    console.log('Uh oh: ' + err);
    process.exit(1);
}

function openInbox(cb) {
  imap.connect(function(err) {
    if (err) die(err);
    imap.openBox('INBOX', true, cb);
  });
}



var readmails_var;
//This function is called every specific amount of time
function readmails_start(){
   readmails_var=setTimeout(function(){readinbox();},rm_interval);
}

function readmails_stop() {
    clearTimeout(readmails_var);
}


function readinbox() {

//Stop the timer to give way to the inbox reading process
    readmails_stop();

    openInbox(function (err, mailbox) {
        if (err) die(err);
  //Check the 3 newest emails in inbox for bounced emails.
        for (var i = 0; i < 3; i++) {
            imap.seq.fetch(mailbox.messages.total - i + ':*', { struct: false }, {
            
	        headers: 'from',
            body: true,
            cb: function (fetch) {
                fetch.on('message', function (msg) {

                    //console.log('Saw message no. ' + msg.seqno);
			        var body = '';      
			        msg.on('headers', function (hdrs) {
			            //  console.log('Headers for no. ' + msg.seqno + ': ' + show(hdrs));
                        });
		  
 
			        msg.on('data', function (chunk) {
			            body += chunk.toString('utf8');
			 
                        });
		  

			        msg.on('end', function () {
			            if (body.toLowerCase().indexOf('mailer-daemon') > 0) {

		                    var recipientemail = getrecipientemail(show(body));
		                    logger.info("Email to :"+$recipientemail+" bounced back.");
		                    logger.info("Retrying to resend.");
		  
		                    updaterecordbyEmail(recipientemail,"");
			
		                    fileStream = fs.createWriteStream('msg-' + msg.seqno + '-body.txt');
                            fileStream.write(show(body));
		                    fileStream.end();
			                }
			

			
          });
        });
      }
    }, 
	

	function (err) {
	    if (err) throw err;
	    logger.info('Done fetching all messages!');
        imap.logout();
    }
  );
  }
    });

    readmails_start();

}

//Method that parses the source to get the recipient email
function getrecipientemail($source) {
	var cue = 'permanently:';
	var tmp =  $source.indexOf(cue)+(cue.length+8);
	var email = "";
	console.log(tmp);
	for (var i = tmp; i < $source.length; i++) {

		email += $source.charAt(i);
		if ($source.charAt(i) == '\\') {

		    break;

		}

	}

	email = email.replace(/\s/g, "") ; 
	email = email.replace("\\","");

	return email;
}


//Method that does sending of Email task
function sendmail($mailid, $from, $subject, $message, $attachment) {

    // Message object
    var message = {

    // sender info
    from: 'Sender Name <sender@example.com>',

    // Comma separated list of recipients
    to: '"Receiver Name" <'+$from+'>',

    // Subject of the message
    subject: $subject, //

    headers: {
        'X-Laziness-level': 1000
    },

    // plaintext body
    text: $message,

    // HTML body
    html:$message,
	
    // An array of attachments
    attachments:[

        // String attachment
        {
            fileName: 'notes.txt',
            contents: 'Some notes about this e-mail',
            contentType: 'text/plain' // optional, would be detected from the filename
        },

        // Binary Buffer attachment
        {
            fileName: 'image.png',
            contents: new Buffer('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
                                 '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
                                 'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC', 'base64'),

            cid: 'note@node' // should be as unique as possible
        },

        // File Stream attachment
        {
            fileName: $attachment,
            filePath: $attachments_folder+"/"+$attachment,
            cid: 'nyan@node' // should be as unique as possible
        }
    ]
};



transport.sendMail(message, function(error,response){
  var status_toput = "";
  if(error){
		status_toput = error.message;
        console.log('Error occured');
        console.log(error.message);
	   return;
	}
		status_toput = "Sent";
		updaterecordbyID($mailid,status_toput);

        logger.info('Message sent successfully!');

    // if you don't want to use this transport object anymore, uncomment following line
    //transport.close(); // close the connection pool
});

}


//Updates the Email task Status by ID
function updaterecordbyID($mailid,$status_toput){
	EmailModel.find({_id: $mailid}, function (err, objects) {
	   var tmp = objects[0];
	tmp.Status = $status_toput;

    tmp.save(function (err) {
        messages = [];
        errors = [];
        
        if (!err) {
           logger.info("Email task updated.");
   
	}
	
	});
	
		
    });
}


//This method is called to update the Email task in the db collection that the email sent was bounced
//back
function updaterecordbyEmail($recipient, $status_toput) {
    EmailModel.find({ To: $recipient },
	function (err, objects) {
	    if (!err) {

	        var tmp = objects[0];
	        tmp.Status = $status_toput;

	        tmp.save(function (err) {
	            messages = [];
                errors = [];
        
        if (!err) {
            logger.info("Email task updated.");
   
	    }
	
	});
	
		
    }
	
	   else {
	       logger.info("Record not found");
	}
	}
	
	);
	
	
	
}



var reademailtasksqueue_var;

function reademailtasksqueue_start() {
    reademailtasksqueue_var = setTimeout(function () { go(); }, rmq_interval);
}

function reademailtasksqueue_stop() {
    clearTimeout(reademailtasksqueue_var);
}


function go(){
    reademailtasksqueue_stop();
	logger.info("Checking db...");
	EmailModel.find({},function(err, docs){
        emails = new Array();
        docs.forEach(function (emails) {
            if (emails.Status != "Sent") {
                logger.info("Sending email to " + emails.To);
			    sendmail(emails._id,emails.To,emails.Subject,emails.Message);
		  }
        });
		
		
        reademailtasksqueue_start();
		//console.log(str);
       // res.header('Content-type', 'text/csv');
        //res.send(str);
    });


}

readmails_start();
reademailtasksqueue_start();


//
// Start her up
//
app.listen(pPort);
//logger.info('Tradesmate server listening on port ' + pPort + ' in ' + app.settings.env + ' mode');
