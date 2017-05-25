var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var net = require('net');
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users/users');
var gateways = require('./routes/gateways/gateways');
var configurations = require('./routes/configurations/configurations');
var services = require('./routes/gateways/services');
var hardware = require('./routes/hardware/hardware');
var resources = require('./routes/hardware/resources');
var sites = require('./routes/sites/sites');
var tableBss = require('./routes/tableBss/tableBss');
var radioDestinations = require('./routes/destinations/radioDestinations');
var historics = require('./routes/historics/historics');
var version = require('./routes/version/version');
var logging = require('./lib/loggingDate.js');
var config = require('./configUlises.json');
//var controlAccess=require('./routes/services/accessControl');
var myLibHistorics = require('./lib/historics.js');
var myLibConfig = require('./lib/configurations.js');
var myLibHardwareGateways = require('./lib/hardware.js');

/** 20170525. AGL. Para el control de Sesiones. */
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var moment = require('moment');
var ctrlSesiones = {user: null, localSession: null};

/***/
// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
var ID_HW   =   'CFG';
var ACCESS_SYSTEM_OK = 50;
var ACCESS_SYSTEM_FAIL = 51;
var USER_LOGOUT_SYSTEM = 55;
function insertHistoric(code, user, reason) {
    myLibHistorics.postHistorics(
        {
            IdIncidencia: code,
            IdHw: ID_HW,
            Usuario: user,
            Param: reason
        }
        , function(h){            
    });
}
function checkPerfil(userprofile ){
    var allProfMsc = (0x0001 | 0x0010 | 0x0040 | 0x0200 | 0x0400 | 0x8000);
    var valProfile = ((userprofile & allProfMsc) ? true : false);
    return valProfile;
}
passport.use(new Strategy(
  function(username, password, cb) {
    logging.LoggingDate('Passport Strategy function: ' + username + '/' + password);
    if (ctrlSesiones.localSession) {
        insertHistoric(ACCESS_SYSTEM_FAIL, username, 'Existe una sesion activa.');
        return cb(null, false, {message: 'Existe una sesion activa.'});
    }
    var pwdB64 = new Buffer(password).toString('base64');
    require("./lib/users").findByUsername(username, function(err, user) {
    if (err) { 
        insertHistoric(ACCESS_SYSTEM_FAIL, username, err);
        return cb(err);
    }
    if (!user) { 
        insertHistoric(ACCESS_SYSTEM_FAIL, username, 'No existe el usuario');
        return cb(null, false, {message: 'No existe el usuario'});
    }
    if (checkPerfil(user.perfil)==false) { 
        insertHistoric(ACCESS_SYSTEM_FAIL, username, 'Perfil de usuario no adecuado');
        return cb(null, false, {message: 'Perfil de usuario no adecuado'});
    }
    if (user.clave != pwdB64) { 
        insertHistoric(ACCESS_SYSTEM_FAIL, username, 'Password incorrecta.');
        return cb(null, false, { message: 'Password incorrecta.' }); 
    }
    insertHistoric(ACCESS_SYSTEM_OK, user.name, '');
    return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  ctrlSesiones.user = user;
  cb(null, user.idOPERADORES);
  logging.LoggingDate('serializeUser: ' + user.idOPERADORES.toString() + ', ' + user.perfil.toString());
});
passport.deserializeUser(function(id, cb) {
  // require("./lib/users").findById(id, function (err, user) {
  //   if (err) { return cb(err); }
  //   cb(null, user);
  //   console.log('deserializeUser: ' + id.toString());
  // });
  logging.LoggingDate('deserializeUser: ' + id.toString());
  if (ctrlSesiones.user)
      return cb(null,ctrlSesiones.user);
  return cb("No hay usuario logeado...");
});
/*****/


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// to updload files
var multer  =   require('multer');
app.post('/',[ 
        multer({ 
            dest: './uploads/'
            }).single('upl'),
        function(req,res){
            logging.LoggingDate(req.file); //form files
            /* example output:
                    { fieldname: 'upl',
                      originalname: 'grumpy.png',
                      encoding: '7bit',
                      mimetype: 'image/png',
                      destination: './uploads/',
                      filename: '436ec561793aa4dc475a88e84776b1b9',
                      path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
                      size: 277056 }
             */
            fs.readFile(req.file.path, 'utf8', function(err, contents) {
                //  console.log(contents);
                myLibConfig.postConfigurationFromJsonFile(req.body.config, req.body.site, JSON.parse(contents),function(result){
                    if (result.error == null){
                        myLibHardwareGateways.setResources(result.slaves,JSON.parse(contents).recursos,function(result){
                            logging.LoggingSuccess('Configuracion importada correctamente');
                            res.render('imported', {
                                dataToRestore:{
                                    user: req.body.user,
                                    clave: req.body.clave,
                                    perfil: req.body.perfil,
                                    LoginTimeout: config.Ulises.LoginTimeOut,
                                    Region: config.Ulises.Region,
                                    BackupServiceDomain: config.Ulises.BackupServiceDomain,
                                    config: req.body.config,
                                    site: req.body.site,
                                    cfgData: req.body.cfgData
                                },
                                error: '',
                                message: 'Configuracion importada correctamente',
                                file: req.file.originalname
                            });
                        });
                    }
                    else if (result.error == -1){
                        logging.loggingError('Configuracion no importada. La pasarela ya existe. Elimine la pasarela antes de importar');
                        res.render('imported', {
                            dataToRestore:{
                                user: req.body.user,
                                clave: req.body.clave,
                                perfil: req.body.perfil,
                                LoginTimeout: config.Ulises.LoginTimeOut,
                                Region: config.Ulises.Region,
                                BackupServiceDomain: config.Ulises.BackupServiceDomain,
                                config: req.body.config,
                                site: req.body.site,
                                cfgData: req.body.cfgData
                            },
                            error: req.file.message,
                            message: 'Configuracion no importada. La pasarela ya existe. Elimine la pasarela antes de importar',
                            file: req.file.originalname
                        });                        
                    }
                    else{
                        logging.loggingError(req.file.message);
                        res.render('imported', {
                            dataToRestore:{
                                user: req.body.user,
                                clave: req.body.clave,
                                perfil: req.body.perfil,
                                LoginTimeout: config.Ulises.LoginTimeOut,
                                Region: config.Ulises.Region,
                                BackupServiceDomain: config.Ulises.BackupServiceDomain,
                                config: req.body.config,
                                site: req.body.site,
                                cfgData: req.body.cfgData
                            },
                            error: req.file.message,
                            message: 'Configuracion no importada',
                            file: req.file.originalname
                        });                        
                    }
                });
            });
            //res.json({size:req.file.size});
        }
]);

// create a write stream (in append mode)
//var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
//app.use(logger('dev', {stream: accessLogStream}));

// app.use(logger('dev'));
app.use(bodyParser.json());                                 // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));        // to support URL-encoded bodies
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/** 20170525. AGL. Para el control de Sesiones. */
/** Para el control de Sesiones. */
var login_timeout = config.Ulises.LoginTimeOut==0 ? 60000 : config.Ulises.LoginTimeOut*60000;
app.use(require('express-session')(
    { secret: 'clave-secreta', resave: false, saveUninitialized: false,
      cookie:  { maxAge: login_timeout} }));
app.use(flash());
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

//
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();    
  }
  res.redirect('/login');
}

/* GET home page. */
app.get('/', 
    //require('connect-ensure-login').ensureLoggedIn(),
  isAuthenticated,
    function(req, res, next) {
    logging.LoggingDate('app.get</>: ');
        ctrlSesiones.localSession = req.session;
        res.render('index',
            {
                LoginTimeout: config.Ulises.LoginTimeOut,
                Region: config.Ulises.Region,
                BackupServiceDomain: config.Ulises.BackupServiceDomain,
                Version: config.Ulises.Version,
                user: (req.user ? req.user : {name:'noname', perfil:64}),
                session: ctrlSesiones.localSession
            });
 });

app.get('/login',
  function(req, res){
    logging.LoggingDate('app.get</login>: ');
    res.render('login', {message: req.flash('error'), region: config.Ulises.Region});
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    logging.LoggingDate('app.post</login>: ' + req.user.name + ' ' + req.user.perfil);
    res.redirect('/');
  });
  
app.get('/logout',
  function(req, res){
    logging.LoggingDate('app.get</logout>: ' + req.user.name + ' ' + req.user.perfil);
    insertHistoric(USER_LOGOUT_SYSTEM, ctrlSesiones.user.name, '');
    ctrlSesiones.localSession = null;
    req.logout();
    res.redirect('/');
  });

app.use('/users', isAuthenticated, users);
app.use('/gateways', gateways);
app.use('/configurations', isAuthenticated, configurations);
app.use('/services', isAuthenticated, services);
app.use('/hardware', isAuthenticated, hardware);
app.use('/resources', isAuthenticated, resources);
app.use('/sites', isAuthenticated, sites);
app.use('/destinations', isAuthenticated, radioDestinations);
app.use('/historics', isAuthenticated, historics);
app.use('/version', isAuthenticated, version);
app.use('/tableBss', isAuthenticated, tableBss);

// app.use('/', routes);
// app.use('/users', users);
// app.use('/gateways', gateways);
// app.use('/configurations', configurations);
// app.use('/services', services);
// app.use('/hardware',hardware);
// app.use('/resources',resources);
// app.use('/sites', sites);
// app.use('/destinations',radioDestinations);
// app.use('/historics',historics);
// app.use('/version',version);
// app.use('/tableBss',tableBss);
/*********************************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Prepare historics deep
setImmediate(function(){
    logging.LoggingDate('Running once a day. Historics deep: ' + config.Ulises.HistoricsDeep + ' days.');
    myLibHistorics.deepHistorics(config.Ulises.HistoricsDeep,function(result){
        logging.LoggingDate('Historics record removed: ' + result.affectedRows);
    });
    myLibConfig.resetGatewaysSynchroState(function(result){
        logging.LoggingDate('Reset Gateways Synchro State: ' + result.result);
    });
});

setInterval(function(){
    logging.LoggingDate('Running once a day. Historics deep: ' + config.Ulises.HistoricsDeep + ' days.')    ;
    //logging.LoggingDate('[' + new Date().toString() + ']' + 'Running once a day. Historics deep: ' + config.Ulises.HistoricsDeep + ' days.');
    myLibHistorics.deepHistorics(config.Ulises.HistoricsDeep,function(result){
        logging.LoggingDate('Historics record removed: ' + result.affectedRows);
        //logging.LoggingDate('[' + new Date().toString() + ']' + 'Historics record removed: ' + result.affectedRows);
    });
},86400000);

/** 20170525. AGL. Para el control de Sesiones. */
var intervalObject = setInterval(function () {
      if (ctrlSesiones.localSession) {
        if (moment().isAfter(moment(ctrlSesiones.localSession.cookie._expires))) {
            logging.LoggingDate("La Session ha expirado....");
            insertHistoric(USER_LOGOUT_SYSTEM, ctrlSesiones.user.name, 'La Session ha expirado....');
            ctrlSesiones.localSession = null;
        }
      } 
      // console.log(moment().toString() + ": " +
      //   (ctrlSesiones.localSession ? ("Sesion Activa hasta : " + moment(ctrlSesiones.localSession.cookie._expires).toString() ): "No Session"));
    }, 5000);
/*********************/

app.set('port', process.env.PORT || 5050);

//Variable para usuario ya conectado
app.locals.isAuthenticated = false;
app.locals.AuthenticatedUser = 'none';

app.listen(app.get('port'),function(){
    logging.LoggingDate('Listening UG5k-Serv on port ' + app.get('port'));
    logging.LoggingDate('Express started in ' + app.get('env'));  
});

module.exports = app;
