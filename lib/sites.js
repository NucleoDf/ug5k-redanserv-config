var myLibGateways = require('./gateways.js');

var async=require('async');

var logging = require('./loggingDate.js');

/****************************/
/*	FUNCTION: getSites	 	*/
/*  PARAMS: req,			*/
/*			res,			*/
/*			f  				*/
/****************************/
exports.getSites = function getSites(req, res, f){
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
		
			var query = connection.query('SELECT e.*,c.name as nameCfg FROM emplazamiento e ' +
											'INNER JOIN cfg c ON c.idCFG = e.cfg_idCFG ' +
											'ORDER BY c.name', function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				if (err) 
					f({error:err});
				else if (rows == null || rows.length == 0)
					f({error:err, data: 'NO_DATA'});
				else
					f({error:err, data: rows});

				connection.end();	
			});
		}
	});
};

exports.postSite = function postSite(site,f){
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
		
			var existsQuery = connection.query('SELECT COUNT(*) AS cuantos FROM emplazamiento WHERE name=? AND cfg_idCFG=? ',[site.name,site.cfg_idCFG],function(err,rows){
				if (err){
					connection.end();	
					f({error:err, data:null});
				}
				else if (rows.length > 0 && rows[0].cuantos != 0){
					connection.end();	
					f({error:'ER_DUP_ENTRY',data:null});
				}
				else{
					var query = connection.query('INSERT INTO emplazamiento SET ?', site, function(err, result) {
						logging.LoggingDate(query.sql);

						if (err) 
							f({error:err, data:null});
						else
							f({error:err, data: result.insertId});

						connection.end();	
					});
				}
			});
		}
	});
};

exports.putSite = function putSite(idSite,nameSite,f){
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
		
		    
			var query = connection.query('UPDATE emplazamiento SET name=? WHERE idEmplazamiento=?', [nameSite,idSite], function(err, result) {
				logging.LoggingDate(query.sql);

				if (err) 
					f({error:err});
				else
					f({error:err, data: nameSite});

				connection.end();	
			});
		}
	});
};

exports.deleteSite = function deleteSite(site,f){
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
		
			var query = connection.query('DELETE FROM emplazamiento WHERE idEMPLAZAMIENTO=?' +
											' AND (? NOT IN(SELECT DISTINCT(EMPLAZAMIENTO_idEMPLAZAMIENTO) FROM cgw))',
													 [site,site], function(err, result) {
				logging.LoggingDate(query.sql);
				connection.end();	

				if (err) 
					f({error:err, data:0});
				else
					f({error:err, data: result.affectedRows});
			});
		}
	});
};

exports.getGatewaysOfSite = function getGatewaysOfSite(site, f){
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
		
			var query = connection.query('SELECT * FROM cgw WHERE EMPLAZAMIENTO_idEMPLAZAMIENTO=?',site, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				if (err) 
					f({error:err});
				else if (rows == null || rows.length == 0)
					f({error:err, data: 'NO_DATA'});
				else
					f({error:err, data: rows});

				connection.end();	
			});
		}
	});
};

exports.getSite = function getSite(idSite, f){
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
		
			var query = connection.query('SELECT * FROM emplazamiento WHERE idEMPLAZAMIENTO=?',idSite, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

				if (err) 
					f(null);
				else if (rows == null || rows.length == 0)
					f(null);
				else
					f(rows[0]);

				connection.end();	
			});
		}
	});
};

/************************************/
/*	FUNCTION: copySite				*/
/*  PARAMS: sourceIdSite,			*/
/*			targetNameSite,			*/
/* 			callback function 		*/
/************************************/
exports.copySite = function copySite(sourceIdSite, targetNameSite, idCfg, f){
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
		}

		var cfgId = idCfg;
		
		//Buscar si ya exite ese nombre de emplazamiento en la Configuracion
		query = connection.query('SELECT name FROM emplazamiento WHERE cfg_idCFG = ?', idCfg,function(err,result) {
			if (err) {
				connection.end();
				return f({error: err.code});
			}
			else {
				for (var i=0;i<result.length;i++) {
					if(targetNameSite == result[i].name) {
						connection.end();
						return f({error: "ER_DUP_ENTRY"});
					}
				}
			}
			// Crear el emplazamiento
			query = connection.query('INSERT INTO emplazamiento (cfg_idCFG,name) VALUES (?,?)', [idCfg, targetNameSite], function (err, result) {
				if (err) {
					connection.end();
					return f({error: err.code, data: trgt});
				}
				logging.LoggingDate(query.sql);
				var _newSite = result.insertId;
				
				// Crear las pasarelas asociadas a los emplazamientos correspondientes a la configuración
				query = connection.query('INSERT INTO cgw (EMPLAZAMIENTO_idEMPLAZAMIENTO,REGIONES_idREGIONES,servicio,name,dualidad,ipv,ips,nivelconsola,puertoconsola,nivelIncidencias) ' +
					'(SELECT ?,c.REGIONES_idREGIONES,c.servicio,c.name,c.dualidad,c.ipv,c.ips,c.nivelconsola,c.puertoconsola,c.nivelIncidencias FROM cgw c ' +
					'WHERE EMPLAZAMIENTO_idEMPLAZAMIENTO=?)', [_newSite, sourceIdSite], function (err, result) {
					logging.LoggingDate(query.sql);
					if (err) {
						connection.end();
						return f({error: err.code, data: trgt});
					}
					
					// Guarda el id de la primera cgw dada de alta
					// Se utiliza al dar de alta el hardware
					var _idCgw = result.insertId;
					
					/*query = connection.query('SELECT c.ipb '+
											'FROM cpu c '+
											'INNER JOIN cgw cgw ON cgw.idCGW = c.CGW_idCGW '+
											'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO =  '+
											'cgw.EMPLAZAMIENTO_idEMPLAZAMIENTO AND e.idEMPLAZAMIENTO = ?',
						sourceIdSite, function (err, rows, fields) {
							if (err ){
								connection.end();
							return f({error: err.code, data: trgt});) {
							}
						}
					*/
					// Crear las cpus pertenecientes a las pasarelas asociadas
					// a los emplazamientos correspondientes a la configuración
					query = connection.query('INSERT INTO cpu (CGW_idCGW,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg) ' +
						'(SELECT c2.idCGW, c.num,c.tlan,c.ip0,c.ms0,c.ip1,c.ms1,c.ipb,c.msb,c.ipg FROM cpu c ' +
						'INNER JOIN cgw cgw ON cgw.idCGW = c.CGW_idCGW ' +
						'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO = cgw.EMPLAZAMIENTO_idEMPLAZAMIENTO AND e.idEMPLAZAMIENTO = ? ' +
						'INNER JOIN cgw c2 ON c2.EMPLAZAMIENTO_idEMPLAZAMIENTO = ?)', [sourceIdSite, _newSite], function (err, result) {
						logging.LoggingDate(query.sql);
						if (err) {
							connection.end();
							return f({error: err.code, data: trgt});
						}
						
						// Obtener los ids de las pasarelas de la configuración original
						query = connection.query('SELECT C.idCGW,c.name FROM cgw c ' +
							'WHERE c.EMPLAZAMIENTO_idEMPLAZAMIENTO=?', sourceIdSite, function (err, rows, fields) {
							if (err == null && rows != null && rows.length > 0) {
								var _numPasarelas = 0;
								
								async.eachSeries(rows,
									function (gtw, callback) {
										async.waterfall([
												function (callback) {
													var posTargetIds = [];
													var i = 0;
													async.whilst(
														function () {
															return i < 4
														},
														function (callback) {
															var nameSlave = gtw.name + '_' + i++;
															///	Copiar slaves
															var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)', nameSlave, function (err, resultSlaves) {
																logging.LoggingDate(querySlaves.sql);
																posTargetIds.push(resultSlaves.insertId);
																
																/// Copiar hardware
																var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)',
																	[_idCgw + _numPasarelas, resultSlaves.insertId, i - 1], function (err, resultHw) {
																		logging.LoggingDate(queryHw.sql);
																		
																		callback();
																	});
															});
														},
														function (err) {
															///
															/// Ha finalizado de copiar slaves y hardware
															///
															callback(null, posTargetIds);
														}
													);
												}],
											function (err, targets) {
												_numPasarelas++;
												myLibGateways.getHardwareByIdGateway(gtw.idCGW, function (result) {
													var cuantos = 0;
													if (result.hardware != null && result.hardware.length > 0) {
														async.each(result.hardware,
															function (p, callback) {
																myLibGateways.copyResources(p.idSLAVES, targets[cuantos++], function (error) {
																	callback();
																});
															},
															function (err) {
																callback(null);
															}
														);
													}
												});
												
											}
										);
									},
									function (err) {
										connection.end();
										
										if (err != null)
											f({error: err.code, IdSite: _newSite});
										else {
											f({error: null, IdSite: _newSite});
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

exports.updateCfg = function(idSite,idCfg,f){
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

				var existsQuery = connection.query('SELECT COUNT(*) as cuantos FROM ug5k.emplazamiento WHERE name=(SELECT name FROM ug5k.emplazamiento where idEmplazamiento=?) AND cfg_idCFG=?', 
													[idSite,idCfg],function(err,rows){
		    	logging.LoggingDate(existsQuery.sql);
				if (err){
					connection.end();	
					f({error:err, data:null});
				}
				else if (rows.length > 0 && rows[0].cuantos > 0){
					connection.end();	
					f({error:'ER_DUP_ENTRY',data:null});
				}
				else
				{
					var query = connection.query('UPDATE emplazamiento SET cfg_idCFG=? WHERE idEMPLAZAMIENTO=?', [idCfg,idSite], function(err, result){
						logging.LoggingDate(query.sql);
						if (err){
							connection.end();
							return f(false);
						}

						query = connection.query('UPDATE cgw_cfg SET cfg_idCFG=? WHERE cgw_idCGW IN ' + 
													'(SELECT idCGW FROM cgw WHERE EMPLAZAMIENTO_idEMPLAZAMIENTO=?)',[idCfg,idSite],function(err,result){

							connection.end();
							logging.LoggingDate(query.sql);
							if (err){
								return f(false);
							}
							f(true);
						});
					});
				}

		    });
		}
	});
};

