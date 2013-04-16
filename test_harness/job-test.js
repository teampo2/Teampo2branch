/// <reference path="./nodelib/node.js" />
var request = require('superagent');
var mongoose = require("mongoose");
var customer = require("../models/address");
var should = require('should');
var dbid = '4f837f7a8f716f933e000095';

describe('User API Test', function(){

  it('Create a user - POST', function(done){
    request
      .post('http://localhost:3000/app/job')
      .send({
    //    OrgId:       "Work",
        JobName:   "te44s123333t",
        JobCode:   "te44am331231po2@gmail.com",
        JobType:     "te44am331231po2@gmail.com",
        CustFirstName:   "te44am331231po2@gmail.com",
        CustLastName:      "",
        CustEmail:    "",
        CustHomePh:      "",
        CustWorkPh:      "",
        CustMobilePh:      "",
        Status:      "",

      })
      .end(function (res) {
          //console.log(res.body);
         // if (res.body.data && res.body.success && res.body.data._id) {
              res.body.success.should.equal(true);
              res.body.should.have.property('data');
              res.body.data.should.have.property('_id');
               dbid = res.body.data._id;  //Store the id for the next test
              dbid = res.body.data._id;
              done();
         // }
         

      });
  });


    

  it('Get it back again - GET ' + dbid, function(done){
    request
     .get('http://localhost:3000/app/job/')
     .set('Content-Type', 'application/json')
     .end(function(res){
       res.should.be.json;
       res.statusCode.should.equal(200);
       res.body.success.should.equal(true);
       res.body.should.have.property('data');
       res.body.data.should.not.have.length(0);
       res.body.data[0].should.have.property('_id');
       res.body.data[0]._id.should.equal(dbid);
       done();
     });
  });


  it('Modify a user - PUT ' + dbid, function (done) {
      request
        .put('http://localhost:3000/app/job/:id')
        .send({
            //isactive:     true,
            // issysadmin:   true
        })
        .end(function (res) {
            res.should.be.json;
            res.statusCode.should.equal(200);
            res.body.success.should.equal(true);
            res.body.should.have.property('data');
            //  res.body.data.should.have.property('isactive');
            // res.body.data.isactive.should.equal(true);
            done();
        });
  });


  it('Delete it - DEL ' + dbid, function (done) {
      request
        .del('http://localhost:3000/app/job/:id')
        .end(function (res) {
            res.statusCode.should.equal(200);
            res.body.success.should.equal(true);
            done();
        });
  });



 /*
  it('Try to create another one with same username - POST', function(done){
    request
      .post('http://localhost:3000/app/user')
      .send({
        isactive:     false,
        issysadmin:   false,
        isadmin:      true,
        username:     'test9999',
        password:     'ted',
        firstname:    'TestDuplicate',
        lastname:     'TestDuplicate',
        home:         {
          email:      'test@test.com',
          phone:      '02 9402 9450',
          mobile:     '0409 550 933',
          address:    {
            street:       '53 Ashburton Avenue',
            suburb:       'South Turramurra',
            state:        'Nsw',
            postcode:     '2074',
            countrycode:  'au',
            coordinates: {
              xlon:         123.3456,
              ylat:         123.9999
            }
          }
        },
        work: {
          email:      'test@work.com',
          phone:      '02 9999 9999',
          mobile:     '02 8888 8888'
        }
      })
      .end(function(res){
        res.should.be.json;
        res.statusCode.should.equal(200);
        res.body.success.should.equal(false);
        done();
      });
  });
  */

 


    /*
  it('Verify modification - GET '+dbid, function(done){
    request
      .get('http://localhost:3000/api/user/'+dbid)
      .set('Content-Type', 'application/json')
      .end(function(res){
        res.should.be.json;
        res.statusCode.should.equal(200);
        res.body.success.should.equal(true);
        res.body.should.have.property('data');
        res.body.data.should.not.have.length(0);
        res.body.data[0].should.have.property('_id');
        res.body.data[0]._id.should.equal(dbid);
        res.body.data[0].should.have.property('isactive');
        res.body.data[0].isactive.should.equal(true);
        done();
      });
  });
  */


    /*
  it('Get it back again to check delete - GET '+dbid, function(done){
    request
      .get('http://localhost:3000/app/user/'+dbid)
      .set('Content-Type', 'application/json')
      .end(function(res){
        res.should.be.json;
        res.statusCode.should.equal(200);
        res.body.success.should.equal(true);
        res.body.should.have.property('data');
        res.body.data.should.have.length(0);
        done();
      });
  });
  */


});
