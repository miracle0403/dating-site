'use strict';

var express = require('express');
var router = express.Router();


var passport = require('passport'); 
var securePin = require('secure-pin');
var charSet = new securePin.CharSet();
charSet.addLowerCaseAlpha().addUpperCaseAlpha().addNumeric().randomize();

var { check, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');

var db = require('../db.js');
//var getfunc = require('../functions.js');

//var ensureLoggedIn = require( 'connect-ensure-login' ).ensureLoggedIn

const saltRounds = bcrypt.genSaltSync(10);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Meldoo', subtitle: 'Interracial dating app' });
});


/* GET registration page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Meldoo', subtitle: 'Interracial dating app' });
});



/* GET login */
router.get('/login', function(req, res, next) {
	
	const flashMessages = res.locals.getMessages( );
	if( flashMessages.error ){
		res.render( 'login', {
			showErrors: true,
			errors: flashMessages.error
		});
	}else{
		var message = 'LOG IN';
		res.render('login', { title: 'Meldoo', subtitle: 'Interracial dating app'  });
	}
});


//get logout
router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/login');
});


/* Post request*/ 

//post register





module.exports = router;
