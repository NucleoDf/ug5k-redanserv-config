var myLibGateways = require('./gateways.js');
var myLibServices = require('./services.js');
var myLibHardware = require('./hardware.js');
var async=require('async');

var logging = require('./loggingDate.js');

/** AGL */
var gcfg = require('../configUlises.json');

/************************************/
/*	FUNCTION: getConfigurations 	*/
/*  PARAMS: 						*/
/************************************/
exports.getConfigurations = function getConfigurations(req, res){
	var cfgs=[];
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
			var query = connection.query('SELECT * FROM CFG', function(err, rows, fields) {
				logging.LoggingDate(query.sql);

			    if (rows.length > 0){
		    		cfgs = rows;
		    		logging.LoggingDate(JSON.stringify({result:cfgs},null,'\t'));
		    	}

				res.json({result: cfgs});
			});

			connection.end();	
		}
	});
};

/********************************/
/*	FUNCTION: getConfiguration 	*/
/*  PARAMS: res,				*/
/*			red,				*/
/*			configuration		*/
/********************************/
exports.getConfiguration = function getConfiguration(req, res, cfg){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		}

		//var query = connection.query('SELECT idCFG,name,description,activa,DATE_FORMAT(ts_activa, "%d/%m/%Y %H:%i:%s") as ts_activa FROM CFG WHERE ??=?',['name', cfg], function(err, rows, fields) {
		var query = connection.query('SELECT c.idCFG,c.name,c.description,c.activa,DATE_FORMAT(ts_activa, "%d/%m/%Y %H:%i:%s") as ts_activa,e.name as nameSite, e.idEMPLAZAMIENTO ' + 
										'FROM  emplazamiento e ' +
										'INNER JOIN cfg c ON c.idCFG = e.cfg_idCFG ' +
    									'WHERE c.name=? ORDER BY nameSite',cfg, function(err, rows, fields) {
			connection.end();
			logging.LoggingDate(query.sql);

		    if (err) throw err;
		    if (rows && rows.length > 0){
				var c=rows;
				logging.LoggingDate(JSON.stringify({result:c},null,'\t'));
				res.json({result:c});
		    }
		    else
		    	res.status(202).json("Configuration not found.");
		});
	});
};

/************************************/
/*	FUNCTION: postConfiguration 	*/
/*  PARAMS: newGateway				*/
/************************************/
exports.postConfiguration = function postConfiguration(req, res, newConfiguration, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		}

		var query = connection.query('INSERT INTO CFG SET ?', newConfiguration, function(err, result) {
			connection.end();
			if (err){
				return f({error: err.code, data: newConfiguration});
			}
			logging.LoggingDate(query.sql);

			newConfiguration.idCFG = result.insertId;
			f({error: null, data: newConfiguration});
		});
	});
};

/********************************/
/*	FUNCTION: putConfiguration 	*/
/*  PARAMS: oldIdConf,			*/
/*			cfg,				*/
/*          f  					*/
/********************************/
exports.putConfiguration = function putConfiguration(oldIdConf, cfg, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		}

		var query = connection.query('UPDATE CFG SET ? WHERE ??=?',[cfg, 'idCFG',oldIdConf], function(err, result){
			connection.end();

			if (err){
				return f({error: err.code, data: newConfiguration});
			}

			logging.LoggingDate(query.sql);


			f({error: null, data: cfg});
		});
	});
};

/********************************/
/*	FUNCTION: delConfiguration 	*/
/*  PARAMS: res,				*/
/*			req,				*/
/*			cfgs				*/
/********************************/
exports.delConfiguration = function delConfiguration(req, res, cfg, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return f({error: err.code, data: cfg});
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		}

		var query = connection.query('DELETE FROM CFG WHERE ??=?',['name',cfg], function(err, result){
			logging.LoggingDate(query.sql);
				f({error: null, data: cfg});

			connection.end();
		});
	});
};

/************************************/
/*	FUNCTION: copyConfiguration 	*/
/*  PARAMS: sourceCfg,				*/
/*			targetCfg				*/
/************************************/
exports.copyConfiguration = function copyConfiguration(src, trgt, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		}

		// Crear la configuración
		var query = connection.query('INSERT INTO CFG SET ?', trgt, function(err, result) {
			if (err){
				connection.end();
				return f({error: err.code, data: trgt});
			}
			logging.LoggingDate(query.sql);
			var cfgId = result.insertId;

			// Crear los emplazamientos asociados a la configuración
			query = connection.query('INSERT INTO emplazamiento (cfg_idCFG,name) (SELECT ?, name FROM emplazamiento WHERE cfg_idCFG=?)',[result.insertId,src],function(err,result){
				if (err){
					connection.end();
					return f({error: err.code, data: trgt});
				}
				logging.LoggingDate(query.sql);

				// Crear las pasarelas asociadas a los emplazamientos correspondientes a la configuración
				query = connection.query('INSERT INTO cgw (EMPLAZAMIENTO_idEMPLAZAMIENTO,REGIONES_idREGIONES,servicio,name,dualidad,ipv,ips,nivelconsola,puertoconsola,nivelIncidencias) ' +
							'(SELECT ez.idEMPLAZAMIENTO,c.REGIONES_idREGIONES,c.servicio,c.name,c.dualidad,c.ipv,c.ips,c.nivelconsola,c.puertoconsola,c.nivelIncidencias FROM cgw c ' +
								'INNER JOIN emplazamiento e ON e.CFG_idCFG=? AND e.idEMPLAZAMIENTO = c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    							'INNER JOIN emplazamiento ez on ez.CFG_idCFG=? AND e.name = ez.name)',[src,cfgId],function(err,result){
					logging.LoggingDate(query.sql);
					if (err){
						connection.end();
						return f({error: err.code, data: trgt});
					}

					// Guarda el id de la primera cgw dada de alta
					// Se utiliza al dar de alta el hardware
					var _idCgw = result.insertId;

					// Crear las pasarelas en las tablas cgw_estado y cgw_cfg 
					// 
					var queryCgw_estado = connection.query('INSERT INTO cgw_estado (cgw_idCGW,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO,viva) ' +
							'SELECT c.idCGW,c.EMPLAZAMIENTO_idEMPLAZAMIENTO,0 FROM cgw c ' +
								'INNER JOIN emplazamiento e ON e.CFG_idCFG=? AND e.idEMPLAZAMIENTO = c.EMPLAZAMIENTO_idEMPLAZAMIENTO',cfgId,function(err,result){
									logging.LoggingDate(queryCgw_estado.sql);
									if (err){
										connection.end();
										return f({error: err.code, data: trgt});
									}
    							});
					var queryCgw_Cfg = connection.query('INSERT INTO cgw_cfg (CFG_idCFG,CGW_idCGW,Activa,LastUpdate,Sincro) ' +
							'SELECT ?,c.idCGW,0,null,0 FROM cgw c ' +
								'INNER JOIN emplazamiento e ON e.CFG_idCFG=? AND e.idEMPLAZAMIENTO = c.EMPLAZAMIENTO_idEMPLAZAMIENTO',[cfgId,cfgId],function(err,result){
									logging.LoggingDate(queryCgw_Cfg.sql);
									if (err){
										connection.end();
										return f({error: err.code, data: trgt});
									}
    							});
					
					// Crear las cpus pertenecientes a las pasarelas asociadas 
					// a los emplazamientos correspondientes a la configuración
					query = connection.query('INSERT INTO cpu (CGW_idCGW,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg) ' +
								'(SELECT c2.idCGW, c.num,c.tlan,c.ip0,c.ms0,c.ip1,c.ms1,c.ipb,c.msb,c.ipg FROM cpu c ' +
									'INNER JOIN cgw cgw ON cgw.idCGW = c.CGW_idCGW ' +
									'INNER JOIN emplazamiento e ON e.CFG_idCFG=? AND e.idEMPLAZAMIENTO = cgw.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
									'INNER JOIN emplazamiento ez on ez.CFG_idCFG=? ' +
    								'INNER JOIN cgw c2 ON c2.EMPLAZAMIENTO_idEMPLAZAMIENTO = ez.idEMPLAZAMIENTO AND c2.ipv=cgw.ipv)',[src,cfgId],function(err,result){
						logging.LoggingDate(query.sql);
						if (err){
							connection.end();
							return f({error: err.code, data: trgt});
						}

						// Obtener los ids de las pasarelas de la configuración original
						query = connection.query('SELECT C.idCGW,c.name FROM cgw c ' +
													'INNER JOIN emplazamiento e ON e.CFG_idCFG=? AND e.idEMPLAZAMIENTO = c.EMPLAZAMIENTO_idEMPLAZAMIENTO',src,function(err,rows,fields){
							if (err == null && rows != null && rows.length > 0){
								var _numPasarelas = 0;

								async.eachSeries(rows,
									function(gtw,callback){
										async.waterfall([
											function(callback){
												var posTargetIds=[];
												var i = 0;
												async.whilst(
													function(){return i<4;},
													function(callback){
														var nameSlave = gtw.name + '_' + i++;
														///	Copiar slaves
													 	var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)',nameSlave,function(err,resultSlaves){
													 		logging.LoggingDate(querySlaves.sql);
													 		posTargetIds.push(resultSlaves.insertId);

													 		/// Copiar hardware
													 		var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)',
													 				[_idCgw + _numPasarelas,resultSlaves.insertId,i-1],function(err,resultHw){
																logging.LoggingDate(queryHw.sql);

																callback();
													 		});
													 	});
													},
													function(err){
														///
														/// Ha finalizado de copiar slaves y hardware
														/// 
														callback(null,posTargetIds);
													}
												);											
											}],
											function(err,targets){
												_numPasarelas++;
												myLibGateways.getHardwareByIdGateway(gtw.idCGW,function(result){
													var cuantos = 0;
													if (result.hardware != null && result.hardware.length > 0){
														async.each(result.hardware,
															function(p,callback){
																myLibGateways.copyResources(p.idSLAVES,targets[cuantos++],function(error){
																	callback();
																});
															},
															function(err){
																callback(null);
															}
														);
													}
												});							 			

											}
										);
									},
									function(err){
										connection.end();

										if (err != null)
											f({error: err.code, data: trgt});
										else{
											f({error: null, data: trgt});
										}	
									}
								);
							}
						});
					});
				});
			});
		});
	});
};

/********************************/
/*	FUNCTION: getFreeGateways 	*/
/*  PARAMS: 					*/
/********************************/
exports.getFreeGateways = function getFreeGateways(cfg, f){
	var gtws=[];
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
			var query = "";
			query=connection.query('SELECT b.*,a.Activa,e.name as nameSite, c.idCFG,c.name as nameCfg,c.description,c.activa,c.ts_activa FROM (SELECT * FROM CGW_CFG WHERE CFG_idCFG=?) a RIGHT JOIN' + 
										' CGW b ON a.CGW_idCGW = b.idCGW' +
										' INNER JOIN emplazamiento e ON b.EMPLAZAMIENTO_idEMPLAZAMIENTO=e.idEMPLAZAMIENTO ' +
										' INNER JOIN cfg c ON c.idCFG = e.CFG_idCFG ' +
										' WHERE a.CGW_idCGW IS NULL ORDER BY nameCfg,e.name,b.name', cfg, function(err, rows, fields) {
				logging.LoggingDate(query.sql);
				if (err){
					return f({error: err.code, result: null});
				}

			    if (rows.length > 0){
		    		gtws = rows;
		    		logging.LoggingDate(JSON.stringify({error: null, result: gtws},null,'\t'));
		    	}
				connection.end();	
				f({error: null, result: gtws});
			});
		}
	});
};

/****************************************/
/*	FUNCTION: activateConfiguration 	*/
/*  PARAMS: idCFG 						*/
/****************************************/
exports.activateConfiguration = function activateConfiguration(idCFG,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			// Comprobar si tiene pasarealas. En caso contrario no se puede activar esta configuración
			var queryHasGateways = connection.query('SELECT COUNT(*) as cuantos FROM CGW a ' +
														'INNER JOIN emplazamiento e ON a.EMPLAZAMIENTO_idEMPLAZAMIENTO=e.idEMPLAZAMIENTO ' +
														'WHERE e.CFG_idCFG=?', idCFG, function(err, rows, fields) {
				if (!err && rows != null && rows.length > 0){
					if (rows[0].cuantos == 0){
						connection.end();
						return f({result:false, count:0});
					}
					else{
						// Desactivar la configuración activa
						var query = connection.query('UPDATE CFG SET activa=0 WHERE activa=1', function(err, result){
							logging.LoggingDate(query.sql);
							if (err){
								connection.end();
								return f({result:false, count:1});
							}

							var queryCgwCfg = connection.query('UPDATE CGW_CFG SET Activa=0,Sincro=0 WHERE Activa=1', function(err, result){
								logging.LoggingDate(queryCgwCfg.sql);
								if (err){
									connection.end();
									return f({result:false, count:1});
								}

								// Activar la configuración 
								var queryActive = connection.query('UPDATE CFG SET activa=1,ts_activa=UTC_TIMESTAMP() WHERE idCFG=?', idCFG, function(err, result){
									logging.LoggingDate(queryActive.sql);
									if (err){
										connection.end();
										return f({result:false, count:1});
									}

									var queryGw = connection.query('DELETE FROM CGW_CFG WHERE CFG_idCFG=? AND Activa=-1', idCFG, function(err, result){
										logging.LoggingDate(queryGw.sql);
										if (err){
											connection.end();
											return f({result:false, count:1});
										}

										queryCgwCfg = connection.query('UPDATE CGW_CFG SET Activa=1, Sincro=0, LastUpdate=UTC_TIMESTAMP() WHERE CFG_idCFG=?', idCFG, function(err, result){
											connection.end();
											logging.LoggingDate(queryCgwCfg.sql);
											if (err){
												return f({result:false, count:1});
											}
											
										f({result:true, count:1});
										});
									});
								});
							});
						});
					}
				}
				else{
					connection.end();
					return f({result:false, count:1});
				}
			});
		}
	});
};


/************************************************************************/
/*	FUNCTION: activateGateways		 									*/
/*  PARAMS: idCFG 														*/
/*          listOfGateways												*/
/*  DESC: Activa configuración en las gateways pasadas en arrayOfGtw 	*/
/************************************************************************/
exports.activateGateways = function activateGateways(idCfg,arrayOfGtw,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			queryCgwCfg = connection.query('UPDATE CGW_CFG SET Sincro=0, LastUpdate=UTC_TIMESTAMP(), Activa=1 WHERE CFG_idCFG=? AND CGW_idCGW IN (?)', [idCfg,arrayOfGtw], function(err, result){
				connection.end();
				logging.LoggingDate(queryCgwCfg.sql);
				if (err){
					return f(false);
				}

				f(true);
			});
		}
	});
};

exports.postConfigurationFromGateway = function postConfigurationFromGateway(req, res, general, servicios, hardware, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
			// Crear el servicio.
			if (servicios != null && servicios.name == null)
				servicios.name = general.name + '_SERVICE';


			var slaves=[];
			
			async.waterfall([
				function(callback){
					// Localizar la gateway a partir de la ip de la CPU pasada como parámetro en el POST
					myLibGateways.getIpv(req.params.gateway,function(result){
						if (result.error != null)
							return callback(result.error);

						//callback(null,result.idCGW);
						if (result.ipv == -1){	// result.data => ipv de la gateway
							if (servicios.idSERVICIOS == null){
								myLibServices.postService(servicios,function(result){
									servicios.idSERVICIOS = result.service.idServicios;
									// SI LA GATEWAY NO EXISTE EN LA CONFIGURACIÓN, SE INSERTA.
									myLibGateways.postGateway(req.body.idConf, false, true, general, servicios, function(result){
										//idCGW = result.data.idCGW;
										exports.assignGatewayToConfiguration({"CFG_idCFG" : result.idCfg, "CGW_idCGW": result.data.idCGW, Activa:1, Sincro:2}, function(result){
								    		callback(null,result.data.CGW_idCGW);
								    	});
										//callback(null, result.data.idCGW);
									});
								});
							}
							else{
								myLibGateways.postGateway(req.body.idConf, false, true, general, servicios, function(result){
									myLibGateways.assignGatewayToConfiguration({"CFG_idCFG" : result.idCfg, "CGW_idCGW": result.data.idCGW, Activa:1, Sincro:2}, function(result){
							    		callback(null,result.data.CGW_idCGW);
							    	});
									//callback(null, result.data.idCGW);
								});	
							}
						}
						else{
							// SI YA EXISTE, SE OBTIENE EL idCGW PARA ACTUALIZAR (ELIMINAR/INSERTAR) EL HARDWARE
							//myLibHardware.RemoveHardwareFromGateway({CGW_idCGW:rows[0].idCGW,SLAVES_idSLAVES:null},function(result){
								servicios.idSERVICIOS = result.servicio;
								general.idCGW = result.idCGW;
								
								// SE ACTUALIZAN LOS DATOS DE LA PASARELA Y SUS SERVICIOS ASIGNADOS
								myLibGateways.putGateway(req, res, general, servicios, function(gtw){
									callback(null, result.idCGW);
								});
							//})
						}
					});
				}],
				function(err, idCGW){
					var numSlave = 0;
					// INSERTAR CADA ESCLAVA RECIBIDA
					async.eachSeries(hardware.slv,
						function(s,callback){
							if (s.tp != -1){	// Configurada
								// Comprobar si la CGW <idCGW> tiene una esclava configurada en la posición <numSlave>
								var querySlave=connection.query('SELECT SLAVES_idSLAVES FROM hardware ' +
																	'WHERE CGW_idCGW=? AND rank=?', [idCGW,numSlave], function(err, rows, fields){
									logging.LoggingDate(querySlave.sql);

									s.rank = numSlave;

									if (err)	callback(err);
									else if (rows != null && rows.length > 0){
										var idSlave = rows[0].SLAVES_idSLAVES;

										//slaves[numSlave++]=idSlave;

										// Eliminar esta slave
										var updateSlave=connection.query('DELETE FROM slaves WHERE idSLAVES=?', idSlave, function(err, result){
											logging.LoggingDate(updateSlave.sql);
											if (err) return callback(err);

											//callback();	
										});
									}

									// Insertar la esclava con los nuevos datos recibidos
									var slave={};

									slave.name = general.name + "_" + s.rank;
									slave.tp = s.tp;

									// Eliminar una posible slave con este nombre
									//var queryDelSlave=connection.query('DELETE FROM slaves WHERE name=?',slave.name,function(err,result){
									//	logging.LoggingDate(queryDelSlave.sql);
										var queryInsertSlaves=connection.query('INSERT INTO slaves SET ?', slave, function(err, result){
											logging.LoggingDate(queryInsertSlaves.sql);
											if (err) callback(err);
											else{
												var hw={};
												hw.CGW_idCGW = idCGW;
												hw.SLAVES_idSLAVES= result.insertId;
												hw.rank = s.rank;

												slaves[numSlave++]=result.insertId;
								
												// INSERTAR EL REGISTRO HARDWARE ASOCIADO A LA ESCLAVA Y A LA PASARELA
												var queryInsertHw=connection.query('INSERT INTO hardware SET ?', hw, function(err,result){
													logging.LoggingDate(queryInsertHw.sql);
													if (err) return callback(err);

													callback();	
												});
											}
										});
									//})
								});
							}
							else{
								slaves[numSlave]=-1;

								// Slave no configurada
								myLibHardware.RemoveHardwareFromGateway({CGW_idCGW:rows[0].idCGW,SLAVES_idSLAVES:null,rank:numSlave},function(result){
									numSlave++;
									callback();
								});
							}
						},
						function(err){
							connection.end();

							f({error:err,slaves:slaves});
						}
					);	// End async.each
				}
			);
		}
	});
};

exports.getSiteName = function getSiteName(cfgId,siteName,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		}

		//var query = connection.query('SELECT idCFG,name,description,activa,DATE_FORMAT(ts_activa, "%d/%m/%Y %H:%i:%s") as ts_activa FROM CFG WHERE ??=?',['name', cfg], function(err, rows, fields) {
		var query = connection.query('SELECT idEMPLAZAMIENTO ' + 
										'FROM  emplazamiento ' +
    									'WHERE name=? AND cfg_idCFG=?',[siteName,cfgId], function(err, rows, fields) {
			connection.end();
			logging.LoggingDate(query.sql);

		    if (err) throw err;
		    if (rows && rows.length > 0){
				logging.LoggingDate(JSON.stringify({result:rows},null,'\t'));
				f(rows[0]);
		    }
		    else
		    	f(null);
		});
	});
};

exports.getActiveConfiguration = function getActiveConfiguration(req, res, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			// Desactivar la configuración activa
			var query = connection.query('SELECT c.idCFG,c.name FROM cfg c ' +
											'INNER JOIN cgw_cfg cc ON cc.CFG_idCFG=c.idCFG ' +
    										'WHERE cc.activa', function(err, rows, fields){
				connection.end();
				logging.LoggingDate(query.sql);
				if (err || rows==null || rows.length == 0){
					return f(null);
				}

				return f({idCFG:rows[0].idCFG,name:rows[0].name});
			});
		}
	});
};

exports.resetGatewaysSynchroState = function resetGatewaysSynchroState(f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			
			var query = connection.query('UPDATE cgw_cfg SET Sincro = 3', function(err, result1) {
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				var query2=connection.query('REPLACE cgw_estado (SELECT idCGW,EMPLAZAMIENTO_idEMPLAZAMIENTO,0 FROM cgw)',function(err,result2){
					if (err){
							logging.LoggingDate(query2.sql);
							connection.end();	
							return f(err ? err : 'NO_DATA');
						}

					connection.end();	
					logging.LoggingDate(query2.sql);
					f({error: err, result: result1.affectedRows + result2.affectedRows});
				});
			});
		}
	});
};

exports.SP_cfg = function SP_cfg(cfg, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			
			var query = connection.query('CALL SP_ReportCfg(?)',cfg, function(err, rows) {
				connection.end();	
				if (err){
					logging.LoggingDate(query.sql);
					return f(err ? err : 'NO_DATA');
				}

				f({error: err, result: rows});
			});
		}
	});
};

exports.getListOfGateways = function getListOfGateways(f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			
			var query = connection.query('SELECT * FROM listOfGateways', function(err, rows) {
				connection.end();	
				if (err){
					logging.LoggingDate(query.sql);
					return f(err ? err : 'NO_DATA');
				}

				f({error: err, result: rows});
			});
		}
	});
};

exports.putListOfGateways = function putListOfGateways(gtw, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var query;			
			if (gtw.Gateway != null){
				query = connection.query('INSERT INTO listOfGateways SET ?', gtw, function(err, result) {
					connection.end();	
					if (err){
						logging.LoggingDate(query.sql);
						return f(err ? err : 'NO_DATA');
					}

					f({error: err, result: result.insertId});
				});
			}
			else{
				query = connection.query('TRUNCATE TABLE listOfGateways', function(err, result) {
					connection.end();	
					if (err){
						logging.LoggingDate(query.sql);
						return f(err ? err : 'NO_DATA');
					}

					f({error: err, result: null});
				});
			}
		}
	});
};

exports.postConfigurationFromJsonFile = function(idcfg, idSite, config, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
			var slaves=[];
			var estadoPasarela=0;//-1: Error || 0: OK || 1: Nombre duplicado || 2: Ips duplicadas
			
			async.waterfall([
				function(callback){
					// Buscar config.general.ipv en la bd
					// Si existe no se genera la importación y mensaje de error o se borra la gtw
					// existente
					var query = connection.query('SELECT COUNT(name) as cuantos '+
						'FROM cgw '+
						'WHERE idCGW IN ( '+
						'SELECT CGW_idCGW '+
						'FROM cgw_cfg '+
						'WHERE CFG_idCFG = ?) '+
						'AND name LIKE ?',[idcfg,config.general.name],
					function(err,rows){
						if(err)
							callback(err,-1);
						else if (rows[0].cuantos != 0) {
							estadoPasarela = 1;//1: Nombre duplicado
							config.general.name = config.general.name + '(Copia)';
						}
						
						var query = connection.query(
							'SELECT c.ipb ' +
							'FROM cpu c ' +
							'LEFT JOIN cgw_cfg c2 ON c2.CGW_idCGW = c.CGW_idCGW ' +
							'LEFT JOIN cfg c3 ON c3.idCFG = c2.CFG_idCFG ' +
							'WHERE c3.idCFG = ?', idcfg,
						function(err,rows) {
							if (err)
								callback(err, -1);
							else if (rows != 0) {
								//CAMBIAR EL VALOR DE LAS IPS!!!!!
								for (var i=0;i<rows.length;i++) {
									for(var j=0;j<2;j++) {
										if (rows[i].ipb == config.general.cpus[j].ipb)
											config.general.cpus[j].ipb = generaIp4ImportJson(rows, config.general.cpus[j].ipb);
											estadoPasarela = 2; //2: Ip duplicada
									}
								}
							}
							
							// CREAR SELECT PARA OBTENER NOMBRE LA CONFIG A PARTIR DE idCfg
							//
							query = connection.query('SELECT name FROM cfg WHERE idCFG=?', idcfg, function (err, rows) {
								if (err == null) {
									config.idConf = rows[0].name;
									// CREAR SELECT PARA OBTENER NOMBRE DEL EMPLAZAMIENTO A PARTIR DE idSite
									//
									query = connection.query('SELECT name FROM emplazamiento WHERE idEMPLAZAMIENTO=?', idSite, function (err, rows) {
										if (err == null) {
											config.general.emplazamiento = rows[0].name;
											// Crear el servicio.
											//config.servicios.name=config.servicios.name + '_IMPORTED_SERVICE';
											myLibServices.postService(config.servicios, function (result) {
												config.servicios.idSERVICIOS = result.service.idSERVICIOS;
												// SI LA GATEWAY NO EXISTE EN LA CONFIGURACIÓN, SE INSERTA.
												myLibGateways.postGateway(config.idConf, false, true, config.general, config.servicios, function (result) {
													myLibGateways.assignGatewayToConfiguration({
														"CFG_idCFG": result.idCfg,
														"CGW_idCGW": result.data.idCGW,
														Activa: 1,
														Sincro: 2
													}, function (result) {
														callback(null, result.data.CGW_idCGW);
													});
												});
											});
										}
										else
											callback(err);
									});
								}
								else
									callback(err);
							});
						});
					});
				}],
				function(err, idCGW){
					if (err != null || idCGW == -1)
						f({error:err != null ? err : -1,slaves:null});

					var numSlave = 0;
					// INSERTAR CADA ESCLAVA RECIBIDA
					async.eachSeries(config.hardware.slv,
						function(s,callback){
							if (s.tp != -1){	// Configurada
								// Comprobar si la CGW <idCGW> tiene una esclava configurada en la posición <numSlave>
								var querySlave=connection.query('SELECT SLAVES_idSLAVES FROM hardware ' +
																	'WHERE CGW_idCGW=? AND rank=?', [idCGW,numSlave], function(err, rows, fields){
									logging.LoggingDate(querySlave.sql);

									s.rank = numSlave;

									if (err)	callback(err);
									else if (rows != null && rows.length > 0){
										var idSlave = rows[0].SLAVES_idSLAVES;

										//slaves[numSlave++]=idSlave;

										// Eliminar esta slave
										var updateSlave=connection.query('DELETE FROM slaves WHERE idSLAVES=?', idSlave, function(err, result){
											logging.LoggingDate(updateSlave.sql);
											if (err) return callback(err);

											//callback();	
										});
									}

									// Insertar la esclava con los nuevos datos recibidos
									var slave={};

									slave.name = config.general.name + "_" + s.rank;
									slave.tp = s.tp;

									// Eliminar una posible slave con este nombre
									//var queryDelSlave=connection.query('DELETE FROM slaves WHERE name=?',slave.name,function(err,result){
										//logging.LoggingDate(queryDelSlave.sql);
										var queryInsertSlaves=connection.query('INSERT INTO slaves SET ?', slave, function(err, result){
											logging.LoggingDate(queryInsertSlaves.sql);
											if (err) callback(err);
											else{
												var hw={};
												hw.CGW_idCGW = idCGW;
												hw.SLAVES_idSLAVES= result.insertId;
												hw.rank = s.rank;

												slaves[numSlave++]=result.insertId;
								
												// INSERTAR EL REGISTRO HARDWARE ASOCIADO A LA ESCLAVA Y A LA PASARELA
												var queryInsertHw=connection.query('INSERT INTO hardware SET ?', hw, function(err,result){
													logging.LoggingDate(queryInsertHw.sql);
													if (err) return callback(err);

													callback();	
												});
											}
										});
									//})
								});
							}
							else{
								slaves[numSlave]=-1;

								// Slave no configurada
								myLibHardware.RemoveHardwareFromGateway({CGW_idCGW:rows[0].idCGW,SLAVES_idSLAVES:null,rank:numSlave},function(result){
									numSlave++;
									callback();
								});
							}
						},
						function(err){
							connection.end();

							f({error:err,slaves:slaves});
						}
					);	// End async.each
				}
			);
		}
	});
};

function generaIp4ImportJson(ipList, originalIp) {
	var newIp='';
	var k=1;
	var incIpDigit=0;
	var newIp = originalIp.split(".");
	var noNewIpFound=false;
	do {
		if (parseInt(newIp[3]) < 255) {
			incIpDigit = parseInt(newIp[3]) + k;
			newIp = newIp[0] + '.' + newIp[1] + '.' + newIp[2] + '.' + incIpDigit.toString();
		}
		
		for(var i=0; i<ipList.length;i++) {
			if(newIp == ipList[i]) {
				noNewIpFound = false;
				break;
			}
			else
				noNewIpFound = true;
		}
	} while(!noNewIpFound)
	
	return newIp;
}