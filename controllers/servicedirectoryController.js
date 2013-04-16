		

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
    model.count( newQuery, function (err, count) {
    
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

//
// Get one, use the _id to look it up
// 
exports.get = function(model, req, res){

  console.log('get');

  model.find({_id: req.params.id}, function (err, objects) {
  
    if (err) {
      console.log('ERROR : ' + err);
    }
  
    res.contentType('json');
    res.json({
      success: !err,
      message: err ? err.err : "OK",
      total: objects ? objects.length : 0,
      data: objects
    });
  });
}

//
//Create one
//

exports.create = function (model, req, res) {

	console.log('create');

  var newObject = new model();
  var newObjectData = req.body;
  // remove the id if it has been sent as it is new
  delete newObjectData['_id'];
  delete newObjectData['__v'];
  newObject.set(newObjectData);
  
  console.log(req.body);
  
  newObject.save(function (err, object) {
  
    if (err) {
      console.log('ERROR : ' + err);
    }
  
    res.contentType('json');
    res.json({
      success: !err,
      message: err ? err.err : "OK",
      total: object ? 1 : 0,
      data: object
    });
  });
}

//
//Update one
//
exports.update = function(model, req, res) {

  console.log('update');
  
  model.find({_id: req.params.id}, function (err, objects) {
  
    if (err) {
      console.log('ERROR : ' + err);
    }
  
    // update db
    var object = objects[0];
    object.set(req.body);
    object.save(function (err, object) {
      res.contentType('json');
      res.json({
        success: !err,
        message: err ? err.err : "OK",
        totalCount: object ? 1 : 0,
        data: object
      });
    });
  });
}

//
//Delete one
//
exports.delete = function(model, req, res){

	console.log('delete');

  model.remove({_id: req.params.id}, function (err, objects) {
    res.contentType('json');
    res.json({
      success: !err,
      message: err ? err.err : "OK",
      total: objects ? objects.length : 0,
      data: objects
    });
  });
}