var express = require('express');
var logging = require('../../lib/loggingDate.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibGateways = require('../../lib/gateways.js');
var myLibServicesGateways = require('../../lib/services.js');
var myLibHardware = require('../../lib/hardware.js');

var async=require('async');

// Middleware Resources
//var myGatewaysModule = require('./resources.js');

// Nest routers by attaching them as middleware:
//router.use('/:gatewayId/resources', myGatewaysModule);

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/gateways', gateways);)
	.get(function(req, res) {
  		logging.LoggingDate("GET gateways");
  		myLibGateways.getGateways(req, res);
	});

router.route('/checkipaddr/:ip/:idCfg')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getGatewaysIpInConfig(req.params.ip,req.params.idCfg, function(gtw){
			res.json(gtw.error);
		});
	});

router.route('/checkipaddr4changesite/:ipb1/:ipb2/:idEmp')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getGatewaysIp4ChangeSite(req.params.ipb1,req.params.ipb2,req.params.idEmp, function(gtw){
			res.json(gtw.error);
		});
	});


router.route('/activeCfg')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getGatewaysBelongsActive(function(gtw){		
			res.json(gtw.data);
		});
	});

router.route('/alive')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getGatewaysAlive(function(gtw){		
			res.json(gtw.data);
		});
	});

router.route('/activeCfg/:gtw')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.gatewaysBelongsActive(req.params.gtw,function(gtw){		
			res.json(gtw.data);
		});
	});

router.route('/changesite/:gateway/:idOldSite/:idNewSite')
	.post(function(req,res){
		logging.LoggingDate('POST /changesite/:' + req.params.gateway + '/:' + req.params.idSite);
		myLibGateways.changeGateWaySite(req.params.gateway,req.params.idOldSite,req.params.idNewSite,function(result){
			res.json(result);
		});
	});

router.route('/operator/:idOperator')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getGatewaysToOperator(req.params.idOperator,function(gtw){		
			res.json(gtw.data);
		});
	});

router.route('/:sourceIdGateway/:targetNameGateway')
	.copy(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		var sourceIdGateway = req.params.sourceIdGateway;
		var targetNameGateway = req.params.targetNameGateway;
		//var sourceIpvGateway = req.body.ipv;
		myLibGateways.copyGateway(sourceIdGateway, targetNameGateway, function(result){
			res.json(result);
		});
	});

router.route('/:gateway')
	.post(function(req,res){
  		logging.LoggingDate("POST gateways/:gateway");
	  	var newGateway = req.body.general;
		var service = req.body.servicios;
		myLibGateways.gatewayExists(req.body.idConf,newGateway,function(result){
			if (result.error == 'ER_DUP_ENTRY')
				res.json(result);
			else{
			  	myLibGateways.postGateway(req.body.idConf, true, true, newGateway,service,function(result){
			  		res.json(result);
			  	});
			}
		});
	})
	.get(function(req, res) {
  		logging.LoggingDate("GET gateways/:gateway");
		var gtw = req.params.gateway;
		if (req.params.gateway == 'null')
			res.render('./services/postGateway');
		else
			myLibGateways.getGateway(req,res,null,gtw,function(gtw){
				res.json({general: gtw});
			});
	})
	.delete(function(req, res){
		var gtw = req.params.gateway;
		logging.LoggingDate("DELETE Gateways/:gateway");
		myLibGateways.delGateway(req, res, gtw);
	})
	.put(function(req, res){
		var gtw = req.body.general;
		var service = req.body.servicios;
		logging.LoggingDate("PUT Gateways/:gateway");
		myLibGateways.gatewayExists(req.body.idConf,gtw,function(result){
			if (result.error == 'ER_DUP_ENTRY'){
				var i=0;
				while (i<result.data.length){
					if (result.data[i].idCGW != gtw.idCGW){
						break;
					}
					else
						i++;
				}

				if (i==result.data.length){
					myLibGateways.putGateway(req, res, gtw,service, function(gtw){
						res.status(201).json(gtw);
					});
				}
				else
					res.json({error:result.error});
			}
			else{
				myLibGateways.putGateway(req, res, gtw,service, function(gtw){
					res.status(201).json(gtw);
				});
			}
		});
	})
	.copy(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.CloneGateway(req.params.gateway,req.body,function(result){
			res.json(result);
		});
	});

/********************************/
/*  Routes relating to services */
/********************************/
router.route('/:gateway/services')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getGateway(req,res,null,req.params.gateway,function(gtw){
			myLibServicesGateways.getServices(req.params.gateway,null,function(data){
				res.json({general: gtw,
						 servicios: data.services});
			});
		});
	});
router.route('/:gateway/services/:service')
	.put(function(req,res){
		logging.LoggingDate('PUT /:' + req.params.gateway + '/services/:' + req.params.service);
		myLibGateways.setService(req.params.gateway,req.params.service,function(result){
			res.json(result);
		});
	});


/*************************************************/
/*  Routes relating to test active configuration */
/*************************************************/
router.route('/:gateway/testconfig')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getIpv(req.params.gateway,function(result){
			if (result.toLocal == -1){
				// No en BD
				logging.LoggingDate(JSON.stringify({idConf:result.ipv.toString(), fechaHora:''},null,'\t'));

		 		res.json({idConf: result.ipv.toString(), fechaHora:''});
			}
			else if (result.toLocal == -2){
				// No en configurción activa
				logging.LoggingDate(JSON.stringify({idConf:result.toLocal.toString(), fechaHora:''},null,'\t'));
					myLibGateways.getTestConfig(result.ipv,function(data){
				 		res.json({idConf: result.toLocal.toString(), fechaHora:''});
			 		});
			}
			else{
				// En configuracion activa
				myLibGateways.getTestConfig(result.ipv,function(data){
		 			res.json(data);
		 		});
			}
			/*
			var ipv = result.ipv;
			if (ipv != -1 && ipv != -2 && ipv != null){
				myLibGateways.getTestConfig(ipv,function(data){
		 			res.json(data);
		 		});
			}
		 	else{
				logging.LoggingDate(JSON.stringify({idConf:ipv.toString(), fechaHora:''},null,'\t'));

		 		res.json({idConf: ipv.toString(), fechaHora:''});
		 	}*/
	 	});
	});


/********************************/
/*  Routes relating to hardware */
/********************************/
router.route('/:gateway/resources')
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getHardware(req.params.gateway,function(result){
			var recursos=[];
			if (result.hardware != null && result.hardware.length > 0){
				async.each(result.hardware,
					function(p,callback){
						myLibHardware.getSlave(p.idSLAVES,function(data){
							if (data != 'NO_DATA'){
								myLibGateways.getResources(data.hardware,p.rank,p.ipv,function(resources){
									recursos = recursos.concat(resources);
									callback();
								});
							}
							else
								callback();
						});
					},
					function(err){
						res.json(recursos);
					}
				);
			}
			else
				res.json(recursos);
		});
		//logging.LoggingDate('Not implemented yet.');
		//res.status(501).json('Not implemented yet.');
	});


/********************************/
/* Routes relating to site 		*/
/********************************/
router.route('/:gateway/site/:site')
	.put(function(req,res){
		logging.LoggingDate('PUT /:' + req.params.gateway + '/site/:' + req.params.site);
		myLibGateways.updateSite(req.params.gateway,req.params.site,function(result){
			res.json(result);
		});
	});


// Nesting routers by attaching them as middleware:
var hardwareRouter=express.Router({mergeParams:true});
router.use('/:gateway/hardware',hardwareRouter);


hardwareRouter.route('/')
	///
	/// GET gateways/:ipv/hardware
	/// 
	.get(function(req,res){
		logging.LoggingDate(req.method + ': ' + req.baseUrl + req.url);
		myLibGateways.getHardware(req.params.gateway,function(result){
			res.json(result);
		});
	});

hardwareRouter.route('/:hardware')
	.post(function(req,res){
		logging.LoggingDate('POST gateways/' + req.params.gateway + '/hardware/' + req.params.hardware);
		var hw=req.body;
		myLibHardware.AssignHardwareToGateway(hw, function(result){
			res.json(result);			
		});
	})
	.delete(function(req,res){
		logging.LoggingDate('DELETE gateways/' + req.params.gateway + '/hardware/' + req.params.hardware);
		var hw=req.body;
		myLibHardware.RemoveHardwareFromGateway(hw, function(result){
			res.json(result);			
		});
	})
	.put(function(req,res){
		logging.LoggingDate('PUT gateways/' + req.params.gateway + '/hardware/' + req.params.hardware);
		var hw=req.body;
		myLibHardware.UpdateHardwareToGateway(hw, function(result){
			res.json(result);			
		});
	});

module.exports = router;
