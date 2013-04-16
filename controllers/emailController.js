
exports.sendmail = function (model, req, res) {

	console.log('create'+req.body.To);

 	var tmp = new model();
	tmp.To = req.body.To;
	tmp.Subject = req.body.Subject;
	tmp.Message = req.body.Message;
	tmp.Status = "";
	
    tmp.save(function (err) {
        messages = [];
        errors = [];
        
		if (!err){
        			
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


