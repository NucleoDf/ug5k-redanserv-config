var express = require('express');
var logging = require('../../lib/loggingDate.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibHistorics = require('../../lib/historics.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/historics', historics);)
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibHistorics.getHistorics(function(h){
			res.json(h);
		});
	})
	.post(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var Incidencia = req.body;
		myLibHistorics.postHistorics(Incidencia,function(h){
			res.json(h);
		});
	});

router.route('/events/')	
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibHistorics.getHistoricsEvents(function(h){
			res.json(h);
		});
	})
	.post(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var Incidencia = req.body;
		myLibHistorics.postHistorics(Incidencia,function(h){
			res.json(h);
		});
	});

router.route('/alarms/')	
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibHistorics.getHistoricsAlarms(function(h){
			res.json(h);
		});
	})
	.post(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var Incidencia = req.body;
		myLibHistorics.postHistorics(Incidencia,function(h){
			res.json(h);
		});
	});


router.route('/range/:start/:howMany')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var start = req.params.start;
		var howMany = req.params.howMany;
  		myLibHistorics.getHistoricsRange(start,howMany,function(h){
	  		res.json(h);
  		});
	});

router.route('/range/events/:start/:howMany')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var start = req.params.start;
		var howMany = req.params.howMany;
  		myLibHistorics.getHistoricsRangeEvents(start,howMany,function(h){
	  		res.json(h);
  		});
	});

router.route('/range/alarms/:start/:howMany')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var start = req.params.start;
		var howMany = req.params.howMany;
  		myLibHistorics.getHistoricsRangeAlarms(start,howMany,function(h){
	  		res.json(h);
  		});
	});		

router.route('/date/:dateIni')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var startTime = req.params.dateIni;
		var endTime = req.params.dateFin;
  		myLibHistorics.getHistoricsByDatetime(startTime,null,function(h){
	  		res.json(h);
  		});
	});

router.route('/date/:dateIni/:dateFin/:start/:howMany')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var startTime = req.params.dateIni;
		var endTime = req.params.dateFin;
		var start = req.params.start;
		var howMany = req.params.howMany;
  		myLibHistorics.getHistoricsByDatetime(startTime,endTime,start,howMany,function(h){
	  		res.json(h);
  		});
	});

router.route('/group/:group/:dateIni/:dateFin/:start/:howMany')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var data={
			code: req.params.group,
			startDate: req.params.dateIni,
			endDate: req.params.dateFin,
			start: req.params.start,
			howMany: req.params.howMany,
		};
		myLibHistorics.getHistoricsByGroup(data,function(h){
	  		res.json(h);
  		});
	});

router.route('/groups')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibHistorics.getGroups(function(h){
	  		res.json(h);
  		});
	});

router.route('/component/:item/:dateIni/:dateFin/:start/:howMany')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var data={
			code: req.params.item,
			startDate: req.params.dateIni,
			endDate: req.params.dateFin,
			start: req.params.start,
			howMany: req.params.howMany,
		};
		myLibHistorics.getHistoricsByComponent(data,function(h){
	  		res.json(h);
  		});
	});
router.route('/components')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibHistorics.getComponents(function(h){
	  		res.json(h);
  		});
	});

router.route('/code/:code/:dateIni/:dateFin/:start/:howMany')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var data={
			code: req.params.code,
			startDate: req.params.dateIni,
			endDate: req.params.dateFin,
			start: req.params.start,
			howMany: req.params.howMany,
		};
		myLibHistorics.getHistoricsByCode(data,function(h){
	  		res.json(h);
  		});
	});
router.route('/codes')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibHistorics.getCodes(function(h){
	  		res.json(h);
  		});
	});

router.route('/deep/:days')
	.delete(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var days = req.params.days;
		myLibHistorics.deepHistorics(days,function(result){
			res.json(result);
		});
	});

router.route('/tasaEventosFallos/date/:dateIni/:dateFin')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var data={
			startTime: req.params.dateIni,
			endTime: req.params.dateFin
		};
  		myLibHistorics.getStatisticsRateByDatetime(data,function(h){
	  		res.json(h);
  		});
	});
router.route('/tasaEventosFallos/hw/:idHw/:dateIni/:dateFin')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var data={
			code: req.params.idHw,
			startDate: req.params.dateIni,
			endDate: req.params.dateFin
		};
  		myLibHistorics.getStatisticsRateByIdHw(data,function(h){
	  		res.json(h);
  		});
	});
router.route('/tasaEventosFallos/event/:idEvent/:dateIni/:dateFin')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var data={
			code: req.params.idEvent,
			startDate: req.params.dateIni,
			endDate: req.params.dateFin
		};
  		myLibHistorics.getStatisticsRateByIdEvent(data,function(h){
	  		res.json(h);
  		});
	});
/** 20170525 AGL Para los registros de las nuevas estadisticas */
router.route('/statisticset/:dateIni/:dateFin')
	.get(function(req, res) {
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
  		myLibHistorics.getStatisticsSet(req.params.dateIni, req.params.dateFin, function(h) {
	  		res.json(h);
  		});
	});

module.exports = router;
