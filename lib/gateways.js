var async=require('async');
var servicesLib=require('./services');
var myLibResources = require('./resources.js');
var myLibHardware = require('./hardware.js')
var logging = require('./loggingDate.js');



function getTodayDateTimeFormatted(){
	var myDate = new Date();
	var dateTime = myDate.toString().split(" ");
	
	var year = dateTime[3];
	var day = dateTime[2];
	var time = dateTime[4];
	
	var monthNumber = myDate.getMonth()+1;
	if(monthNumber.toString().length === 1)
		var completeMonthNumber = '0'+monthNumber.toString();
	
	//Format yyyy-MM-dd HH:MM:ss
	return(year+'-'+completeMonthNumber+'-'+day+' '+time);
}

function altaCgwBD (ip) {
	var mySql = require('mySql');
	var connection = mySql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'U5K-G',
		database: 'ug5k'
	});
	
	connection.connect(function (err, usrs) {
		if (err) {
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else {
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			var dateTime = getTodayDateTimeFormatted();
			var dummyCfg = {name:'CFG-DEF',
							description:'Nuevas Configuraciones',
							activa:'1',
							ts_activa:dateTime};
			
			var query = connection.query('SELECT idCFG,activa FROM cfg WHERE name=?', dummyCfg.name, function (err, rows, fields) {
				if (err) {
					logging.LoggingDate(query.sql);
					f(false);
				}
				else if (rows.length > 0) {
					connection.end();
				}
				else {
					var queryInsertCfg = connection.query('INSERT INTO cfg SET ?',dummyCfg, function(err, result) {
						if (err) {
							logging.LoggingDate(query.sql);
							f(false);
						}
						else{
							var empName = 'EMPL-DEF';
							var queryInsertSite = connection.query('INSERT INTO emplazamiento SET cfg_idCFG=?,name=?',[result.insertId, empName], function(err, resultSite) {
								if (err) {
									logging.LoggingDate(query.sql);
									f(false);
								}
								else{
									/*var idEmpla=result.insertId;
									var query = connection.query('INSERT INTO CGW SET servicio=?,EMPLAZAMIENTO_idEMPLAZAMIENTO=?,name=?,dualidad=?,ipv=?,ips=?,nivelconsola=?,puertoconsola=?,nivelIncidencias=?',
									[servicioId,gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,gtw.name,gtw.dualidad,ip,gtw.ips,gtw.nivelconsola,gtw.puertoconsola,gtw.nivelIncidencias], function(err, result) {
										if (err) {
											logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
										}
										else {
											var seguimos = 1;
										}
									});*/
								}
							});
						}
					});
				}
			});
		}
	});
}

exports.changeGateWaySite = function changeGateWaySite(IdGateway, targetGatewaySite, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'U5K-G',
		database : 'ug5k'
	});
	
	connection.connect(function(err, usrs) {
		if (err) {
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else {
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			
			var gtw2Change={};
			
			// CODIGO ASÍNCRONO
			async.waterfall([
				myFirstFunction,
				mySecondFunction
			], function (err, result) {
					f({data: result});
			});
			
			function myFirstFunction(callback) {
				var query=connection.query('SELECT c.name, c.ipv, cp.ipb '+
											'FROM cgw c '+
											'INNER JOIN cpu cp ON c.idCGW = cp.CGW_idCGW '+
											'WHERE idCGW = ?',IdGateway ,
					function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err || rows.length == 0){
							return callback(rows.length == 0 ? 'NO_DATA' : err);
						}
						else {
							gtw2Change.name=rows[0].name;
							gtw2Change.ipv=rows[0].ipv;
							gtw2Change.ipb1=rows[0].ipb;
							gtw2Change.ipb2=rows[1].ipb;
							
							return callback(null, gtw2Change);
						}
					}
				);
			}
			function mySecondFunction(gtw, callback) {
				// arg1 now equals 'one' and arg2 now equals 'two'
				var query=connection.query('SELECT c.idCGW, c.name, c.ipv, cp.ipb '+
											'FROM cgw c '+
											'INNER JOIN cpu cp ON c.idCGW = cp.CGW_idCGW '+
											'WHERE c.EMPLAZAMIENTO_idEMPLAZAMIENTO IN '+
											'(SELECT idEMPLAZAMIENTO '+
											'FROM emplazamiento '+
											'WHERE cfg_idCFG = '+
											'	(SELECT cfg_idCFG '+
											'FROM emplazamiento '+
											'WHERE idEMPLAZAMIENTO = ?))', targetGatewaySite ,
					function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err || rows.length == 0){
							return callback(rows.length == 0 ? 'NO_DATA' : err);
						}
						else {
							for(var i=0;i<rows.length;i++) {
								if(gtw.name == rows[i].name)
									return callback(null, 'DUP_ENTRY_NAME');
								/*else if(gtw.ipb1 == rows[i].ipb )
									return callback(null, 'DUP_ENTRY_IP1');
								else if(gtw.ipb2 == rows[i].ipb)
									return callback(null, 'DUP_ENTRY_IP2');*/
							}
							return callback(null, null);
						}
					}
				);
			}
		}
	});
}

/****************************/
/*	FUNCTION: getGateways 	*/
/*  PARAMS: 				*/
/****************************/
exports.getGateways = function getGateways(req, res, cfg, gtw){
	var gtws=[];
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
			var query = "";
			if (cfg == null || cfg == 'null'){
				query=connection.query('SELECT c.*,cc.Activa,DATE_FORMAT(cc.LastUpdate, "%d/%m/%Y %H:%i:%s") as LastUpdate, cc.Sincro, cc.CFG_idCFG, ce.Viva, e.name as nameSite FROM cgw c ' +
										'INNER JOIN emplazamiento e ON c.EMPLAZAMIENTO_idEMPLAZAMIENTO=e.idEMPLAZAMIENTO ' +
										'LEFT JOIN cgw_cfg cc ON c.idCGW=cc.CGW_idCGW ' + 
										'LEFT JOIN cgw_estado ce ON c.idCGW=ce.cgw_idCGW ' +
										'ORDER BY c.name,-cc.Activa', function(err, rows, fields) {
					logging.LoggingDate(query.sql);

				    if (rows != null && rows.length > 0){
				    	var names=[]
				    	async.each(rows,
				    		function(r,callback){
				    			var index = names.indexOf(r.idCGW);
				    			if (index == -1){
				    				gtws.push(r)
				    				names.push(r.idCGW);
						    		callback();
				    			}
				    			else{
			    					gtws[index].Activa = gtws[index].Activa == 1 ? 1 : r.Activa;
						    		callback();
				    			}
				    		},
							function(err){
								res.json({general: gtws})
							}
						);
			    	}
			    	else
			    		res.json({general:null})
				});
			}
			else{
				if (gtw == null){
					query=connection.query('SELECT a.*, b.Activa, b.Sincro, ce.Viva, e.name as nameSite, c.idCFG,c.name as nameCfg, c.description, c.activa, c.ts_activa FROM CGW a ' +
											'INNER JOIN emplazamiento e ON a.EMPLAZAMIENTO_idEMPLAZAMIENTO=e.idEMPLAZAMIENTO ' +
											'INNER JOIN cfg c ON c.idCFG=e.CFG_idCFG ' +
											'LEFT JOIN CGW_CFG b ON a.idCGW = b.CGW_idCGW ' +
											'LEFT JOIN cgw_estado ce ON a.idCGW=ce.cgw_idCGW ' +
											'WHERE c.idCFG=? ORDER BY e.name, a.name', cfg, function(err, rows, fields) {
						logging.LoggingDate(query.sql);

					    if (rows.length > 0){
				    		gtws = rows;
				    		logging.LoggingDate(JSON.stringify({general: gtws},null,'\t'));
				    	}

						res.json({general: gtws})
					});
				}
			}

			connection.end();	
		}
	});
};

/****************************/
/*	FUNCTION: postGateway 	*/
/*  PARAMS: newGateway		*/
/****************************/
exports.postGateway = function postGateway(idConf, assignToCfg, ignoreName, newGateway, service, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			return logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			/// Comprobar que el nombre o la dirección IP de la pasarela no exista
			var querySelect = connection.query('SELECT name FROM cgw WHERE name=?',[newGateway.name],function(err,rows){
				if (!ignoreName && (err != null || rows.length != 0)){
					connection.end();
					return f({error:'ER_DUP_ENTRY'});
				}
				else{
					var idConfig;
					async.waterfall([
						// Update SERVICIO (including SIP, SNMP, WEB, GRAB and SINCR components)
						function(callback){
							if (service.idSERVICIOS != null){
								servicesLib.getServices(null,service.idSERVICIOS,function(result){
									if (result.services != null){
										servicesLib.updateServices(connection, service, function(err){
											if (err) return callback(err);
											callback(null, service.idSERVICIOS);
										});
									}
									else{
										servicesLib.insertServices(connection, service, function(err,serviceId){
											if (err) return callback(err);
											callback(null, serviceId);
										});
									}
								})
							}
							else{
								callback(null, '0');
							}
						},
						// Insert CGW
						function(servicioId, callback){
							// Saber si la pasarela que se está dando de alta
							// pertenece a la configuracion activa
							var isInActiveCfg = false;
							// Crear copia del objeto newGateway
							var gtw = JSON.parse(JSON.stringify(newGateway));
							// Eliminar del JSON gtw la parte de CPU.
							delete gtw.cpus;
							delete gtw.idCGW;

							// Localizar el emplazamiento
							getEmplazamiento(gtw.emplazamiento,idConf,function(result){
								if (result.error === null){
									gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = result.data.idEMPLAZAMIENTO;
									idConfig = result.data.idCFG;
									isInActiveCfg = result.data.Activa;

									delete gtw.emplazamiento;

									if (servicioId != null){
										// Puede ser, sobre to-do con el paso de la versión Beta5 a Beta6,
										// que exista la pasarela pero no su correspondiente registro en CGW_FISICA
										// en cuyo caso, hay que eliminar la pasarela con los datos existentes
										// y así evitar que aparezcan pasarelas duplicadas
										// var qDelete = connection.query('DELETE FROM CGW WHERE name=?',gtw.name,function(err,result){
										// 	if (err){
										// 		logging.loggingError("SQL: " + qDelete.sql + "\nERROR: " + err.message);
										// 		return callback(null, {error: err, data: newGateway});
										// 	}
										
										var query = connection.query('INSERT INTO CGW SET servicio=?,EMPLAZAMIENTO_idEMPLAZAMIENTO=?,name=?,dualidad=?,ipv=?,ips=?,nivelconsola=?,puertoconsola=?,nivelIncidencias=?',
													[servicioId,gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,gtw.name,gtw.dualidad,gtw.ipv,gtw.ips,gtw.nivelconsola,gtw.puertoconsola,gtw.nivelIncidencias], function(err, result) {
											if (err){
												logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
												return callback(null, {error: err, data: newGateway});
											}
											newGateway.idCGW = result.insertId;

											logging.LoggingDate(query.sql);
											var idCGW = {'CGW_idCGW' : result.insertId };

											var queryCgw_estado = connection.query('INSERT INTO cgw_estado SET cgw_idCGW = ?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,viva=0',
																					[newGateway.idCGW,gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO],function(err,result){
												logging.LoggingDate(queryCgw_estado.sql);
												if (err){
													callback(err)
													//connection.end();
													//return f({error: err.code, data: trgt});
												}

												// Asignar a la configuración (cgw_cfg.Activa = 0).
												if (assignToCfg == true){
													exports.assignGatewayToConfiguration({"CFG_idCFG" : idConfig, "CGW_idCGW": newGateway.idCGW , "Activa": isInActiveCfg}, function(result){
														callback(null,idCGW);
													});
												}
												else
													callback(null,idCGW);
											})
											/*
											var queryCgwFisica = connection.query('REPLACE INTO CGW_FISICA SET ip=?',
												[req.params.gateway], function(err, result) {
												if (err){
													logging.loggingError("SQL: " + queryCgwFisica.sql + "\nERROR: " + err.message);
													return callback(null, {error: err, data: newGateway});
												}

												callback(null,idCGW);
											})*/
										});
									}
									else{
										// Puede ser, sobre to-do con el paso de la versión Beta5 a Beta6,
										// que exista la pasarela pero no su correspondiente registro en CGW_FISICA
										// en cuyo caso, hay que eliminar la pasarela con los datos existentes
										// y así evitar que aparezcan pasarelas duplicadas
										// var qDelete = connection.query('DELETE FROM CGW WHERE name=?',gtw.name,function(err,result){
										// 	if (err){
										// 		logging.loggingError("SQL: " + qDelete.sql + "\nERROR: " + err.message);
										// 		return callback(null, {error: err, data: newGateway});
										// 	}
											var query = connection.query('INSERT INTO CGW SET EMPLAZAMIENTO_idEMPLAZAMIENTO=?,name=?,dualidad=?,ipv=?,ips=?,nivelconsola=?,puertoconsola=?,nivelIncidencias=?',[gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,gtw.name,gtw.dualidad,gtw.ipv,gtw.ips,gtw.nivelconsola,gtw.puertoconsola,gtw.nivelIncidencias], function(err, result) {
												if (err){
													return callback(null, {error: err, data: newGateway});
												}
												newGateway.idCGW = result.insertId;

												logging.LoggingDate(query.sql);
												var idCGW = {'CGW_idCGW' : result.insertId };

												var queryCgw_estado = connection.query('INSERT INTO cgw_estado SET cgw_idCGW = ?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,viva=0',
																						[newGateway.idCGW,gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO],function(err,result){
													logging.LoggingDate(queryCgw_estado.sql);
													if (err){
														callback(err)
														//	connection.end();
														//	return f({error: err.code, data: trgt});
													}

													if (assignToCfg == true){
														exports.assignGatewayToConfiguration({"CFG_idCFG" : idConfig, "CGW_idCGW": newGateway.idCGW, "Activa":isInActiveCfg}, function(result){
										    				callback(null,idCGW);
										    			});
													}
													else
														callback(null,idCGW);
				    							})
												/*
												var queryCgwFisica = connection.query('REPLACE INTO CGW_FISICA SET ip=?',
													[req.params.gateway], function(err, result) {
													if (err){
														return callback(null, {error: err, data: newGateway});
													}

													callback(null,idCGW);
												})*/
											});
										//});
									}
								}
								else{
									connection.end();
									return f({error:'ER_DUP_ENTRY'});
								}
							})
						},
						// Insert CPUs
						function(idCgw, callback){
							async.waterfall([
								// Insert CPU-1
								function(callback){
									newGateway.cpus[0].num = 1;
									var query=connection.query('INSERT INTO CPU SET ?,?',[idCgw,newGateway.cpus[0]],function(err,resul){
										if (err) {
											return callback(err);
										}

										logging.LoggingDate(query.sql);
										callback(null);
									});
								},
								// Insert CPU-2
								function(callback){
									if (newGateway.cpus.length == 2){
										newGateway.cpus[1].num = 2;
										var query=connection.query('INSERT INTO CPU SET ?,?',[idCgw,newGateway.cpus[1]],function(err,resul){
											if (err) {
												return callback(err);
											}

											logging.LoggingDate(query.sql);
											callback(null);
										});
									}
									else
										callback(null);
								},
								// Insert slaves
								function(callback){
									var gtw = JSON.parse(JSON.stringify(newGateway));

									var i=0;
									async.whilst(
										function(){return i<4},
										function(callback){
											var nameSlave = gtw.name + '_' + i++;
											///	Copiar slaves
										 	var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)',nameSlave,function(err,resultSlaves){
										 		logging.LoggingDate(querySlaves.sql);
										 		
										 		/// Copiar hardware
										 		var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)',[newGateway.idCGW,resultSlaves.insertId,i-1],function(err,resultHw){
													logging.LoggingDate(queryHw.sql);

													callback()
										 		})
										 	})
										},
										function(err){
											callback();
										}
									)
								}
								], callback);
						}
					], function (err){
						connection.end();

						if (err){
							logging.LoggingDate('Error in asynchronous POST. ' + err.message);
							return f({error: err , data: newGateway});
						}

						f({error: null , data: newGateway, idCfg: idConfig});
					});
				}
			})
		}
	});
}

/****************************/
/*	FUNCTION: getGateway 	*/
/*  PARAMS: req,			*/
/*			res,			*/
/*			id cfg			*/
/*			ip gtw			*/
/****************************/
exports.getGateway = function getGateway(req, res, cfg, gtw, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var query = "";
			if (cfg == null){
				query = connection.query('SELECT a.*,e.name as emplazamiento,b.tlan,b.ip0,b.ms0,b.ip1,b.ms1,b.ipb,b.msb,b.ipg FROM CGW a ' + 
											'LEFT JOIN CPU b ON a.idCGW = b.CGW_idCGW ' +
											'LEFT JOIN emplazamiento e ON a.EMPLAZAMIENTO_idEMPLAZAMIENTO = e.idEMPLAZAMIENTO WHERE ??=?',['idCGW', gtw], function(err, rows, fields) {
					logging.LoggingDate(query.sql);

				    if (err) throw err;
				    if (rows.length > 0){
			    		var gtw={};
			    		gtw={	'idCGW': rows[0].idCGW, 
			    				'EMPLAZAMIENTO_idEMPLAZAMIENTO': rows[0].EMPLAZAMIENTO_idEMPLAZAMIENTO,
			    				'name' : rows[0].name, 
			    				'emplazamiento': rows[0].emplazamiento,
			    				'dualidad' : rows[0].dualidad, 
			    				'ipv' : rows[0].ipv, 
			    				'ips' : rows[0].ips,
			    				'nivelconsola': rows[0].nivelconsola, 
			    				'puertoconsola': rows[0].puertoconsola,
			    				'nivelIncidencias': rows[0].nivelIncidencias
			    		};

			    		var cpus=[];
				    	for (var r in rows){
				    		cpus.push({'tlan': rows[r].tlan, 'ip0': rows[r].ip0, 'ms0': rows[r].ms0 , 'ip1': rows[r].ip1 , 'ms1':rows[r].ms1, 'ipb':rows[r].ipb,'msb':rows[r].msb, 'ipg':rows[r].ipg});
				    	}
				    	if (rows.length == 1)
				    		cpus.push({'tlan': 0, 'ip0': '', 'ms0': '' , 'ip1': '' , 'ms1': '', 'ipb': '','msb': '', 'ipg': ''});	

			    		gtw['cpus']=cpus;
			    		logging.LoggingDate(JSON.stringify({general: gtw},null,'\t'));
						f(gtw);
				    }
				    else
				    	res.status(202).json("Gateway not found.");
				});
			}
			else{
				query = connection.query('SELECT a.*,b.tlan,b.ip0,b.ms0,b.ip1,b.ms1,b.ipb,b.msb,b.ipg ' + 
											'FROM CGW a INNER JOIN CPU b ON a.idCGW = b.CGW_idCGW ' +
											'WHERE a.idCGW=? AND a.idCGW in (SELECT CGW_idCGW FROM cgw_cfg where CFG_idCFG=?)',[gtw, cfg], function(err, rows, fields) {
					logging.LoggingDate(query.sql);

				    if (err) throw err;
				    if (rows.length > 0){
			    		var gtw={};
			    		gtw={'name' : rows[0].name, 'dualidad' : rows[0].dualidad, 'ipv' : rows[0].ipv};
			    		var cpus=[];
				    	for (var r in rows){
				    		cpus.push({'tlan': rows[r].tlan, 'ip0': rows[r].ip0, 'ms0': rows[r].ms0 , 'ip1': rows[r].ip1 , 'ms1':rows[r].ms1, 'ipb':rows[r].ipb,'msb':rows[r].msb, 'ipg':rows[r].ipg});
				    	}
			    		gtw['cpus']=cpus;
						logging.LoggingDate(JSON.stringify({general: gtw},null,'\t'));
						f(gtw);
				    }
				    else
				    	res.status(202).json("Gateway not found.");
				});
			}

			connection.end();
		}
	});
};

/****************************/
/*	FUNCTION: delGateway 	*/
/*  PARAMS: res,			*/
/*			req,			*/
/*			gtw: idCGW		*/
/****************************/
exports.delGateway = function delGateway(req, res, gtw){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k'
	});
	var gtwBorrar={};
	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			
			//Primero vamos a borrar en cascada todos los servicios asociados a esta gtw
			
			var querySel = connection.query('SELECT c.idCGW FROM CGW c WHERE idCGW=? '+
				'AND ? NOT IN (SELECT cc.CGW_idCGW '+
				'FROM CGW_CFG cc WHERE cc.Activa=1)',[gtw, gtw], function(err, rows) {
				
				logging.LoggingDate(querySel.sql);
				if (rows.length > 0) { //Pasarela NO en configuración Activa
					gtwBorrar.idPasarela = rows['0'].idCGW;
					querySel = connection.query('SELECT c.servicio FROM CGW c '+
						'WHERE c.idCGW=?',
						gtwBorrar.idPasarela, function(err, rows) {
						if (rows.length > 0) {
							gtwBorrar.idServicio = rows['0'].servicio;
							querySel = connection.query('SELECT * FROM SERVICIOS WHERE idSERVICIOS=?',
							gtwBorrar.idServicio, function (err, rows) {
								if (rows.length > 0) {
									gtwBorrar.idGRAB	=	rows['0'].GRAB_idGRAB;
									gtwBorrar.idSINCR	=	rows['0'].SINCR_idSINCR;
									gtwBorrar.idSIP		=	rows['0'].SIP_idSIP;
									gtwBorrar.idSNMP	=	rows['0'].SNMP_idSNMP;
									gtwBorrar.idWEB		=	rows['0'].WEB_idWEB;
									//Comenzamos el borrado en cadena
									//Tabla SINCR
									querySel = connection.query('DELETE FROM SINCR WHERE idSINCR=? ',
										gtwBorrar.idSINCR, function (err, rows) {
										logging.LoggingDate(querySel.sql);
										if(rows.affectedRows > 0) { //Seguimos borrando
											querySel = connection.query('DELETE FROM GRAB WHERE idGRAB=? ',
											gtwBorrar.idGRAB, function (err, rows) {
												logging.LoggingDate(querySel.sql);
												if(rows.affectedRows > 0) { //Seguimos borrando
													querySel = connection.query('DELETE FROM SNMP WHERE idSNMP=? ',
														gtwBorrar.idSNMP, function (err, rows) {
														logging.LoggingDate(querySel.sql);
														if(rows.affectedRows > 0) { //Seguimos borrando
															querySel = connection.query('DELETE FROM WEB WHERE idWEB=? ',
																gtwBorrar.idWEB, function (err, rows) {
																logging.LoggingDate(querySel.sql);
																if(rows.affectedRows > 0) { //Seguimos borrando
																	querySel = connection.query('DELETE FROM SIP WHERE idSIP=? ',
																	gtwBorrar.idSIP, function (err, rows) {
																		logging.LoggingDate(querySel.sql);
																		if(rows.affectedRows > 0) { //Hay que borrar antes la pasarela que el servicio por la fk
																			querySel = connection.query('DELETE FROM CGW WHERE idCGW=? ',
																				gtwBorrar.idPasarela, function (err, rows) {
																				logging.LoggingDate(querySel.sql);
																				if(rows.affectedRows > 0) { //Seguimos borrando
																					querySel = connection.query('DELETE FROM SERVICIOS WHERE idSERVICIOS=? ',
																					gtwBorrar.idServicio, function (err, rows) {
																						logging.LoggingDate(querySel.sql);
																						if(rows.affectedRows > 0) { //Fin
																							res.json({error: err, data: rows.affectedRows});
																						}
																						else
																							res.json({error: err, data: -1});
																					});
																					connection.end();
																				}
																				else
																					res.json({error: err, data: -1});
																			});
																		}
																		else
																			res.json({error: err, data: -1});
																	});
																}
																else
																	res.json({error: err, data: -1});
															});
														}
														else
															res.json({error: err, data: -1});
													});
												}
												else
													res.json({error: err, data: -1});
											});
										}
										else
											res.json({error: err, data: -1});
									});
								}
								else
									res.json({error: err, data: -1});
							});
						}
						else
							res.json({error: err, data: -1});
					});
				}
				else
					res.json({error: err, data: rows});
			});
		}
	});
}

/************************************************/
/*	FUNCTION: putGateway 						*/
/*  PARAMS: res,								*/
/*			req,								*/
/*			gtw, 								*/
/*          service,							*/
/*			f: callback function 				*/
/************************************************/
exports.putGateway = function putGateway(req, res, gtw, service, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			f(gtw);
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			// /// Comprobar que el nombre de la pasarela no exista
			// var querySelect = connection.query('SELECT idCGW FROM cgw WHERE name=?',gtw.name,function(err,rows){
			// 	if (err != null || (rows.length != 0 && rows[0].idCGW != gtw.idCGW)){
			// 		connection.end();
			// 		return f({error:'ER_DUP_ENTRY'});
			// 	}
			// 	else{
					var cpus = gtw.cpus;
					//var services = gtw.services;
					// Eliminar del JSON gtw la parte no general.
					delete gtw.cpus;
					//delete gtw.emplazamiento;

					// CÓDIGO ASINCRONO
					async.parallel([
						// Update CGW
						function(callback){
								// Si no existe el emplazamiento se da de alta.
								// Puede ser que no exista si se recibe una configuración 
								// de una pasarela que está en el sistema pero no en 
								// en la configuración del servidor
								getEmplazamiento(gtw.emplazamiento,req.body.idConf,function(result){	
									if (result.error === null){
										gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = result.data.idEMPLAZAMIENTO;
										delete gtw.emplazamiento;
										updateCgw(connection, gtw, function(err){
											if (err) return callback(err);

											callback(null);
										});
									}
									else
										callback(result.err);
								});
							/*
							else{
								delete gtw.emplazamiento;
								updateCgw(connection, gtw, function(err){
									if (err) return callback(err);

									callback(null);
								});

							}*/
						},
						// Update CPUs (by deleting and adding)
						function(callback){
							delete gtw.emplazamiento;
							updateCpus(connection, gtw, cpus, function(err){
								if (err) return callback(err);

								callback(null);
							})
						},
						// Update Services 
						function(callback){
							servicesLib.updateServices(connection, service, function(err){
								if (err) return callback(err);

								callback(null);
							})
						}
					], function (err){
						connection.end();

						if (err)
							logging.LoggingDate('Error in asynchronous PUT. ' + err.message);

						f(gtw);
					});
				//}
			//})
		}
	});
}

////////////////////////////////
/// Name: copyGateway
/// Desc: Clone a gateway.
////////////////////////////////
exports.copyGateway = function (sourceIdGateway, targetNameGateway, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			/// Comprobar que el nombre de la pasarela no exista
			var querySelect = connection.query('SELECT name FROM cgw WHERE name=?',targetNameGateway,function(err,rows){
				if (err != null || rows.length != 0){
					connection.end();
					return f({error:'ER_DUP_ENTRY'});
				}
				else{
					var queryInsert = connection.query('INSERT INTO cgw (EMPLAZAMIENTO_idEMPLAZAMIENTO,REGIONES_idREGIONES,servicio,name,dualidad,ipv,ips,nivelconsola,puertoconsola,nivelIncidencias) ' + 
															'SELECT EMPLAZAMIENTO_idEMPLAZAMIENTO,REGIONES_idREGIONES,servicio,?,dualidad,ipv,ips,nivelconsola,puertoconsola,nivelIncidencias ' + 
														'FROM CGW WHERE idCGW=?',[targetNameGateway,sourceIdGateway], function(err, resultCgw){
						logging.LoggingDate(queryInsert.sql);
						if (err == null){
							var queryCpu = connection.query('INSERT INTO cpu (CGW_idCGW,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg) ' +
												'SELECT ?,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg FROM cpu WHERE CGW_idCGW=?',[resultCgw.insertId,sourceIdGateway],function(err,resultCpu){
								logging.LoggingDate(queryCpu.sql);

								var posTargetIds=[];
								/// whilst = for (int i=0;i<4;i++)
								var i=0;
								async.whilst(
									function(){return i<4},
									function(callback){
										var nameSlave = targetNameGateway + '_' + i++;
										///	Copiar slaves
									 	var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)',nameSlave,function(err,resultSlaves){
									 		logging.LoggingDate(querySlaves.sql);
									 		posTargetIds.push(resultSlaves.insertId);

									 		/// Copiar hardware
									 		var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)',[resultCgw.insertId,resultSlaves.insertId,i-1],function(err,resultHw){
												logging.LoggingDate(queryHw.sql);

												callback(null)
									 		})
									 	})
									},
									function(err){
										connection.end();
										///
										/// Ha finalizado de copiar slaves y hardware
										/// 
										exports.getHardwareByIdGateway(sourceIdGateway,function(result){
											var cuantos = 0;
											if (result.hardware != null && result.hardware.length > 0){
												async.each(result.hardware,
													function(p,callback){
														//myLibHardware.getSlave(p.SLAVES_idSLAVES,function(data){
															exports.copyResources(p.idSLAVES,posTargetIds[cuantos++],function(error){
																callback();
															})
														//});
													},
													function(err){
														return f({error:err,data:resultCgw.insertId});
													}
												);
											}
											else
												return f({error:null,data:0});
										});							 			
									}
								)
							});
						}
						else{
							connection.end();
							return f({error:err,data:-1});
						}
					});
				}
			})
		}
	});
}

exports.freeGatewayFromConfiguration = function freeGatewayFromConfiguration(cgw_cfg, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var querySelect = connection.query('SELECT idCGW_CFG from CGW_CFG WHERE CFG_idCFG=? AND CGW_idCGW=? AND Activa=1',[cgw_cfg.CFG_idCFG,cgw_cfg.CGW_idCGW], function(err, rows, fields){
				logging.LoggingDate(querySelect.sql);
				if (rows == null || rows.length == 0){
					var query = connection.query('DELETE FROM CGW WHERE idCGW=?',[cgw_cfg.CGW_idCGW], function(err, result){
						logging.LoggingDate(query.sql);
						connection.end();
						f({error: result.affectedRows, data: cgw_cfg});

						return;
					});
				}
				else{
					querySelect = connection.query('UPDATE CGW_CFG SET Activa=-1 WHERE CFG_idCFG=? AND CGW_idCGW=?',[cgw_cfg.CFG_idCFG,cgw_cfg.CGW_idCGW], function(err, result){
						logging.LoggingDate(querySelect.sql);
						connection.end();
						f({error: result.affectedRows, data: cgw_cfg});
					});
				}
			});
		}
	});
}

exports.assignGatewayToConfiguration = function assignGatewayToConfiguration(cgw_cfg, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			connection.end();
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			// Comprobar si la pasarela que se recibe pertenece a la configuración activa
			var queryExists = connection.query('SELECT activa FROM cfg WHERE idCFG=?',cgw_cfg.CFG_idCFG,function(err,rows){
				if (err == null && rows.length > 0){
					cgw_cfg.Activa = rows[0].activa;
					var querySelect = connection.query('SELECT idCGW_CFG from CGW_CFG WHERE CFG_idCFG=? AND CGW_idCGW=?',[cgw_cfg.CFG_idCFG,cgw_cfg.CGW_idCGW], function(err, rows, fields){
						logging.LoggingDate(querySelect.sql);
						if (rows == null || rows.length == 0){
							var query = connection.query('INSERT INTO CGW_CFG SET ?',cgw_cfg, function(err, result){
								logging.LoggingDate(query.sql);



								//Actualizar tabla CGW_ESTADO
								var querySelectSite = connection.query('SELECT EMPLAZAMIENTO_idEMPLAZAMIENTO FROM CGW WHERE idCGW=?',cgw_cfg.CGW_idCGW,function(err,rows){
										logging.LoggingDate(querySelectSite.sql);
										if (rows != null || rows.length != 0){
											var emplazamiento = rows[0].EMPLAZAMIENTO_idEMPLAZAMIENTO;
											var querytext = 'INSERT INTO CGW_ESTADO (cgw_idCGW,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO) VALUES ('+cgw_cfg.CGW_idCGW+','+emplazamiento+')';

											var queryInsert = connection.query(querytext, function(err, result){
												//logging.LoggingDate(queryInsert.sql);
												connection.end();	

												if (err)
													f({error:err, data: cgw_cfg});
												else
													f({error: result.affectedRows, data: cgw_cfg});

												//return;
											});

										}
										else
											connection.end();
								})	


								//connection.end();
								/*if (err)
									f({error:err, data: cgw_cfg});
								else
									f({error: result.affectedRows, data: cgw_cfg});
*/


								//return;
							});
						}
						else{
							querySelect = connection.query('UPDATE CGW_CFG SET Activa=? WHERE CFG_idCFG=? AND CGW_idCGW=?',[cgw_cfg.Activa,cgw_cfg.CFG_idCFG,cgw_cfg.CGW_idCGW], function(err, result){
								logging.LoggingDate(querySelect.sql);
								connection.end();
								f({error: result.affectedRows, data: cgw_cfg});
							});
						}


						


					});
				}
				else{
					//connection.end();
					f({error:err, data: cgw_cfg})
				}
			})
		}
		
	});
	
}

exports.gatewayExists = function gatewayExists(nameConf,newGateway,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			// Comprobar si la pasarela existe en la configuración 
			var queryExists = connection.query('SELECT idCGW FROM cgw c ' +
												'INNER JOIN cfg cfg ON cfg.name=? ' +
    											'INNER JOIN cgw_cfg cc ON cc.CFG_idCFG=cfg.idCFG AND cc.CGW_idCGW=c.idCGW ' +
												'WHERE c.ipv=? OR c.name=?',[nameConf,newGateway.ipv,newGateway.name],function(err,rows){
				logging.LoggingDate(queryExists.sql);
				connection.end();
				if (err == null){
					if (rows.length > 0){
						f({error:'ER_DUP_ENTRY', data: rows})
					}
					else{
						f({error:null, data: 0})	
					}
				}
				else
					f({error:err, data: null})
			})
		}
	});
}


////////////////////////////////
/// Name: CloneGateway
/// Desc: Create gateway gtw and assign it the resources of srcGtwId.
////////////////////////////////
exports.CloneGateway = function(srcGtwId,gtw,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var gtwJson = {EMPLAZAMIENTO_idEMPLAZAMIENTO: gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,
							REGIONES_idREGIONES: gtw.REGIONES_idREGIONES,
							servicio:gtw.servicio,
							name: gtw.name,
							dualidad: gtw.dualidad,
							ipv: gtw.ipv,
							ips: gtw.ips,
							nivelconsola: gtw.nivelconsola,
							puertoconsola: gtw.puertoconsola,
							nivelIncidencias: gtw.nivelIncidencias};

			var queryInsert = connection.query('INSERT INTO cgw SET ?',[gtwJson], function(err, resultCgw){
				logging.LoggingDate(queryInsert.sql);
				if (err == null){
					var queryCpu = connection.query('INSERT INTO cpu (CGW_idCGW,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg) ' +
										'SELECT ?,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg FROM cpu WHERE CGW_idCGW=?',[resultCgw.insertId,srcGtwId],function(err,resultCpu){
						logging.LoggingDate(queryCpu.sql);

						var posTargetIds=[];
						/// whilst = for (int i=0;i<4;i++)
						var i=0;
						async.whilst(
							function(){return i<4},
							function(callback){
								var nameSlave = gtw.name + '_' + i++;
								///	Copiar slaves
							 	var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)',nameSlave,function(err,resultSlaves){
							 		logging.LoggingDate(querySlaves.sql);
							 		posTargetIds.push(resultSlaves.insertId);

							 		/// Copiar hardware
							 		var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)',[resultCgw.insertId,resultSlaves.insertId,i-1],function(err,resultHw){
										logging.LoggingDate(queryHw.sql);

										callback(null)
							 		})
							 	})
							},
							function(err){
								connection.end();
								///
								/// Ha finalizado de copiar slaves y hardware
								/// 
								exports.getHardwareByIdGateway(srcGtwId,function(result){
									var cuantos = 0;
									if (result.hardware != null && result.hardware.length > 0){
										async.each(result.hardware,
											function(p,callback){
												//myLibHardware.getSlave(p.SLAVES_idSLAVES,function(data){
													exports.copyResources(p.idSLAVES,posTargetIds[cuantos++],function(error){
														callback();
													})
												//});
											},
											function(err){
												return f({error:err,data:resultCgw.insertId});
											}
										);
									}
									else
										return f({error:null,data:0});
								});							 			
							}
						)
					});
				}
				else{
					connection.end();
					return f({error:err,data:-1});
				}
			});
		}
	});
}

/************************************************/
/*	FUNCTION: setService 						*/
/*	DESCRIPTION: Assign a service to gateway 	*/
/*  PARAMS: gateway: 							*/
/*			service,							*/
/*			f: callback function 				*/
/************************************************/
exports.setService = function setService(gateway,service,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			updateService(connection, gateway,service,function(result){
				connection.end();
				f(result);
			});
		}
	});
}

/********************************************************/
/*	FUNCTION: getTestConfig								*/
/*	DESCRIPTION: Get version of active configuration 	*/
/*  PARAMS: gatewayIp 									*/
/*			f: callback function 						*/
/********************************************************/
exports.getTestConfig = function getTestConfig(gatewayIp,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k',
	  timezone : '+02:00'
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");


			// Actualiza cgw_estado
			var updateEstado="";
			updateEstado = connection.query("UPDATE cgw_estado SET viva=1 WHERE cgw_idCGW IN (SELECT idCGW FROM cgw WHERE ipv=?)",gatewayIp,function(err,result){
				var timerId = 'ug5k._' + gatewayIp.replace(/\./g,'_') + '_event_viva';
				var drop=connection.query('DROP EVENT ' + timerId,function(error,result1){
					var createEvent=connection.query('CREATE EVENT IF NOT EXISTS ' + timerId + ' ON SCHEDULE ' +
														'AT CURRENT_TIMESTAMP + INTERVAL 60 SECOND ' +
														'COMMENT "UPDATE VIVA STATE OF GATEWAYS." ' +
													'DO BEGIN UPDATE cgw_estado SET viva = 0 WHERE cgw_idCGW IN (SELECT idCGW FROM cgw WHERE ipv=?);' +
														'DELETE FROM cgw_fisica WHERE ip=?; END',[gatewayIp,gatewayIp],function(error,result2){
    					logging.LoggingDate(createEvent.sql);


						var query = "";
						query = connection.query('SELECT cc.idCGW_CFG,cc.CGW_idCGW, c.idCfg, c.name, DATE_FORMAT(cc.LastUpdate, "%d/%m/%Y %H:%i:%s") as ts_activa,c.activa,cc.Activa FROM CGW g ' +
													'LEFT JOIN cgw_cfg cc ON g.idCGW = cc.CGW_idCGW ' +
													'LEFT JOIN cfg c on c.idCFG = cc.CFG_idCFG ' +
													'WHERE g.ipv=?',gatewayIp, function(err, rows, fields) {
							logging.LoggingDate(query.sql);

						    if (err){
								connection.end();
						    	f({idConf:'-1', fechaHora:''});
					    		logging.LoggingDate(JSON.stringify({idConf:'-1', fechaHora:''},null,'\t'));
						 	}
						    else if (rows == null || rows.length == 0){
								connection.end();
						    	f({idConf:'-1', fechaHora:''});
					    		logging.LoggingDate(JSON.stringify({idConf:'-1', fechaHora:''},null,'\t'));
						    }
						    else{
						    	var retorno={idConf:'', fechaHora:''};
						    	async.each(rows,
						    		function(r,callback){
						    			//if ((r.Activa == null || r.Activa == 0) && retorno.idConf == ''){
						    			if ((r.activa == null || r.activa == 0) && retorno.idConf == ''){
						    				retorno.idConf = '-2';
							    			callback();
						    			}
						    			else if (r.activa == 1){		// && r.Activa != 0){
						    				// Suponemos que la configuración de la pasarela, en esta situación, está sincronizada
						    				var update=connection.query('UPDATE cgw_cfg SET Sincro=2 WHERE idCGW_CFG=? AND (Sincro=1 OR Sincro=3)',r.idCGW_CFG,function(error,result){
						    					var timerId = 'ug5k.' + r.CGW_idCGW + '_event_synchro';
						    					var altera1=connection.query('DROP EVENT ' + timerId,function(error,result1){
/*						    						var altera2=connection.query('CREATE EVENT IF NOT EXISTS ' + timerId + ' ON SCHEDULE ' +
			           																'AT CURRENT_TIMESTAMP + INTERVAL 60 SECOND ' +
				 																	'COMMENT "UPDATE SYNCHRONIZED STATE OF GATEWAYS." ' +
			    																	'DO BEGIN UPDATE ug5k.cgw_cfg SET Sincro = 3 WHERE Sincro = 2 AND Activa = 1 AND CGW_idCGW=?;'+
																					'UPDATE cgw_estado SET viva = 0 WHERE cgw_idCGW=?;END',[r.CGW_idCGW,r.CGW_idCGW],function(error,result2){*/

						    						var altera2=connection.query('CREATE EVENT IF NOT EXISTS ' + timerId + ' ON SCHEDULE ' +
			           																'AT CURRENT_TIMESTAMP + INTERVAL 60 SECOND ' +
				 																	'COMMENT "UPDATE SYNCHRONIZED STATE OF GATEWAYS." ' +
			    																	'DO BEGIN UPDATE ug5k.cgw_cfg SET Sincro = 3 WHERE Sincro = 2 AND Activa = 1 AND CGW_idCGW=?;'+
																					'UPDATE cgw_estado SET viva = 0 WHERE cgw_idCGW IN (SELECT idCGW FROM cgw WHERE ipv=?);END',[r.CGW_idCGW,gatewayIp],function(error,result2){


								    					logging.LoggingDate(update.sql);
						
									    				retorno.idConf = r.name;
									    				retorno.fechaHora = r.ts_activa + ' UTC';
										    			callback();
						    						})
						    					})
						    				});
						    			}
						    			else
							    			callback();
						    		},
									function(err){
							    		//logging.LoggingDate(JSON.stringify(rows[0],null,'\t'));
										connection.end();
							    		logging.LoggingDate(JSON.stringify(retorno,null,'\t'));
							    		f(retorno);
										//f({idConf:rows[0].idCfg, fechaHora:rows[0].ts_activa});
									}
								);
						    }
						});
					})
				})
			})
		}
	});
}


/********************************************************/
/*	FUNCTION: getHardware 								*/
/*	DESCRIPTION: Get gateway hardware configuration 	*/
/*  PARAMS: gtw: gatewayIp 								*/
/*			f: callback function 						*/
/********************************************************/
exports.getHardware = function getHardware(gtw,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k',
	  timezone : '+02:00'
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var query = "";
			query = connection.query('SELECT S.*,H.CGW_idCGW,H.rank,c.ipv FROM SLAVES S ' +
										'LEFT JOIN hardware H ON S.idSLAVES = h.SLAVES_idSLAVES ' +
        								'LEFT JOIN cgw c ON h.CGW_idCGW = c.idCGW ' +
										'WHERE c.idCGW=? ORDER BY S.name',gtw, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

			    if (err){
			    	f({error:err, hardware:null});
			 	}
			    else if (rows == null || rows.length == 0){
			    	f({error:err, hardware:null});
			    }
			    else{
		    		logging.LoggingDate(JSON.stringify(rows,null,'\t'));
					f({error: null, hardware:rows});
			    }
			});
			connection.end();
		}
	});
}

/********************************************************/
/*	FUNCTION: getHardwareByIdGateway					*/
/*	DESCRIPTION: Get gateway hardware configuration 	*/
/*  PARAMS: gtw: gatewayIp 								*/
/*			f: callback function 						*/
/********************************************************/
exports.getHardwareByIdGateway = function(idGateway,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k',
	  timezone : '+02:00'
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var query = "";
			query = connection.query('SELECT S.*,H.CGW_idCGW,H.rank FROM SLAVES S ' +
										'LEFT JOIN hardware H ON S.idSLAVES = h.SLAVES_idSLAVES ' +
        								'LEFT JOIN cgw c ON h.CGW_idCGW = c.idCGW ' +
										'WHERE c.idCGW=? ORDER BY H.rank',idGateway, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

			    if (err){
			    	f({error:err, hardware:null});
			 	}
			    else if (rows == null || rows.length == 0){
			    	f({error:err, hardware:null});
			    }
			    else{
		    		logging.LoggingDate(JSON.stringify(rows,null,'\t'));
					f({error: null, hardware:rows});
			    }
			});
			connection.end();
		}
	});
}
/****************************************************/
/*	FUNCTION: getResources 							*/
/*	DESCRIPTION: Get resources assigned to a slave	*/
/*  PARAMS: hw: slave Id							*/
/*			f: callback function 					*/
/****************************************************/
exports.getResources = function getResources(hw,slot,ipGtw,f){
	// Crear objeto hardware
	function hardware() {
	    this.AD_AGC = 0;
	    this.AD_Gain = 0;
	    this.DA_AGC = 0;
	    this.DA_Gain = 0;
	}
	// Crear objeto parametros radio
	function radio() {
	    this.TipoRadio = 0;
	    this.SQ = 0;
	    this.PTT = 0;
	    this.BSS = false;
	    this.ModoConfPTT = "0";
	    this.RepSQyBSS = "0";
	    this.DesactivacionSQ = "0";
	    this.TimeoutPTT = "0";
	    this.MetodoBSS = "0";
	    this.UmbralVAD = "0";
	    this.NumFlujosAudio = "0";
	    this.TiempoPTT = "0";
	    this.tm_ventana_rx = "0";
	    this.climax_delay = 0;
	    this.modo_compensacion = 0;
	    this.bss_rtp = 0;
	    this.tabla_indices_calidad = [];
	    this.colateral = {};
	}
	// Crear objeto parametros telefonia
	function telefonia() {
	    this.TipoTelefonia = 0;
	    this.Lado = "0";
	    this.t_eym = 0;
	    this.h2h4 = "0";
	    this.r_automatica = "0";
	    this.no_test = "0";
	    this.tm_superv = 0;
	    this.uri_remota = "";
	}
	// Crear objeto resource
	function resource(num){
		this.IdRecurso = '';
		this.Radio_o_Telefonia = 0;
		this.SlotPasarela = 0;
		this.NumDispositivoSlot = num;
		this.TamRTP = 0;
		this.Codec = 0;
		this.Uri_Local = '';
		this.Buffer_jitter = {};
		this.hardware = new hardware();
		this.radio = new radio();
		this.telefonia = new telefonia();
		this.LlamadaAutomatica = 0;
		this.restriccion = 0;
		this.listablanca = [];
		this.listanegra = [];
	}


	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var recursos=[new resource(0),new resource(1),new resource(2),new resource(3)];

			async.each(hw,
				function(h,callback){
					if (h.tipo == 1){	// Recurso radio
						myLibResources.getResource(h.idRECURSO,function(res){
							myLibResources.getRadioParameters(h.idRECURSO,function(param){
								if (param.parametros != null){
									recursos[h.P_rank].IdRecurso = res.recursos.name;
									recursos[h.P_rank].Radio_o_Telefonia = res.recursos.tipo;
									recursos[h.P_rank].SlotPasarela = slot;
									recursos[h.P_rank].NumDispositivoSlot = h.P_rank;
									recursos[h.P_rank].TamRTP = res.recursos.tamRTP;
									recursos[h.P_rank].Codec = res.recursos.codec;
									recursos[h.P_rank].Uri_Local = res.recursos.name + '@' + ipGtw;
									recursos[h.P_rank].Buffer_jitter.min = param.parametros.min;
									recursos[h.P_rank].Buffer_jitter.max = param.parametros.max;
									recursos[h.P_rank].hardware.AD_AGC = param.parametros.AD_AGC;
									recursos[h.P_rank].hardware.AD_Gain = param.parametros.AD_Gain;
									recursos[h.P_rank].hardware.DA_AGC = param.parametros.DA_AGC;
									recursos[h.P_rank].hardware.DA_Gain = param.parametros.DA_Gain;
									recursos[h.P_rank].radio.TipoRadio = param.parametros.tipo;
									recursos[h.P_rank].radio.SQ = param.parametros.sq;
									recursos[h.P_rank].radio.PTT = param.parametros.ptt;
									recursos[h.P_rank].radio.BSS = param.parametros.bss;
									recursos[h.P_rank].radio.ModoConfPTT = param.parametros.modoConfPtt;
									recursos[h.P_rank].radio.RepSQyBSS = param.parametros.repSqBss;
									recursos[h.P_rank].radio.DesactivacionSQ = param.parametros.desactivacionSq;
									recursos[h.P_rank].radio.TimeoutPTT = param.parametros.timeoutPtt;
									recursos[h.P_rank].radio.MetodoBSS = param.parametros.metodoBss;
									recursos[h.P_rank].radio.UmbralVAD = param.parametros.umbralVad;
									recursos[h.P_rank].radio.NumFlujosAudio = param.parametros.numFlujosAudio;
									recursos[h.P_rank].radio.TiempoPTT = param.parametros.tiempoPtt;
									recursos[h.P_rank].radio.tm_ventana_rx = param.parametros.tmVentanaRx;
									recursos[h.P_rank].radio.climax_delay = param.parametros.climaxDelay;
									recursos[h.P_rank].radio.modo_compensacion = param.parametros.modoCompensacion;
									recursos[h.P_rank].radio.bss_rtp = param.parametros.bssRtp;
								}
								callback();
							});
						});
					}
					else	// Recurso telefonía
						myLibResources.getResource(h.idRECURSO,function(res){
							myLibResources.getTelephoneParameters(h.idRECURSO,function(param){
								if (param.parametros != null){
									recursos[h.P_rank].IdRecurso = res.recursos.name;
									recursos[h.P_rank].Radio_o_Telefonia = res.recursos.tipo;
									recursos[h.P_rank].SlotPasarela = slot;
									recursos[h.P_rank].NumDispositivoSlot = h.P_rank;
									recursos[h.P_rank].TamRTP = res.recursos.tamRTP;
									recursos[h.P_rank].Codec = res.recursos.codec;
									recursos[h.P_rank].Uri_Local = res.recursos.name + '@' + ipGtw;
									recursos[h.P_rank].Buffer_jitter.min = param.parametros.min;
									recursos[h.P_rank].Buffer_jitter.max = param.parametros.max;
									recursos[h.P_rank].hardware.AD_AGC = param.parametros.AD_AGC;
									recursos[h.P_rank].hardware.AD_Gain = param.parametros.AD_Gain;
									recursos[h.P_rank].hardware.DA_AGC = param.parametros.DA_AGC;
									recursos[h.P_rank].hardware.DA_Gain = param.parametros.DA_Gain;
									recursos[h.P_rank].telefonia.TipoTelefonia = param.parametros.tipo; 
									recursos[h.P_rank].telefonia.Lado = param.parametros.lado;
									recursos[h.P_rank].telefonia.t_eym = param.parametros.t_eym;
									// recursos[h.P_rank].telefonia.r_automatica = param.parametros.r_automatica;
									recursos[h.P_rank].telefonia.no_test = param.parametros.no_test;
									recursos[h.P_rank].telefonia.tm_superv = param.parametros.tm_superv;
									recursos[h.P_rank].telefonia.uri_remota = '';
							}
							callback();
						});
					});
				},
				function(err){
					connection.end();	
					f(recursos);
				}
			);
		}
	});
}

exports.uploadGWConfig = function(cfg,f){
	var insertar = 1;
}
exports.getIpv = function getIpv(ipBound,f){
	var mySql = require('mySql');
	
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
			//var queryCgwFisica = connection.query('REPLACE INTO cgw_fisica SET ip=?',ipBound,function(err,result){

				query = connection.query('SELECT DISTINCT(c.ipv),c.idCGW,c.servicio,c.name,cc.Activa FROM cgw_fisica f ' +
										'INNER JOIN cpu p ON p.ipb = f.ip ' +
										'INNER JOIN cgw c ON c.idCGW = p.CGW_idCGW ' +
										'LEFT JOIN cgw_cfg cc ON cc.CGW_idCGW = c.idCGW ' +
										'WHERE f.ip=?',ipBound, function(err, rows, fields) {
	/*				query = connection.query('SELECT DISTINCT(c.ipv),c.idCGW,c.servicio,c.name FROM cgw c ' +
										'INNER JOIN cpu p ON p.CGW_idCGW = c.idCGW ' +
										'WHERE (p.ipb=? || p.ip0=? || p.ip1=?)',[ipBound,ipBound,ipBound], function(err, rows, fields) {
	*/				logging.LoggingDate(query.sql);

					if (err){
						connection.end();	
						f({error:err, data:null, ipv:-1})
					}
					else if (rows == null || rows.length == 0){
						var queryCgwFisica = connection.query('SELECT * FROM cgw_fisica WHERE ip=?',ipBound,function(err,rows,fields){
							if (err == null && (rows == null || rows.length == 0)){
								var selectCgw=connection.query('SELECT c.*,p.ipb FROM cgw c ' +
																	'INNER JOIN cpu p on p.CGW_idCGW=c.idCGW ' +
        															'WHERE p.ipb=?',ipBound,function(err,rows,fields){
        							if (err == null && rows != null && rows.length > 0){
										var insertCgwFisica = connection.query('INSERT INTO cgw_fisica SET cgw_idCGW=?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,ip=?',[rows[0].idCGW,rows[0].EMPLAZAMIENTO_idEMPLAZAMIENTO,ipBound],function(err,result){
											connection.end();	

											f({error:err, toLocal:rows[0].ipv, idCGW: rows[0].idCGW, name: rows[0].name, ipv: rows[0].ipv, servicio:rows[0].servicio});
										});
	       							}
	       							else{
										//altaCgwBD(ipBound);
	       								connection.end();
										f({error:err, toLocal: -1, ipv: -1});
	       							}
        						})
							}
							else{
								connection.end();
								f({error:err, toLocal: -1, ipv: -1});	
							}
						})
					}
					else{
						connection.end();	

						var valor=-1
						var i=0;
						async.each(rows,
							function(r,callback){
								if (r.Activa == 1)
									valor = i;
								
								i++;
								callback()
							},
							function(error){
								if (valor != -1)
									f({error:err, toLocal: rows[valor].ipv, idCGW: rows[valor].idCGW, name: rows[valor].name, ipv: rows[valor].ipv, servicio:rows[valor].servicio});
								else
									f({error:err, toLocal: -2, idCGW: rows[0].idCGW, name: rows[0].name, ipv: rows[0].ipv, servicio:rows[0].servicio});	
							}
						)
					}
				});


			//})
		}
	});
}

exports.gatewaysBelongsActive = function gatewaysBelongsActive(gtw, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
				query = connection.query('SELECT COUNT(*) as cuantos FROM cgw_cfg cc ' +
											'INNER JOIN cfg c on c.idCfg = cc.CFG_idCFG AND c.activa = 1 ' +
											'WHERE cc.CGW_idCGW=?', gtw, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				connection.end();	
				if (err){
					f({error:err, data:false})
				}
				else if (rows == null || rows.length == 0){
					f({error:err, data:false});
				}
				else{
					f({error:err, data: (rows[0].cuantos > 0)});
				}
			});
		}
	});
}

exports.getGatewaysBelongsActive = function getGatewaysBelongsActive(f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
				query = connection.query('SELECT cgw.*,w.wport,e.idEMPLAZAMIENTO,e.name AS site,c.idCFG,c.name AS cfg,c.description,c.activa,c.ts_activa FROM cgw_estado ce ' +
											'INNER JOIN cgw cgw ON cgw.idCGW=ce.cgw_idCGW ' +
											'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO = ce.cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO '+ 
    										'INNER JOIN cfg c ON c.idCFG = e.cfg_idCFG ' +
											'INNER JOIN servicios s ON s.idSERVICIOS=cgw.servicio ' +
											'INNER JOIN web w on w.idWEB=s.WEB_idWEB ' +
    										'WHERE ce.viva=1 ORDER BY cfg,site', function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				connection.end();	
				if (err){
					f({error:err, data:null})
				}
				else if (rows == null || rows.length == 0){
					f({error:err, data:null});
				}
				else{
					f({error:err, data:rows});
				}
			});
		}
	});
}

exports.getGatewaysAlive = function getGatewaysAlive(f){		
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
				query = connection.query('SELECT * FROM alivegateways_view', function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				connection.end();	
				if (err){
					f({error:err, data:null})
				}
				else if (rows == null || rows.length == 0){
					f({error:err, data:null});
				}
				else{
					f({error:err, data:rows});
				}
			});
		}
	});
}

exports.sinchroGateways = function sinchroGateways(idGtw){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
	
			var queryCgwCfg = connection.query('UPDATE CGW_CFG SET Sincro=1 WHERE Activa<>0 AND Sincro=0 AND' +
													' CGW_idCGW=?',idGtw, function(err, result){
				connection.end();
				logging.LoggingDate(queryCgwCfg.sql);
			});
		}
	});
}

exports.setLastUpdateToGateway = function setLastUpdateToGateway(idConf, fechaHora, gateway, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
	
			var query = connection.query('SELECT idCFG,activa FROM cfg WHERE name=?',idConf,function(err,rows,fields){
				if (err){
					logging.LoggingDate(query.sql);
					f(false);
				}
				else if (rows.length > 0){	// && rows[0].activa == 1){
					async.waterfall([
						function(callback){
							exports.getIpv(gateway,function(result){
								if (result.error != null)
									return callback(result.error);

								callback(null, result.idCGW);
							})
						}],
						function(error,idCgw){
							var queryCgwCfg = connection.query('UPDATE CGW_CFG SET LastUpdate=? WHERE CFG_idCFG=? AND CGW_idCGW=?', [fechaHora,rows[0].idCFG,idCgw], function(err, result){
								connection.end();
								logging.LoggingDate(queryCgwCfg.sql);
								if (err){
									return f(false);
								}

								f(true);
							})
						}
					);
				}
				else{
					connection.end();
					f(false);
				}
			})
		}
	});
}

exports.updateSite = function(idGateway,idSite,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
	
			var query = connection.query('UPDATE cgw SET EMPLAZAMIENTO_idEMPLAZAMIENTO=? WHERE idCGW=?', [idSite,idGateway], function(err, result){
				connection.end();
				logging.LoggingDate(query.sql);
				if (err){
					return f(false);
				}

				f(true);
			})
		}
	});
}

exports.getGatewaysToOperator = function(idOperator,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
				query = connection.query('SELECT cgw_idCGW FROM op_gtw ' +
										'WHERE operadores_idOPERADORES=?',idOperator, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				connection.end();	
				if (err){
					f({error:err, data:null})
				}
				else if (rows == null || rows.length == 0){
					f({error:err, data:null});
				}
				else{
					f({error:err, data:rows});
				}
			});
		}
	});
}

//////////////////////////////////////////////////////////////////
// FUNCTION: copyResources
// DESCRIPTION: Copia los recursos de una slave en la pos destino
// 				de la slave destino
//////////////////////////////////////////////////////////////////
exports.copyResources = function(idSlave,posTargetId,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
		
			var query = connection.query('SELECT r.*,rank FROM recurso r ' +
											'INNER JOIN pos p ON p.idPOS = r.POS_idPOS ' +
											'WHERE p.SLAVES_idSLAVES=? ' +
    										'ORDER BY rank', idSlave, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				if (err){
					connection.end();	
					f({error:err, data:null})
				}
				else if (rows == null || rows.length == 0){
					// Si no existen recursos no hay nada que copiar
						connection.end();	
						f({error:err, data: null});
				}
				else{
					async.each(rows,
					function(r,callback){
					var numreg = rows.length;
								var queryPos = connection.query('INSERT INTO pos (SLAVES_idSLAVES,rank) VALUES (?,?)',[posTargetId,r.rank],function(err,resultPos){
								var queryCopy = connection.query('INSERT INTO recurso (POS_idPOS,name,tamRTP,codec,tipo,enableRegistro,restriccion,szClave,LlamadaAutomatica) VALUES ' +
												 '(?,?,?,?,?,?,?,?,?)',[resultPos.insertId,r.name,r.tamRTP,r.codec,r.tipo,r.enableRegistro,r.restriccion,r.szClave,r.LlamadaAutomatica],
								 					function (err,result){
								 						logging.LoggingDate(queryCopy.sql);
														 

														if (r.tipo==1){ //si es un recurso radio mirar si tiene tabla de audio y asignarsela
															var queryTablaAudio = connection.query('SELECT t.* FROM tabla_bss_recurso t WHERE recurso_idRECURSO=?',r.idRECURSO ,function(err,rows1, fields){
																if (err){
																	return callback(null, err);
																}
																logging.LoggingDate(queryTablaAudio.sql);
																if (rows1.length>0){														
																	var queryInsertTablaAudio= connection.query('INSERT INTO tabla_bss_recurso (recurso_idRECURSO,tabla_bss_idtabla_bss) VALUES  (?,?)', [result.insertId, rows1[0].tabla_bss_idtabla_bss],
																													function(err, resutl){
																														logging.LoggingDate(queryInsertTablaAudio.sql);
																													});
																	
																}
															});
													 }

								 						CopyParamResources(connection,r.idRECURSO,result.insertId,function(){
									 						callback();
								 						});
								 					}
								)
							})
						},
						function(error){
							connection.end();	
							f({error:error});
						}
					)
					}					
				});
		}
	});
}

/***********************************************************************/
/****** 	PRIVATE FUNCTIONS  *****************************************/
/***********************************************************************/
function updateCgw(connection, gtw, callback){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'U5K-G',
		database : 'ug5k'
	});
	
	connection.connect(function(err, usrs) {
		if (err) {
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else {
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			
			if (gtw.hasOwnProperty("acGrupoMulticast"))
				delete gtw.acGrupoMulticast;
			if (gtw.hasOwnProperty("uiPuertoMulticast"))
				delete gtw.uiPuertoMulticast;
			var query = connection.query('UPDATE CGW SET name=?, ipv=? WHERE idCGW=?', [gtw.name, gtw.ipv, gtw.idCGW], function (err, result) {
				if (err) return callback(err);
				
				logging.LoggingDate(query.sql);
				callback(null);
			});
		}
	});
}

function updateCpus(connection, gtw, cpus, callback){
	async.waterfall([
		function(callback){
			var idCGW = {'CGW_idCGW' : gtw.idCGW};
			if (gtw.idCGW != null){
				var query=connection.query('DELETE FROM CPU WHERE ?',idCGW, function(err, result){
					if (err) 
						return callback(null, err);

					logging.LoggingDate(query.sql);
					callback(null,idCGW);
				});
			}
			else
				callback(null,idCGW);
		},
		function(idCgw, callback){
			async.parallel([
				function(callback){
					cpus[0].num = 1;
					var query=connection.query('INSERT INTO CPU SET ?,?',[idCgw,cpus[0]],function(err,resul){
						if (err) {
							logging.loggingError("ERROR: " + query.sql);
							return callback(err);
						}

						logging.LoggingDate(query.sql);
						callback();
					});
				},
				function(callback){
					if (cpus.length == 2){
						cpus[0].num = 2;
						var query=connection.query('INSERT INTO CPU SET ?,?',[idCgw,cpus[1]],function(err,resul){
							if (err){ 
								logging.loggingError("ERROR: " + query.sql);
								return callback(err);
							}
							logging.LoggingDate(query.sql);
							callback();
						});
					}
					else
						callback();
				}], function(err){
					callback(err);
				});
		}], function(err){
			callback(err);
		});
}

function updateService(connection, gtw, serviceId, callback){
	var query = connection.query('UPDATE CGW SET servicio=? WHERE ??=?',[serviceId,'idCGW',gtw], function(err, result){
		if (err) return callback({error: err, data: null});

		logging.LoggingDate(query.sql);
		callback({error: null, data: result.affectedRows});
	});
}

function getEmplazamiento(name,confName,f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");
			
			var query = connection.query('SELECT e.idEMPLAZAMIENTO,c.idCFG,c.activa FROM emplazamiento e ' +
											'INNER JOIN cfg c ON c.idCFG=e.cfg_idCFG ' +
										'WHERE e.name=? AND c.name=?', [name,confName], function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				if (err){
					connection.end();	
					f({error:err, data:null})
				}
				else if (rows == null || rows.length == 0){
					// Si no existe lo creo...
					// Pero antes hay que comprobar si existe la configuración,
					// porque si no existe, hay que crearla
					var qSelectCfg = connection.query('SELECT idCFG,activa FROM CFG WHERE name=?',confName,function(err,rows,fields){
						if (err == null && rows != null && rows.length > 0){
							var queryInsert = connection.query('INSERT INTO emplazamiento SET cfg_idCFG=?,name=?',[rows[0].idCFG, name], function(err, result) {
								connection.end();	
								f({error:err, data: {idCFG:rows[0].idCFG,idEMPLAZAMIENTO:result.insertId,Activa:rows[0].activa}});
							});
						}
						else if (rows == null || rows.length == 0){
							var queryInsertCfg = connection.query('INSERT INTO cfg SET name=?',confName, function(err, result) {
									var queryInsertSite = connection.query('INSERT INTO emplazamiento SET cfg_idCFG=?,name=?',[result.insertId, name], function(err, resultSite) {
										connection.end();
									f({error:err, data: {idCFG:result.insertId,idEMPLAZAMIENTO:resultSite.insertId,Activa:0}});
								});
							});
						}
					})
				}
				else{
					connection.end();	
					f({error:err, data: {idCFG:rows[0].idCFG,idEMPLAZAMIENTO:rows[0].idEMPLAZAMIENTO,Activa:rows[0].activa}});
				}
			});
		}
	});
}

function CopyParamResources (connection,sourceResourceId,targetResourceId,f){
	async.parallel({
			ubicaciones: function(callback){
				var query=connection.query('INSERT INTO ubicaciones (RECURSO_idRECURSO,uriTxA,uriTxB,uriRxA,uriRxB,activoTx,activoRx) ' +
									'SELECT ?,uriTxA,uriTxB,uriRxA,uriRxB,activoTx,activoRx FROM ubicaciones WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
										logging.LoggingDate(query.sql);
										if (err) return callback(err);
										callback(err,result.insertId);
				})
			},
			jitter: function(callback){
				var query=connection.query('INSERT INTO jitter (RECURSO_idRECURSO,min,max) ' +
									'SELECT ?,min,max FROM jitter WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
										logging.LoggingDate(query.sql);
										if (err) return callback(err);
										callback(err,result.insertId);
				})
			},
			listas: function(callback){
				var query=connection.query('INSERT INTO listanegra (RECURSO_idRECURSO,URILISTAS_idURILISTAS) ' +
									'SELECT ?,URILISTAS_idURILISTAS FROM listanegra WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
										logging.LoggingDate(query.sql);
					query=connection.query('INSERT INTO listablanca (RECURSO_idRECURSO,URILISTAS_idURILISTAS) ' +
										'SELECT ?,URILISTAS_idURILISTAS FROM listablanca WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
											logging.LoggingDate(query.sql);
											if (err) return callback(err);
											callback(err,result.insertId);
					})
				})
			},
			paramhw: function(callback){
				var query=connection.query('INSERT INTO paramhw (RECURSO_idRECURSO,AD_AGC,AD_Gain,DA_AGC,DA_Gain) ' +
									'SELECT ?,AD_AGC,AD_Gain,DA_AGC,DA_Gain FROM paramhw WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
										logging.LoggingDate(query.sql);
										if (err) return callback(err);
										callback(err,result.insertId);
				})
			},
			paramtel: function(callback){
				var query=connection.query('INSERT INTO paramtelef (RECURSO_idRECURSO,tipo,lado,t_eym,h2h4,ladoeym,modo,r_automatica,no_test_local,no_test_remoto,it_release,uri_remota,detect_vox,umbral_vox,tm_inactividad,superv_options,tm_superv_options,colateral_scv,iT_Int_Warning) ' +
									'SELECT ?,tipo,lado,t_eym,h2h4,ladoeym,modo,r_automatica,no_test_local,no_test_remoto,it_release,uri_remota,detect_vox,umbral_vox,tm_inactividad,superv_options,tm_superv_options,colateral_scv,iT_Int_Warning FROM paramtelef WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
										logging.LoggingDate(query.sql);

										query=connection.query('INSERT INTO rangos (PARAMTELEF_idPARAMTELEF,origen,inicial,final) ' +
																'SELECT ?,r.origen,r.inicial,r.final FROM rangos r ' +
																	'INNER JOIN paramtelef pt ON pt.idPARAMTELEF=r.PARAMTELEF_idPARAMTELEF ' +
    																'WHERE pt.RECURSO_idRECURSO=?',[result.insertId,sourceResourceId],function(err,result){
											if (err) return callback(err);
											callback(err,result.insertId);
										})
				})
			},
			paramradio: function(callback){
				var query=connection.query('INSERT INTO paramradio (RECURSO_idRECURSO,tipo,sq,ptt,bss,modoConfPtt,repSqBss,desactivacionSq,timeoutPtt,metodoBss,umbralVad,numFlujosAudio,tiempoPtt,tmVentanaRx,climaxDelay,tmRetardoFijo,bssRtp,retrasoSqOff,evtPTT,tjbd,tGRSid,iEnableGI,iPttPrio,iSesionPrio,iPrecisionAudio) ' +
									'SELECT ?,tipo,sq,ptt,bss,modoConfPtt,repSqBss,desactivacionSq,timeoutPtt,metodoBss,umbralVad,numFlujosAudio,tiempoPtt,tmVentanaRx,climaxDelay,tmRetardoFijo,bssRtp,retrasoSqOff,evtPTT,tjbd,tGRSid,iEnableGI,iPttPrio,iSesionPrio,iPrecisionAudio FROM paramradio WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
										logging.LoggingDate(query.sql);
										if (err) return callback(err);
										callback(err,result.insertId);
				})
			},
			colateral: function(callback){
				var query=connection.query('INSERT INTO colateral (DESTINOS_idDESTINOS,RECURSO_idRECURSO) ' +
									'SELECT DESTINOS_idDESTINOS,? FROM colateral WHERE RECURSO_idRECURSO=?',[targetResourceId,sourceResourceId],function(err,result){
										logging.LoggingDate(query.sql);
										if (err) return callback(err);
										callback(err,result.insertId);
				})
			}
		},function(err,results){
			f();
		}
	)
}