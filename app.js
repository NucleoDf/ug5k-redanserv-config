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

app.use(logger('dev'));
app.use(bodyParser.json());                                 // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));        // to support URL-encoded bodies
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/gateways', gateways);
app.use('/configurations', configurations);
app.use('/services', services);
app.use('/hardware',hardware);
app.use('/resources',resources);
app.use('/sites',sites);
app.use('/destinations',radioDestinations);
app.use('/historics',historics);
app.use('/version',version);
app.use('/tableBss',tableBss);

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

app.set('port', process.env.PORT || 5050);

//Variable para usuario ya conectado
app.locals.isAuthenticated = false;
app.locals.AuthenticatedUser = 'none';

app.listen(app.get('port'),function(){
    logging.LoggingDate('Listening UG5k-Serv on port ' + app.get('port'));
    logging.LoggingDate('Express started in ' + app.get('env'));  
});

module.exports = app;
