var async = require('async');
var logging = require('./loggingDate.js');

/****************************/
/*	FUNCTION: getResources 	*/
/*  PARAMS: 				*/
/****************************/
exports.getResources = function getResources(f){
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

			var query = connection.query('SELECT * FROM RECURSO', function(err, rows, fields) {
			
				if (err || rows.length == 0){
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: err, recursos: rows});
			});
		}
	});
};

exports.getFreeResources = function getFreeResources(f){
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

			var query = connection.query('SELECT r.* FROM recurso r ' +
											'LEFT JOIN colateral c ON c.RECURSO_idRECURSO=r.idRECURSO ' +
											'WHERE c.RECURSO_idRECURSO IS NULL', function(err, rows, fields) {
			
				if (err || rows.length == 0){
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: err, recursos: rows});
			});
		}
	});
};

exports.getResource = function getResource(rsc, f){
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


			var query = connection.query('SELECT * FROM (' + 
										'SELECT r.*,true as blanca, u.*, d.name as frecuencia, d.idDESTINOS as idDESTINOS FROM RECURSO R ' +
											'LEFT JOIN listablanca lb on lb.RECURSO_idRECURSO=r.idRECURSO ' +
											'LEFT JOIN urilistas u ON u.idURILISTAS = lb.URILISTAS_idURILISTAS ' +
											'LEFT JOIN colateral c ON c.RECURSO_idRECURSO = r.idRECURSO ' + 
											'LEFT JOIN destinos d ON d.idDESTINOS = c.DESTINOS_idDESTINOS ' +
											'WHERE idRECURSO=? ' +
											'UNION ' +
										'SELECT r.*,false as blanca, u.*,d.name as frecuencia, d.idDESTINOS as idDESTINOS FROM RECURSO R ' +
											'LEFT JOIN listanegra ln on ln.RECURSO_idRECURSO=r.idRECURSO ' +
											'LEFT JOIN urilistas u ON u.idURILISTAS = ln.URILISTAS_idURILISTAS ' +
											'LEFT JOIN colateral c ON c.RECURSO_idRECURSO = r.idRECURSO ' + 
											'LEFT JOIN destinos d ON d.idDESTINOS = c.DESTINOS_idDESTINOS ' +
											'WHERE idRECURSO=?) a ORDER BY a.ip',[rsc,rsc], function(err, rows, fields) {
			
				if (err || rows.length == 0){
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({recursos: rows});
			});
		}
	});
};

exports.postResource = function postResource(resource,f){
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

			var query = connection.query('INSERT INTO RECURSO SET ?', resource, function(err, result) {
			
				if (err){
					connection.end();	
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return f({error:err, data:null});
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: null , data: resource});
			});
		}
	});
};

exports.putResource = function putResource(resource,f){
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

			var query = connection.query('UPDATE RECURSO SET ? WHERE idRECURSO=?', [resource.rsc,resource.rsc.idRECURSO], function(err, result) {
			
				if (err){
					connection.end();	
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return f({error:err, data:null});
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: null , data: resource});
			});
		}
	});
};

exports.delResource = function delResource(idPos,f){
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

			// Eliminar un recurso supone eliminar la posicion en la slave...
			// Con la foreign key ON_DELETE: CASCADE, se elimina el recurso.
			// Y solo se eliminan si no forman  parte de la configuración activa
			/*
			var query = connection.query('DELETE FROM pos WHERE idPOS=? AND ' +
											'(? NOT IN (SELECT POS_idPOS from (SELECT POS_idPOS FROM recurso r ' +
											'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
											'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
											'INNER JOIN cgw_cfg c ON (c.CGW_idCGW=h.CGW_idCGW AND c.activa) ' +
										  	') as derived))', [idPos,idPos], function(err, result) {
			*/
			// Se permite eliminar recursos que forman  parte de la configuración activa (Incidencia #1200)
			var query = connection.query('DELETE FROM pos WHERE idPOS=?',idPos, function(err, result) {
				if (err){
					connection.end();	
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return f({error:err, data:null});
				}

				connection.end();	
				f({error: null , data: result.affectedRows});
			});
		}
	});
};


/*************************************************/
/***** getRadioParameters	**********************/
/*************************************************/
exports.getRadioParameters = function getRadioParameters(rsc,f){
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

			async.parallel({
				Buffer_jitter: function (callback){
					var query = connection.query('SELECT * FROM jitter ' +
													'WHERE RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							delete rows[0].idJITTER;
							delete rows[0].RECURSO_idRECURSO;
							callback(null, rows[0]);
						}
						else
							callback(null,{});
					});
				},
				hardware: function(callback){
					var query = connection.query('SELECT * FROM paramhw ' +
													'WHERE RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							delete rows[0].idPARAMHW;
							delete rows[0].RECURSO_idRECURSO;
							callback(null, rows[0]);
						}
						else
							callback(null,{});
					});
				},
				radio: function(callback){
					var query = connection.query('SELECT * FROM paramradio ' +
													'WHERE RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							delete rows[0].idPARAMRADIO;
							delete rows[0].RECURSO_idRECURSO;
							callback(null, rows[0]);
						}
						else
							callback(null,{});
					});
				},
				tablaAudio: function(callback){
					var query = connection.query('SELECT tb.idtabla_bss,tb.name FROM tabla_bss tb ' +
													'INNER JOIN tabla_bss_recurso tbr ON tbr.tabla_bss_idtabla_bss = tb.idtabla_bss ' +
    												'WHERE tbr.recurso_idrecurso=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							callback(null, rows[0]);
						}
						else
							callback(null,{idtabla_bss:'',name:''});
					});
				},
				valoresTablaAudio: function(callback){
					var query = connection.query('SELECT vt.valor_rssi FROM valores_tabla vt ' +
													'INNER JOIN tabla_bss_recurso tbr ON tbr.tabla_bss_idtabla_bss = vt.tabla_bss_idtabla_bss ' +
    												'WHERE tbr.recurso_idrecurso=? ORDER BY vt.valor_prop',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							callback(null, rows);
						}
						else
							callback(null,[]);
					});
				}
			},function(err, results){
				connection.end();

				f({error:err, parametros:results});
			});
		}
	});
};

/*************************************************/
/****** postRadioParameters 	******************/
/*************************************************/
exports.postRadioParameters = function postRadioParameters(resource,params,f){
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

			async.series({
					delete: function(callback){
								async.parallel({
									delRadio: function(callback){
												var query=connection.query('DELETE FROM paramradio WHERE RECURSO_idRECURSO=?',resource, function(err, result){
													if (err) {
														logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
														return callback(err);
													}

													logging.LoggingDate(query.sql);
													callback();
												});
											},
									delHw: function(callback){
												var query=connection.query('DELETE FROM paramhw WHERE RECURSO_idRECURSO=?',resource, function(err, result){
													if (err) {
														logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
														return callback(err);
													}

													logging.LoggingDate(query.sql);
													callback();
												});
											},
									delJitter: function(callback){
												var query=connection.query('DELETE FROM jitter WHERE RECURSO_idRECURSO=?',resource, function(err, result){
													if (err) {
														logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
														return callback(err);
													}

													logging.LoggingDate(query.sql);
													callback();
												});
											},
									delTablaAudio: function(callback){
												if (params.tAudio != null){
													var query=connection.query('DELETE FROM tabla_bss_recurso WHERE RECURSO_idRECURSO=?',resource, function(err, result){
														if (err) {
															logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
															return callback(err);
														}

														logging.LoggingDate(query.sql);
														callback();
													});
												}
												else
													callback();
											}
								}, callback);
					},
					insert: function(callback){
								async.parallel({
									insRadio: function(callback){
												delete params.rd.tabla_indices_calidad;
												// var tipo = typeof params.rd.iPrecisionAudio;
												// if (tipo == "string")
												// 	params.rd.iPrecisionAudio = parseInt(params.rd.iPrecisionAudio);

												//Se eliminan los siguientes campos pues se mandan por compatibilidad
												//de version de la pasarela Ulises
												delete params.rd.FrqTonoSQ;
												delete params.rd.UmbralTonoSQ;
												delete params.rd.FrqTonoPTT;
												delete params.rd.UmbralTonoPTT;
												delete params.rd.SupervPortadoraTx;
												delete params.rd.SupervModuladoraTx;


												var query=connection.query('INSERT INTO paramradio SET ?',params.rd, function(err, result){
													if (err) {
														logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
														return callback(err);
													}

													logging.LoggingDate(query.sql);
													callback();
												});
											},
									insHw: function(callback){
												var query=connection.query('INSERT INTO paramhw SET ?',params.hw, function(err, result){
													if (err){ 
														logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
														return callback(err);
													}

													logging.LoggingDate(query.sql);
													callback();
												});
											},
									insJitter: function(callback){
												var query=connection.query('INSERT INTO jitter SET ?',params.jt, function(err, result){
													if (err) {
														logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
														return callback(err);
													}

													logging.LoggingDate(query.sql);
													callback();
												});
											},
									insTablaAudio: function(callback){
											if (params.tAudio != null && params.tAudio != "-1"){
												var query=connection.query('INSERT INTO tabla_bss_recurso SET ?',{recurso_idrecurso:resource,tabla_bss_idtabla_bss:params.tAudio}, function(err, result){
													if (err) {
														logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
														return callback(err);
													}

													logging.LoggingDate(query.sql);
													callback();
												});
											}
											else
												callback();
										}
								}, callback);
					}
				},
				function(err){
					connection.end();

					if (err)
						f({error:err, data: params});
					else
						f({error:null, data: params});
				}
			);
		}
	});
};

/*************************************************/
/*********	PARAMETROS TELEFONÍA	**************/
/********* getTelephoneParameters	**************/
/*************************************************/
exports.getTelephoneParameters = function getTelephoneParameters(rsc,f){
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

			async.parallel({
				Buffer_jitter: function (callback){
					var query = connection.query('SELECT * FROM jitter ' +
													'WHERE RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							delete rows[0].idJITTER;
							delete rows[0].RECURSO_idRECURSO;
							callback(null, rows[0]);
						}
						else
							callback(null,{});
					});
				},
				hardware: function(callback){
					var query = connection.query('SELECT * FROM paramhw ' +
													'WHERE RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							delete rows[0].idPARAMHW;
							delete rows[0].RECURSO_idRECURSO;
							callback(null, rows[0]);
						}
						else
							callback(null,{});
					});
				},
				telefonia: function(callback){
					var query = connection.query('SELECT * FROM paramtelef ' +
													'WHERE RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0){
							delete rows[0].idPARAMTELEF;
							delete rows[0].RECURSO_idRECURSO;
							callback(null, rows[0]);
						}
						else
							callback(null,{});
					});
				},
				ats_rangos_dst: function(callback){
					var query = connection.query('SELECT inicial,final FROM rangos r ' +
													'LEFT JOIN paramtelef pt ON pt.idPARAMTELEF=r.PARAMTELEF_idPARAMTELEF ' +
													'WHERE !r.origen AND pt.RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0)
							callback(null, rows);
						else
							callback(null,[]);
					});
				},
				ats_rangos_org: function(callback){
					var query = connection.query('SELECT inicial,final FROM rangos r ' +
													'LEFT JOIN paramtelef pt ON pt.idPARAMTELEF=r.PARAMTELEF_idPARAMTELEF ' +
													'WHERE r.origen AND pt.RECURSO_idRECURSO=?',rsc, function(err, rows, fields) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						if (rows != null && rows.length > 0)
							callback(null, rows);
						else
							callback(null,[]);
					});
				}
			},function(err, results){
				connection.end();

				f({error:err, parametros:results});
			});
		}
	});
};

/*************************************************/
/****** postTelephoneParameters	******************/
/*************************************************/
exports.postTelephoneParameters = function postTelephoneParameters(resource,params,f){
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

			var query=connection.query('SELECT * FROM paramtelef WHERE RECURSO_idRECURSO=?',resource, function(err, rows, fields){
				if (err) {
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return callback(err);
				}

				logging.LoggingDate(query.sql);
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return callback(err);
				}

				if (rows != null && rows.length > 0){

					params.tf.idPARAMTELEF = rows[0].idPARAMTELEF;

					// PUT
					async.parallel({
						insRadio: function(callback){
									//Se eliminan los siguientes campos pues son de la version ulises, no se usan en REDAN
									delete params.tf.idRed;
									delete params.tf.idTroncal;
									delete params.tf.listaEnlacesInternos;
									delete params.tf.ats_rangos_operador;
									delete params.tf.ats_rangos_privilegiados;
									delete params.tf.ats_rangos_directos_ope;
									delete params.tf.ats_rangos_directos_pri;

									var tipo = typeof params.tf.iT_Int_Warning;
									if (tipo == "string")
									 	params.tf.iT_Int_Warning = parseInt(params.tf.iT_Int_Warning);

									var query=connection.query('UPDATE paramtelef SET ? WHERE RECURSO_idRECURSO=?',[params.tf,resource], function(err, result){
										if (err) {
											logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
											return callback(err);
										}

										logging.LoggingDate(query.sql);
										callback();
									});
								},
						insHw: function(callback){
									var query=connection.query('UPDATE paramhw SET ? WHERE RECURSO_idRECURSO=?',[params.hw,resource], function(err, result){
										if (err) {
											logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
											return callback(err);
										}

										logging.LoggingDate(query.sql);
										callback();
									});
								},
						insJitter: function(callback){
									var query=connection.query('UPDATE jitter SET ? WHERE RECURSO_idRECURSO=?',[params.jt,resource], function(err, result){
										if (err) {
											logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
											return callback(err);
										}

										logging.LoggingDate(query.sql);
										callback();
									});
								}
					}, function(err){
						connection.end();
						
						if (err)
							f({error:err, data: params});
						else
							f({error:null, data: params});
					});
				}else{
					// POST
					async.parallel({
						insRadio: function(callback){
									var query=connection.query('INSERT INTO paramtelef SET ?',params.tf, function(err, result){
										if (err) {
											logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
											return callback(err);
										}

										params.tf.idPARAMTELEF = result.insertId;

										logging.LoggingDate(query.sql);
										callback();
									});
								},
						insHw: function(callback){
									var query=connection.query('INSERT INTO paramhw SET ?',params.hw, function(err, result){
										if (err) {
											logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
											return callback(err);
										}

										logging.LoggingDate(query.sql);
										callback();
									});
								},
						insJitter: function(callback){
								if(params.jt!=null && params.jt!="-1")
									var query=connection.query('INSERT INTO jitter SET ?',params.jt, function(err, result){
										if (err) {
											logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
											return callback(err);
										}

										logging.LoggingDate(query.sql);
										callback();
									});
								}
					}, function(err){
						connection.end();
						
						if (err)
							f({error:err, data: params});
						else
							f({error:null, data: params});
					});
				}
			});
		}
	});
};

exports.getRangeAts = function getRangeAts(rsc,f){
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

			var query = connection.query('SELECT r.* FROM rangos r ' +
											'INNER JOIN paramtelef pt ON pt.idPARAMTELEF=r.PARAMTELEF_idPARAMTELEF ' +
											'WHERE pt.RECURSO_idRECURSO=? ORDER BY r.inicial', rsc,function(err, rows, fields) {
			
				logging.LoggingDate(query.sql);
				connection.end();	

				if (err || rows.length == 0){
					return f(err ? err : 'NO_DATA');
				}

				f({error: err, ranks: rows});
			});
		}
	});
};

exports.getRangeAtsByParam = function getRangeAtsByParam(idParam,f){
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

			var query = connection.query('SELECT * FROM rangos ' +
											'WHERE PARAMTELEF_idPARAMTELEF=?', idParam,function(err, rows, fields) {
			
				logging.LoggingDate(query.sql);
				connection.end();	

				if (err || rows.length == 0){
					return f(null);
				}

				f(rows[0].PARAMTELEF_idPARAMTELEF);
			});
		}
	});
};

exports.postRangeAts = function postRangeAts(rsc,range,f){
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

			async.waterfall([
				// Select idParamTelef
				function(callback){
					var query=connection.query('SELECT idPARAMTELEF FROM paramtelef WHERE RECURSO_idRECURSO=?',rsc,function(err, rows, fields){
						logging.LoggingDate(query.sql);

						if (err || rows.length == 0) 
							return callback(err);

						if (rows.length > 0){
							return callback(null,rows[0].idPARAMTELEF);
						}
					});
				},
				// Insert Rank
				function(idParam,callback){
					var query = connection.query('INSERT INTO rangos SET PARAMTELEF_idPARAMTELEF=?,origen=?,inicial=?,final=?', [idParam,range.origen,range.inicial,range.final], function(err, result) {
						logging.LoggingDate(query.sql);
				
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}

						callback();
					});
				}
			], function(err){
				connection.end();	

				if (err)
					return f({error:err, data:null});

				f({error: null , data: range});
			});
		}
	});
};

exports.putRangeAts = function putRangeAts(range,f){
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

			var query = connection.query('UPDATE rangos SET ? ' +
											'WHERE idRangos=?', [range,range.idRangos],function(err, result) {
			
				logging.LoggingDate(query.sql);
				connection.end();	

				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return f({error: err , ranks : range});
				}

				f({error: err, ranks: range});
			});
		}
	});
};

exports.deleteRangeAts = function deleteRangeAts(range,f){
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

			var query = connection.query('DELETE FROM rangos WHERE idRangos=?', range,function(err, result) {
			
				logging.LoggingDate(query.sql);
				connection.end();	

				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return f({error: err , ranks : range});
				}

				f({error: err, ranks: range});
			});
		}
	});
};

exports.getUriList = function getUriList(f){
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

			var query = connection.query('SELECT * FROM URILISTAS', function(err, rows, fields) {
				connection.end();	
				logging.LoggingDate(query.sql);
				if (err || rows.length == 0){
					return f(err ? err : 'NO_DATA');
				}

				f({error: err, uris: rows});
			});
		}
	});
};


exports.getAssignedUriList = function getAssignedUriList(resource,tipolista,f){
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
			if (tipolista==1){ //lista negra
				var query = connection.query('SELECT U.idURILISTAS, U.ip FROM ug5k.urilistas U '+ 
												'WHERE U.idURILISTAS not in (SELECT L.URILISTAS_idURILISTAS FROM ug5k.listanegra L WHERE L.RECURSO_idRECURSO=?)',
												 resource, function(err, rows, fields) {
					connection.end();	
					logging.LoggingDate(query.sql);
					if (err || rows.length == 0){
						return f(err ? err : 'NO_DATA');
					}
					f({error: err, uris: rows});
			});
			}
			else{
				if (tipolista==2){ //lista blanca
					var query = connection.query('SELECT U.idURILISTAS, U.ip FROM ug5k.urilistas U '+ 
												'WHERE U.idURILISTAS not in (SELECT L.URILISTAS_idURILISTAS FROM ug5k.listablanca L WHERE L.RECURSO_idRECURSO=?)', 
												 resource, function(err, rows, fields) {
						connection.end();	
						logging.LoggingDate(query.sql);
						if (err || rows.length == 0){
							return f(err ? err : 'NO_DATA');
						}
								
					f({error: err, uris: rows});
					});
				}
			}
		}
	});
};

exports.postUriList = function postUriList(uri,f){
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

			var query = connection.query('INSERT INTO URILISTAS SET ?', uri, function(err, result) {
				logging.LoggingDate(query.sql);
			
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					connection.end();	
					return f({error:err, data:null});
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: null , data: result.insertId});
		});
		}
	});
};

exports.deleteUriList = function deleteUriList(uri, f){
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

			var query = connection.query('DELETE FROM URILISTAS WHERE ?', uri, function(err, result) {
			
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);
				f({error: null , data: uri});

				connection.end();	
			});
		}
	});
};

exports.getListsFromResource = function getListsFromResource(rsc,f){
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

			var query = connection.query('SELECT u.idURILISTAS, u.ip, 1 as negra FROM URILISTAS u INNER JOIN listanegra ln ON ln.URILISTAS_idURILISTAS=u.idURILISTAS ' +
											'WHERE ln.RECURSO_idRECURSO=? ' +
											'UNION ' +
										 'SELECT u.idURILISTAS, u.ip, 0 as negra FROM URILISTAS u INNER JOIN listablanca lb ON lb.URILISTAS_idURILISTAS=u.idURILISTAS ' +
											'WHERE lb.RECURSO_idRECURSO=?',[rsc,rsc], function(err, rows, fields) {
				connection.end();	
				logging.LoggingDate(query.sql);
				if (err || rows.length == 0){
					return f(err ? err : 'NO_DATA');
				}

				f({error: err, uris: rows});
			});
		}
	});
};

exports.postUriToResource = function postUriToResource(rsc,uri,f){
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

			async.parallel({
				listablanca: function(callback){
					var query = '';
					if (uri.white){
						query = connection.query('INSERT INTO LISTABLANCA SET ?', {RECURSO_idRECURSO: rsc, URILISTAS_idURILISTAS: uri.idURILISTAS}, function(err, result) {
							logging.LoggingDate(query.sql);
							if (err){
								logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
								return callback(err);
							}

							callback();
						});
					}
					else
						callback();
				},
				listanegra: function(callback){
					var query = '';
					if (uri.black){
						query = connection.query('INSERT INTO LISTANEGRA SET ?', {RECURSO_idRECURSO: rsc, URILISTAS_idURILISTAS: uri.idURILISTAS}, function(err, result) {
							logging.LoggingDate(query.sql);
							if (err){
								logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
								return callback(err);
							}

							callback();
						});
					}
					else
						callback();
				}
			},
				function(err){
					connection.end();
					
					if (err)
						f({error:err, data: null});
					else
						f({error:null, data: uri});
				}
			);
		}
	});
};

exports.deleteUriToResource = function deleteUriToResource(rsc,uri,f){
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

			async.parallel({
				listablanca: function(callback){
				if (uri.white){
					var query = '';
					query = connection.query('DELETE FROM LISTABLANCA WHERE RECURSO_idRECURSO=? AND ' +
													'URILISTAS_idURILISTAS=?', [rsc,uri.idURILISTAS], function(err, result) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}
					});
				}
				callback();
				},
				listanegra: function(callback){
					if (uri.black){
					var query = '';
					query = connection.query('DELETE FROM LISTANEGRA WHERE RECURSO_idRECURSO=? AND ' +
													'URILISTAS_idURILISTAS=?', [rsc,uri.idURILISTAS], function(err, result) {
						logging.LoggingDate(query.sql);
						if (err){
							logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
							return callback(err);
						}
					});
					}
				callback();
				}
			},
				function(err){
					connection.end();
					
					if (err)
						f({error:err, data: null});
					else
						f({error:null, data: uri});
				}
			);
		}
	});
};

exports.getUriByIp = function getUriByIp(ip,f){
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

			var query = connection.query('SELECT * FROM URILISTAS WHERE ip=?', ip, function(err, rows, fields) {
				connection.end();	
				logging.LoggingDate(query.sql);
				if (err || rows.length == 0){
					return f(null);
				}


				f(rows[0]);
			});
		}
	});
};

exports.getResourceUris = function getResourceUris(rsc, f){
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

			var query = connection.query('SELECT * FROM ubicaciones WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
			
				if (err || rows.length == 0){
					connection.end();	

					return f({error: (err ? err : 'NO_DATA'), uris: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, uris: rows});

				connection.end();	
			});
		}
	});
};

exports.postResourceUris = function postResourceUris(uri, f){
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

			var query = connection.query('INSERT INTO ubicaciones SET ?', uri, function(err, result) {
			
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					connection.end();	
					return f({error: (err ? err : 'NO_DATA'), uris: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, uris: uri});

				connection.end();	
			});
		}
	});
};

exports.putResourceUris = function putResourceUris(uri, f){
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

			var query = connection.query('UPDATE ubicaciones SET ? WHERE idUBICACIONES=?', [uri,uri.idUBICACIONES], function(err, result) {
			
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					connection.end();	
					return f({error: (err ? err : 'NO_DATA'), uris: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, uris: uri});

				connection.end();	
			});
		}
	});
};

exports.deleteUrisBelongingResource = function deleteUrisBelongingResource(rsc, f){
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

			var query = connection.query('DELETE FROM ubicaciones WHERE RECURSO_idRECURSO=?', rsc, function(err, result) {
			
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					connection.end();	
					return f({error: (err ? err : 'NO_DATA'), uris: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, uris: ''});

				connection.end();	
			});
		}
	});
};

exports.postResourceUris = function postResourceUris(uri, f){
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

			var query = connection.query('INSERT INTO ubicaciones SET ?', uri, function(err, result) {
			
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					connection.end();	
					return f({error: (err ? err : 'NO_DATA'), uris: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, uris: uri});

				connection.end();	
			});
		}
	});
};

exports.deleteResourceUri = function deleteResourceUri(rsc,uri,f){
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

			var query = connection.query('DELETE FROM ubicaciones WHERE idUBICACIONES=? AND RECURSO_idRECURSO=?', [uri,rsc], function(err, result) {
			
				if (err){
					logging.loggingError("SQL: " + query.sql + "\nERROR: " + err.message);
					connection.end();	
					return f({error: (err ? err : 'NO_DATA'), uris: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, uris: null});

				connection.end();	
			});
		}
	});
};

exports.getRemoteRadioResources = function getRemoteRadioResources(cfg,site,gtw,f){
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

			var select='';

			if (cfg == "null")
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
											'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'ORDER BY cfName,eName,gName';
    		else if (site == "null")
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
											'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'WHERE cf.name=\'' + cfg + '\' ' +
    										'ORDER BY cfName,eName,gName';
    		else if (gtw == "null")
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
											'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'WHERE cf.name=\'' + cfg + '\' AND e.name=\'' + site + '\' ' +
    										'ORDER BY cfName,eName,gName';
    		else
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
											'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'WHERE cf.name=\'' + cfg + '\' AND e.name=\'' + site + '\' AND c.name=\'' + gtw + '\' ' +
    										'ORDER BY cfName,eName,gName';


			query = connection.query(select,  function(err, rows, fields) {
				connection.end();	

				if (err || rows.length == 0){
					return f({error: (err ? err : 'NO_DATA'), data: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, data: rows});
			});
		}
	});
};

exports.getTelephonicResources = function getTelephonicResources(cfg,site,gtw,f){
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

			var select='';

			if (cfg == "null")
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'WHERE r.tipo=2 ' +
    										'ORDER BY cfName,eName,gName';
    		else if (site == "null")
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'WHERE r.tipo=2 AND cf.name=\'' + cfg + '\' ' +
    										'ORDER BY cfName,eName,gName';
    		else if (gtw == "null")
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'WHERE r.tipo=2 AND cf.name=\'' + cfg + '\' AND e.name=\'' + site + '\' ' +
    										'ORDER BY cfName,eName,gName';
    		else
				select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
    										'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
    										'WHERE r.tipo=2 AND cf.name=\'' + cfg + '\' AND e.name=\'' + site + '\' AND c.name=\'' + gtw + '\' ' +
    										'ORDER BY cfName,eName,gName';


			query = connection.query(select,  function(err, rows, fields) {
				connection.end();	

				if (err || rows.length == 0){
					return f({error: (err ? err : 'NO_DATA'), data: null});
				}

				logging.LoggingDate(query.sql);
				f({error: err, data: rows});
			});
		}
	});
};