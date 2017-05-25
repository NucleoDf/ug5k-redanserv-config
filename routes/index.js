var express = require('express');
var router = express.Router();
var config = require('../configUlises.json');
var myLibAuth = require('../lib/authentication.js');

/** 20170525. AGL. Para el control de Sesiones. */
/////////////////////////////////////////////////
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index',{
//   	LoginTimeout: config.Ulises.LoginTimeOut,
//   	Region: config.Ulises.Region,
//   	BackupServiceDomain: config.Ulises.BackupServiceDomain,
// 	Version: config.Ulises.Version});

//  });

// router.get('/ajax', function(req, res) {
// 	myLibAuth.setAuthentication(req, res);
// });
//////////////////////////////////////////////
/** */
var isAuthenticated = function (req, res, next) {
  console.log("isAuthenticated IN");
  console.log(req.session);
  if (req.isAuthenticated()) {
    console.log("isAuthenticated OUT OK");
    return next();    
  }
  res.redirect('/login');
 console.log("isAuthenticated OUT ERR");
}

/* GET home page. */
router.get('/', 
	//require('connect-ensure-login').ensureLoggedIn(),
  isAuthenticated,
	function(req, res, next) {
    console.log('app.get</>: ');
    localSession = req.session;
    console.log(localSession);
		res.render('index',
			{
  			LoginTimeout: config.Ulises.LoginTimeOut,
  			Region: config.Ulises.Region,
  			BackupServiceDomain: config.Ulises.BackupServiceDomain,
				Version: config.Ulises.Version,
				user: (req.user ? req.user : {name:'noname', perfil:64}),
				session: localSession
			});
 });

router.get('/login',
  function(req, res){
    console.log('app.get</login>: ');
    console.log(req.session);
    res.render('login', {message: req.flash('error')});
  });
  
router.post('/login', 
  require('passport').authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    console.log('app.post</login>: ' + req.user.name + ' ' + req.user.perfil);
    res.redirect('/');
  });
  
router.get('/logout',
  function(req, res){
    console.log('app.get</logout>: ' + req.user.name + ' ' + req.user.perfil);
    localSession = null;
    req.logout();
    res.redirect('/');
  });


module.exports = router;
