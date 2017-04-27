var express = require('express');
var logging = require('../../lib/loggingDate.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibHardware = require('../../lib/hardware.js');

//var myLibServicesGateways = require('../../lib/services.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/hardware', hardware);)
	.get(function(req, res) {
  		logging.LoggingDate("GET hardware");
  		myLibHardware.getHardware(function(hardware){
	  		res.json(hardware);
  		});
	});

router.route('/site/:siteId')
	.get(function(req, res) {
  		logging.LoggingDate("GET hardware");
  		myLibHardware.getHardwareBelongsGroup(req.params.siteId, function(hardware){
	  		res.json(hardware);
  		});
	});

router.route('/checkresname/:name/:idCfg')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibHardware.getResNamesInConfig(req.params.name,req.params.idCfg, function(hardware){
			res.json(hardware.error);
		});
	});

/**********************************/
/*  Routes relating to positions  */
/**********************************/
router.route('/positions')
	.put(function(req,res){
		var position = req.body;
		logging.LoggingDate('PUT hardware/positions');
		myLibHardware.updatePosition(position,function(result){
			res.json(result);
		});
	});

router.route('/:hw')
	.get(function(req, res) {
  		logging.LoggingDate("GET hardware/:hw");
		var hw = req.params.hw;
		myLibHardware.getSlave(hw,function(hardware){
			res.json(hardware);
		});
	})
	.delete(function(req, res){
		var hw = req.params.hw;
		logging.LoggingDate("DELETE hardware/:hw");
		myLibHardware.delSlave(hw,function(hardware){
			res.json(hardware);
		});
	})
	.post(function(req,res){
		var hw=req.body;
		logging.LoggingDate("POST hardware/:hw");
		myLibHardware.postSlave(hw,function(hardware){
			res.json(hardware);
		});
	})
	.put(function(req, res){
		var hw = req.body;
		logging.LoggingDate("PUT hardware/:hw");
		myLibHardware.putSlave(hw, function(hw){
			res.status(201).json(hw);
		});
	});

router.route('/:hw/copy')
	.post(function(req,res){
		logging.LoggingDate('Copying slave ' + req.params.hw + ' like ' + req.body.name);
		if (req.params.hw != null && req.body.name != null){
			myLibHardware.copySlave(req.params.hw, req.body, function(result){
				res.json(result);
			});
		}
		});

/**********************************/
/*  Routes relating to resources  */
/**********************************/
router.route('/:slave/resources/:resource')
	.post(function(req,res){
		var slave = req.params.slave;
		var resource = req.body;
		logging.LoggingDate('POST hardware/' + slave + '/resources/:' + resource.IdRecurso);
		myLibHardware.setResource(slave,resource,function(result){
			res.json(result);
		});
	});

module.exports = router;