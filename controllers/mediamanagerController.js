var crypto = require('crypto');

// wherever you want
function randomObjectId() {
    return crypto.createHash('md5').update(Math.random().toString()).digest('hex').substring(0, 24);
}


exports.postmedia = function (model, req, res,filesuploaded) {

    for (x in filesuploaded) {

        var args = filesuploaded[x].path.slice(0, -1);
      //  console.log('THE PATH IS ' + args);

        var tmp = new model();
        tmp.GUID = args;
        tmp.Filename = filesuploaded[x].name;
        tmp.Filepath = args;


        tmp.save(function (err) {
            messages = [];
            errors = [];

            if (!err) {

                res.contentType('json');
                res.json({
                    success: !err,
                    message: "OK",
                    total: tmp.length,
                    data: tmp
                });
            }

            else {
                console.log('Error !');

            }
        });

    }
}


exports.list = function (model, req, res) {

    //Sencha paging parameters
    var pageNumber = 0;
    var pageStart = 0;
    var pageLimit = 25;
    var sort = false;
    var sortField = '';
    var sortOrder = 'ASC';

    //Create a new query iterpreting the default sencha settings, and build out the options structure
    var options = {};
    var newQuery = new Object();

    for (var key in req.query) {
        if (req.query.hasOwnProperty(key)) {
            switch (key) {
                case 'page':
                    pageNumber = parseInt(req.query[key]);
                    break;
                case 'start':
                    pageStart = parseInt(req.query[key]);
                    options.skip = pageStart;
                    break;
                case 'limit':
                    pageLimit = parseInt(req.query[key]);
                    options.limit = pageLimit;
                    break;
                case 'sort':
                    sortField = req.query[key];
                    if (req.query['dir'] === 'ASC') {
                        options.sort = {};
                        options.sort[sortField] = 1;
                    } else {
                        options.sort = {};
                        options.sort[sortField] = -1;
                    }
                    break;
                case 'dir':
                    break;
                case '_dc':
                    break;
                default:
                    //Pass the original query thru
                    newQuery[key] = req.query[key];
            }
        }
        //console.log(key, req.query[key]);
    }

    //console.log('page: ' + pageNumber + ', pageStart: ' + pageStart + ', pageLimit: ' + pageLimit);
    //console.log({ skip: pageStart, limit: pageLimit });
    //console.log(newQuery);

    //Build the options structure
    //console.dir(options);

    //First execute the paged query to get our result set
    model.find(newQuery, {}, options, function (err, objects) {

        //Spit errors   
        if (err) {
            return next(err);
        }

        //Then execute a count on the entire query - this could be very expensive on large datasets
        model.count(newQuery, function (err, count) {

            //Spit errors   
            if (err) {
                return next(err);
            }

            //Send our json encoded response back
            res.contentType('json');
            res.json({
                success: !err,
                message: err ? err.err : "OK",
                total: count,
                data: objects
            });

            //console.dir(objects);

        });
    });
};


exports.viewmedia = function (req, res) {

    console.log('update');
    var fs = require('fs');
    if (req.query['name'].toString().indexOf('.jpg')>0) {
        var img = fs.readFileSync('./mediamanager/' + req.query['name']);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(img, 'binary');
    }

}


exports.get = function(model, req, res,pPort) {

    console.log('update');
  
    model.find({ GUID: req.query['id'] }, function (err, objects) {
  
        if (err) {
            console.log('ERROR : ' + err);
        }
  
        // update db
        var object = objects[0];
       // var temp = [{ FileName: object.Filename , URL: "http://localhost:"+pPort+"/mediamanager/"+object.Filename }];
       // object.set(req.body);
        //object.save(function (err, object) {
            res.contentType('json');
            res.json({
                success: !err,
                message: err ? err.err : "OK",
                totalCount: object ? 1 : 0,
                data: "Filename: " + object.Filename + ",URL:http://localhost:" + pPort + "/mediamanager/viewmedia?name="+object.Filepath+"/"+ object.Filename
            //});
        });
    });
}