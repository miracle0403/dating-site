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
//post register

router.post('/register', [	check('username', 'Username must be between 8 to 25 numbers').isLength(8,25),	check('fullname', 'Full Name must be between 8 to 25 characters').isLength(8,25),	check('password', 'Password must be between 8 to 15 characters').isLength(8,15),	 check('email', 'Email must be between 8 to 105 characters').isLength(8,105),	check('email', 'Invalid Email').isEmail(),		check('phone', 'Phone Number must be eleven characters').isLength(11)], function (req, res, next) {	 
	console.log(req.body)
	
	var username = req.body.username;
    var password = req.body.password;
    var cpass = req.body.cpass;
    var email = req.body.email;
    var fullname = req.body.fullname;
    
    var phone = req.body.phone;
	
	var errors = validationResult(req).errors;
	
	if (errors.length > 0){
		res.render('register', { mess: 'REGISTRATION FAILED', errors: errors, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname });
	}else{
		if (cpass !== password){
			var error = 'Password must match';
			res.render('register', { mess: 'REGISTRATION FAILED', errors: errors, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname,  error: error});
		}else{
			
			db.query('SELECT username FROM user WHERE username = ?', [username], function(err, results, fields){
				if (err) throw err;
				if(results.length > 0){
					var error = "Sorry, this username is taken";
					res.render('register', { mess: 'REGISTRATION FAILED', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname});
				}else{
					db.query('SELECT email FROM user WHERE email = ?', [email], function(err, results, fields){
						if (err) throw err;
						if (results.length > 0){
							var error = "Sorry, this email is taken";
							res.render('register', { mess: 'REGISTRATION FAILED', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname});
						}else{
							db.query('SELECT phone FROM user WHERE phone = ?', [phone], function(err, results, fields){
								if (err) throw err;
							
								if (results.length > 0){
									var error = "Sorry, this phone number is taken";
									res.render('register', { mess: 'REGISTRATION FAILED', error: error, username: username, email: email, phone: phone, password: password, cpass: cpass, fullname: fullname});
								}else{
									db.query('SELECT user_id FROM user', function(err, results, fields){
										if (err) throw err;
										if (results.length === 0){
											//register user
											bcrypt.hash(password, saltRounds,  function(err, hash){
												db.query('INSERT INTO user (user_id, full_name, phone, username, email, password, user_type) VALUES (?,?,?,?,?,?,?)', [ 1, fullname, phone, username, email, hash, 'Administrator'],  function(err, results, fields){
													if (err) throw err;
													var success = 'Registration successful! please login';
													res.render('register', {mess: 'REGISTRATION SUCCESSFUL', success: success});
												});
											});
										}else{
											//register user
											bcrypt.hash(password, saltRounds,  function(err, hash){
												db.query('INSERT INTO user ( full_name, phone, username, email, password) VALUES (?,?,?,?,?)', [  fullname, phone, username, email, hash],  function(err, results, fields){
													if (err) throw err;
													var success = 'Registration successful! please login';
													res.render('register', {mess: 'REGISTRATION SUCCESSFUL', success: success});
												});
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	}
});



//post log in
router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
	res.redirect('/dashboard');
});


//Passport login
passport.serializeUser(function(user_id, done){
  done(null, user_id)
});
        
passport.deserializeUser(function(user_id, done){
  done(null, user_id)
});

function authentificationMiddleware(){
  return (req, res, next) => {
    console.log(JSON.stringify(req.session.passport));
  if (req.isAuthenticated()) return next();

  res.redirect('/login'); 
  } 
}





module.exports = router;
