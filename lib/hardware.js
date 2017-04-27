var async=require('async');
var myLibResources = require('./resources.js');
var myLibRadioDestination = require('./radioDestinations.js');
var logging = require('./loggingDate.js');

exports.getHardware = function getHardware(f){
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

			// Get keys of services
			var query = connection.query('SELECT S.*,H.CGW_idCGW,H.rank FROM SLAVES S ' +
											'LEFT JOIN hardware H ON S.idSLAVES = h.SLAVES_idSLAVES ' +
											'ORDER BY name', function(err, rows, fields) {
				if (err || rows.length == 0){
					connection.end();
					return f(err ? err : 'NO_DATA');
				}

				logging.LoggingDate(query.sql);
				f({hardware: rows});

				connection.end();	
			});
		}
	});
}


exports.getResNamesInConfig = function(name, idCfg, f){
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
			
			query = connection.query('SELECT name '+
									'FROM recurso WHERE POS_idPOS IN '+
									'(SELECT idPOS '+
									'FROM pos WHERE SLAVES_idSLAVES IN '+
									'(SELECT SLAVES_idSLAVES '+
									'FROM hardware '+
									'WHERE CGW_idCGW = ?))', idCfg, function(err, rows, fields) {
				logging.LoggingDate(query.sql);
				
				connection.end();
				if (err){
					f({error:err, data:null})
				}
				else if (rows == null){
					f({error:err, data:null});
				}
				else{
					var dupName = false;
					for(var i=0;i<rows.length;i++) {
						if(name == rows[i].name) {
							dupName = true;
							break;
						}
					}
					if(dupName)
						f({error:"NAME_DUP", data:rows});
					else
						f({error:"NO_ERROR", data:rows});
				}
			});
		}
	});
}

// exports.getHardwareBelongsGroup = function getHardwareBelongsGroup(siteId, f){
// 	var mySql = require('mySql');
// 	var connection = mySql.createConnection({
// 	  host     : 'localhost',
// 	  user     : 'root',
// 	  password : 'U5K-G',
// 	  database : 'ug5k' 
// 	});

// 	connection.connect(function(err){
// 		if (err){
// 			logging.LoggingDate("Error connection to 'U5K-G' database.");
// 		}
// 		else{
// 			logging.LoggingDate("Successful connection to 'U5K-G' database!");

// 			// Get keys of services
// 			var query = connection.query('SELECT S.*,G.name as nameOfGroup,H.CGW_idCGW,H.rank FROM SLAVES S ' +
// 											'LEFT JOIN grupo G ON S.GRUPO_idGRUPO=G.idGRUPO ' +
// 											'LEFT JOIN hardware H ON S.idSLAVES = h.SLAVES_idSLAVES ' +
// 											'WHERE G.EMPLAZAMIENTO_idEMPLAZAMIENTO=? ORDER BY name', siteId, function(err, rows, fields) {
// 				if (err || rows.length == 0){
// 					connection.end();
// 					return f(err ? err : 'NO_DATA');
// 				}

// 				logging.LoggingDate(query.sql);
// 				f({hardware: rows});

// 				connection.end();	
// 			});
// 		}
// 	});
// }

exports.getSlave = function getSlave(hw, f){
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

			var query = connection.query('SELECT S.*,P.rank as P_rank,R.name AS resource, R.tipo, R.idRECURSO, ' +
											'R.POS_idPOS, PR.tipo as subtipo FROM SLAVES S ' +
											'LEFT JOIN POS P ON S.idSLAVES=P.SLAVES_idSLAVES ' +
											'RIGHT JOIN recurso R ON R.POS_idPOS=P.idPOS ' +
											'LEFT JOIN paramradio PR ON R.idRECURSO=PR.RECURSO_idRECURSO ' +
											'WHERE S.idSLAVES=? ' +
											'ORDER BY P_rank', hw, function(err, rows, fields) {
			
				if (err || rows.length == 0){
					connection.end();
					return f(err ? err : 'NO_DATA');
				}

				logging.LoggingDate(query.sql);
				f({hardware: rows});

				connection.end();	
			});
		}
	});
}

exports.postSlave = function postSlave(hw,f){
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

			var query = connection.query('INSERT INTO SLAVES SET ?', hw, function(err, result) {
			
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);
				hw['idSLAVES']=result.insertId;
				f({error: null , data: hw});

				connection.end();	
			});
		}
	});
}

exports.copySlave = function copySlave(hw, slave, f){
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

			// Adding slave
			exports.postSlave(slave,function(data){
				async.waterfall([
					// Adding Pos
					function(callback){
						var resultIds=[];
						var query=connection.query('SELECT ? AS SLAVES_idSLAVES, P.rank as rank FROM POS P WHERE P.SLAVES_idSLAVES=?', 
														[data.data.idSLAVES,hw], function(err, rows, fields){
							if (err){
								return callback(null, err);
							}

							logging.LoggingDate(query.sql);
							async.each(rows,
								function(r,callback){
									var query=connection.query('INSERT INTO POS SET ?',r,function(err, result){
										if (err) return callback(err);

										logging.LoggingDate(query.sql);
										resultIds.push(result.insertId);

										callback();
									});
								},
								function(err){
									callback(null,resultIds);
								}
							);	// End async.each
						});		// End query SELECT
					},
					function(positionIds, callback){
						var i = 0;
						// Adding resources for each inserted position
							//'INSERT INTO RECURSO (Pos_idPOS,name,tamRTP,codec,tipo,restriccion) ' +
						var query=connection.query('SELECT R.name,R.tamRTP,R.codec,R.tipo,R.restriccion FROM POS P ' +
														'LEFT JOIN RECURSO R ON R.POS_idPOS=P.idPOS WHERE ' + 
														'P.SLAVES_idSLAVES = ? ORDER BY R.POS_idPOS',hw,function(err,rows,fields){
							if (err || rows==null)
								return callback(null, err);

							logging.LoggingDate(query.sql);
							async.each(rows,
								function(r,callback){
									var query=connection.query('INSERT INTO RECURSO SET Pos_idPOS=?, ?',[positionIds[i++],r],function(err,result){
										if (err) return callback(err);

										logging.LoggingDate(query.sql);
										callback();
									});
								},
								function(err){
									callback();
								}
							);
						});
					}], 
					function (err){
						connection.end();

						if (err){
							logging.LoggingDate('Error in asynchronous POST. ' + err.message);
							return f({error: err , data: slave});
						}

						f({error: null , data: slave});
					}
				);
			});
		}
	});
}

exports.putSlave = function putSlave(hw,f){
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

			var query = connection.query('UPDATE SLAVES SET ? WHERE idSLAVES=?', [hw,hw.idSLAVES], function(err, result) {
			
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);
				f({error: null , data: hw});

				connection.end();	
			});
		}
	});
}

exports.delSlave = function delSlave(hw,f){
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

			var query = connection.query('DELETE FROM SLAVES WHERE idSLAVES=? AND ' +
											'? NOT IN (SELECT idSLAVES FROM (SELECT idSLAVES FROM slaves s ' +
														'INNER JOIN hardware h ON h.SLAVES_idSLAVES=s.idSLAVES ' +
                                            			'INNER JOIN cgw_cfg c ON (c.CGW_idCGW=h.CGW_idCGW AND c.activa)) as derived)', 
										[hw,hw], function(err, result) {
			
				connection.end();

				if (err){
					logging.LoggingDate(query.sql);
					return f({error:err, data:0});
				}

				logging.LoggingDate(query.sql);
				f({error: null , data: result.affectedRows});
			});
		}
	});
}

exports.getSlaves = function getSlaves(gwIp,gwId,f){
	// Crear objeto posicion
	function posicion(cfg,tp) {
	    this.cfg = cfg;
	    this.tp = tp;
	}
	// Crear objeto slave
	function slave(tp){
		this.tp = tp;
		this.pos = [];
		this.pos[0] = new posicion(0,0);
		this.pos[1] = new posicion(0,0);
		this.pos[2] = new posicion(0,0);
		this.pos[3] = new posicion(0,0);
	}

	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'U5K-G',
	  database : 'ug5k' 
	});

	var data={hardware: {slv:[new slave(0),new slave(0),new slave(0),new slave(0)]} ,resources: []};

	connection.connect(function(err){
		if (err){
			logging.LoggingDate("Error connection to 'U5K-G' database.");
		}
		else{
			logging.LoggingDate("Successful connection to 'U5K-G' database!");

			var query = connection.query('SELECT H.rank AS slave_rank,S.tp,P.rank as resource_rank,R.* FROM RECURSO R ' +
											'INNER JOIN POS P ON P.idPOS=R.POS_idPOS ' +
											'INNER JOIN SLAVES S ON P.SLAVES_idSLAVES=S.idSLAVES ' +
											'INNER JOIN HARDWARE H on S.idSLAVES = H.SLAVES_idSLAVES ' +
											'INNER JOIN CGW C ON h.CGW_idCGW = c.idCGW ' +
											'WHERE C.idCGW=? ORDER BY H.rank,P.rank', gwId, function(err, rows, fields) {
			
				if (err || rows.length == 0){
					logging.LoggingDate(query.sql);
					connection.end();
					return f(err ? err : data);
				}

				var hardware={slv:[new slave(0),new slave(0),new slave(0),new slave(0)]};
				logging.LoggingDate(query.sql);

				getResourcesFromGateway(rows,gwIp,function(resources){
					data.resources=resources;

					async.each(rows,
						function(r,callback){
							hardware.slv[r.slave_rank].tp = r.tp;
							hardware.slv[r.slave_rank].pos[r.resource_rank].cfg = r.tipo;
							hardware.slv[r.slave_rank].pos[r.resource_rank].tp = 1; /* ¿? r.tipo; */
							callback();
						},
						function(err){
							connection.end();	
							data.hardware=hardware;
							f(data);
						}
					);
				});
			});
		}
	});
}

/************************************************/
/**** setResource								*/
/**** Da de alta un recurso y lo asigna 		*/
/**** a una slave.								*/
/**** REMARKS: En POS_idPOS 					*/						
/**** 			va la posición dentro de la 	*/
/****			esclava.						*/
/************************************************/
exports.setResource = function setResource(slave,resource,f){
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

			// Se da de alta la posición del recurso en la slave... (En POS_idPOS va la posición dentro de la esclava...)
			var query = connection.query('INSERT INTO POS SET SLAVES_idSLAVES=?, rank=?', [slave,resource.POS_idPOS], function(err, result) {
			
				if (err){
					logging.LoggingError("SQL ERROR: " + err.message);
					connection.end();
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);

				// ... Restauramos POS_idPOS con el valor correspondiente a la clave en la tabla POS.
				resource.POS_idPOS = result.insertId;

				query = connection.query('INSERT INTO RECURSO SET ?', resource, function(err, result) {
					if (err){
						logging.LoggingError("SQL ERROR: " + err.message);
						connection.end();
						return f({error:err, data:null});
					}

					async.parallel({
						parametros:function(callback){
							// Una vez que está insertado el recurso, procedemos a insertar los 
							// parámetros hw, tel o radio, jitter y listas
							if (resource.tipo == 1){	
								// Recurso RADIO
								var paramRadio ={
									// Parámetros Hw
									hw:{
									},
									// Parámetros radio
									rd:{
										tabla_indices_calidad:[]
									},
									// Jitter
									jt:{
									}
								};
								var voidColateralRadio={
								}

								var colateral = voidColateralRadio;
								//var emplazamientos = colateral.emplazamientos;
								// Eliminar del JSON radio el colateral.
								delete colateral.emplazamientos;

								paramRadio.hw.RECURSO_idRECURSO = result.insertId;
								paramRadio.rd.RECURSO_idRECURSO = result.insertId;
								paramRadio.jt.RECURSO_idRECURSO = result.insertId;

								myLibResources.postRadioParameters(result.insertId,paramRadio,function(result){
									callback();
								});
							}
							else{
								// Recurso TEL
								var paramTel = {
									// Parámetros Hw
									hw:{
									},
									// Parámetros telefonia
									tf:{
									},
									// Jitter
									jt:{
									}
								}

								paramTel.hw.RECURSO_idRECURSO = result.insertId;
								paramTel.tf.RECURSO_idRECURSO = result.insertId;
								paramTel.jt.RECURSO_idRECURSO = result.insertId;

								myLibResources.postTelephoneParameters(result.insertId,paramTel,function(result){
									callback();
								})
							}
						},
						listas:function(callback){
							// Tratar listas blancas y negras
							setWhiteAndBlackLists(result.insertId, [],[], function(result){
								callback();
							})
						}
					},function(error){
						connection.end();	

						resource.idRECURSO = result.insertId;
						f({error: null , data: resource});
					})
				});
			});
		}
	});
}


/********************************************/
/**** setResources							*/
/**** Da de alta todos los recursos		 	*/
/**** recibidos como parte de la 			*/
/**** configuración de una pasarela 		*/
/********************************************/
exports.setResources = function setResources(slaves,recursos,f){
	async.each(recursos,
		function(r,callback){
			var recurso={};

			// Colocamos en POS_idPOS la posición dentro de 
			// la esclava segun requerimiento de setResource
			recurso.POS_idPOS = r.NumDispositivoSlot;
			recurso.name = r.IdRecurso;
			recurso.tipo = r.Radio_o_Telefonia;
			recurso.tamRTP = r.TamRTP;
			recurso.codec = r.Codec;
			recurso.LlamadaAutomatica = r.LlamadaAutomatica;
			recurso.restriccion = r.restriccion;
			recurso.enableRegistro = r.enableRegistro;
			recurso.szClave = r.szClave;

			//removeEveryPos(slaves[r.SlotPasarela],function(result){
				module.exports.setResource(slaves[r.SlotPasarela],recurso,function(result){
					async.parallel({
						parametros:function(callback){
							// Una vez que está insertado el recurso, procedemos a insertar los 
							// parámetros hw, tel o radio, jitter y listas
							if (recurso.tipo == 1){	
								// Recurso RADIO
								var paramRadio ={
									// Parámetros Hw
									// Parámetros radio
									// Jitter
								};
								var voidColateralRadio={
									name:'',
									tipoConmutacion:0,
									emplazamientos:[]
								}

								var colateral = (r.radio != null && r.radio.colateral != null) ? r.radio.colateral : voidColateralRadio;
								var emplazamientos = colateral.emplazamientos;
								// Eliminar del JSON radio el colateral.
								delete r.radio.colateral;
								delete colateral.emplazamientos;

								paramRadio.hw = r.hardware;
								paramRadio.rd = r.radio;
								paramRadio.jt = r.Buffer_jitter;

								paramRadio.hw.RECURSO_idRECURSO = result.data.idRECURSO;
								paramRadio.rd.RECURSO_idRECURSO = result.data.idRECURSO;
								paramRadio.jt.RECURSO_idRECURSO = result.data.idRECURSO;
								myLibResources.postRadioParameters(result.data.idRECURSO,paramRadio,function(result){
									if (colateral.name != ''){
										myLibRadioDestination.getDestinationByName(colateral.name,function(result){
											if (result.destination !== null){
												// Actualizar destino
												colateral.idDESTINOS = result.destination.idDESTINOS;
												myLibRadioDestination.putDestination(result.destination.idDESTINOS,colateral,function(result){
													// Asignar recurso al destino
													myLibRadioDestination.postResourceToRadioDestination(paramRadio.hw.RECURSO_idRECURSO, colateral.name,function(result){
														// Asignar Ubicaciones
														async.each(emplazamientos,
															function(e,callback){
																if (e.uriTxA != '' || e.uriTxB != '' || e.uriRxA != '' || e.uriRxB != ''){
																	e.RECURSO_idRECURSO = paramRadio.hw.RECURSO_idRECURSO;
																	myLibResources.deleteUrisBelongingResource(e.RECURSO_idRECURSO,function(result){
																		myLibResources.postResourceUris(e,function(result){
																			callback();
																		})
																	})
																}
																else
																	callback();
															},
															function(err){
																callback();
															}
														);	// End async.each
													})
												})
											}
											else{
												// Insertar nuevo destino
												myLibRadioDestination.postRadioDestination(colateral,function(result){
													// Asignar recurso al destino
													myLibRadioDestination.postResourceToRadioDestination(paramRadio.hw.RECURSO_idRECURSO, colateral.name,function(result){
														// Asignar Ubicaciones
														async.each(emplazamientos,
															function(e,callback){
																if (e.uriTxA != '' || e.uriTxB != '' || e.uriRxA != '' || e.uriRxB != ''){
																	e.RECURSO_idRECURSO = paramRadio.hw.RECURSO_idRECURSO;
																	myLibResources.deleteUrisBelongingResource(e.RECURSO_idRECURSO,function(result){
																		myLibResources.postResourceUris(e,function(result){
																			callback();
																		})
																	})
																}
																else
																	callback();
															},
															function(err){
																callback();
															}
														);	// End async.each
													})
												})
											}
										})
									}
									else
										callback();
								});
							}
							else{
								// Recurso TEL
								var paramTel = {
									// Parámetros Hw
									// Parámetros telefonia
									// Jitter
								}

								var rangosDst = r.telefonia.ats_rangos_dst;
								var rangosOrg = r.telefonia.ats_rangos_org;
								// Eliminar del JSON radio el colateral.
								delete r.telefonia.ats_rangos_dst;
								delete r.telefonia.ats_rangos_org;

								paramTel.hw = r.hardware;
								paramTel.tf = r.telefonia;
								paramTel.jt = r.Buffer_jitter;

								paramTel.hw.RECURSO_idRECURSO = result.data.idRECURSO;
								paramTel.tf.RECURSO_idRECURSO = result.data.idRECURSO;
								paramTel.jt.RECURSO_idRECURSO = result.data.idRECURSO;

								myLibResources.postTelephoneParameters(result.data.idRECURSO,paramTel,function(result){
									myLibResources.getRangeAtsByParam(result.data.tf.idPARAMTELEF,function(result){
										async.series({
											delete: function(callback){
												if (result != null){
													myLibResources.deleteRangeAtsByParam(result,function(result){
														callback();
													});
												}
												else
													callback();
											},
											orgRanges:function(callback){
												async.each(rangosOrg,
													function(r,callback){
														var rango={
															PARAMTELEF_idPARAMTELEF: result,
															origen: true,
															inicial: r.inicial,
															final: r.final, 
														}
														if (r.inicial != '' || r.final != ''){
															myLibResources.postRangeAts(paramTel.tf.RECURSO_idRECURSO,rango,function(result){
																callback();
															})
														}
														else
															callback();
													},
													function(error){
														callback();
													});
											},
											dstRanges:function(callback){
												async.each(rangosDst,
													function(r,callback){
														var rango={
															PARAMTELEF_idPARAMTELEF: result,
															origen: false,
															inicial: r.inicial,
															final: r.final, 
														}
														if (r.inicial != '' || r.final != ''){
															myLibResources.postRangeAts(paramTel.tf.RECURSO_idRECURSO,rango,function(result){
																callback();
															})
														}
														else
															callback();
													},
													function(error){
														callback();
													});
											}
										},function(error){
											// Fin inserción rangos ATS
											callback();
										});
									})
								})
							}
						},
						listas:function(callback){
							// Tratar listas blancas y negras
							setWhiteAndBlackLists(result.data.idRECURSO, r.blanca, r.negra, function(result){
								callback();
							})
						}
					},function(error){
						callback();
					})
				})
			//})
		},
		function(err){
			f(null);
		}
	);	// End async.each
}

/*****************************************/
/**** AssignHardwareToGateway		******/
/**** 	Asigna una slave a una		******/
/****	pasarela					******/
/*****************************************/
exports.AssignHardwareToGateway = function AssignHardwareToGateway(hw, f){
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

			// Se da de alta el registro en la tabla de hardware...
			var query = connection.query('INSERT INTO hardware SET ?', hw, function(err, result) {
			
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);

				f({error: null , data: hw});

				connection.end();	
			});
		}
	});
}

/*****************************************/
/**** RemoveHardwareFromGateway		******/
/**** 	Libera una slave de una		******/
/****	pasarela					******/
/*****************************************/
exports.RemoveHardwareFromGateway = function RemoveHardwareFromGateway(hw, f){
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

			// Se elimina el registro en la tabla de hardware...
			var queryString;
			if (hw.SLAVES_idSLAVES != null)
				queryString = 'DELETE FROM hardware WHERE CGW_idCGW="' + hw.CGW_idCGW + '" AND SLAVES_idSLAVES="' + hw.SLAVES_idSLAVES + '"';
			else if (hw.rank != null)
				queryString = 'DELETE FROM hardware WHERE CGW_idCGW="' + hw.CGW_idCGW + '" AND rank="' + hw.rank + '"';
			else
				queryString = 'DELETE FROM hardware WHERE CGW_idCGW="' + hw.CGW_idCGW + '"';

			var query = connection.query(queryString, function(err, result) {
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);
				connection.end();	

				f({error: null , data: hw});
			});
		}
	});
}

exports.UpdateHardwareToGateway = function UpdateHardwareToGateway(hw, f){
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

			// Actualizar la posición de la slave dentro de la gateway en la tabla de hardware...
			var query = connection.query('UPDATE hardware SET rank=? WHERE CGW_idCGW=? AND SLAVES_idSLAVES=?', [hw.rank,hw.CGW_idCGW,hw.SLAVES_idSLAVES], function(err, result) {
			
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);

				f({error: null , data: hw});

				connection.end();	
			});
		}
	});
}

/*****************************************************/
/**** updatePosition							******/
/**** 	Actualiza la posicion de un 			******/
/****	recurso con una slave/rank distinta.	******/
/*****************************************************/
exports.updatePosition = function updatePosition(position,f){
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

			// Actualizar la posición dada a una esclava/rank distinta
			var query = connection.query('UPDATE pos SET ? WHERE idPOS=?', [position,position.idPOS], function(err, result) {
			
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();
					return f({error:err, data:null});
				}

				logging.LoggingDate(query.sql);

				f({error: null , data: position});

				connection.end();	
			});
		}
	});
}

function getResourcesFromGateway(hw,ipGtw,f){
	// Crear objeto resource
	function resource(slave,rank){
		this.IdRecurso = '';
		this.Radio_o_Telefonia = 0;
		this.SlotPasarela = slave;
		this.NumDispositivoSlot = rank;
		this.TamRTP = 0;
		this.Codec = 0;
		this.Uri_Local = '';
		this.enableRegistro = 0;
		this.szClave = '';
		this.Buffer_jitter = {
			min:0,
			max:0
		};
		this.hardware = {
			AD_AGC: 0,
            AD_Gain: 10,
            DA_AGC: 0,
            DA_Gain: -10			
		};
		this.radio = {
			tipo: 0,
            sq: 0,
            ptt: 0,
            bss: false,
            modoConfPtt: 0,
            repSqBss: 1,
            desactivacionSq: 1,
            timeoutPtt: 200,
            metodoBss: 0,
            umbralVad: -33,
            numFlujosAudio: 1,
            tiempoPtt: 0,
            tmVentanaRx: 100,
            climaxDelay: 1,
            tmRetardoFijo: 100,
            bssRtp: 0,
            retrasoSqOff: 50,
            evtPTT: 0,
            tjbd: 20,
            tGRSid: 10,
            iEnableGI: 0,
            // Comentar hasta que el json de configuración esté preparado para este campo
            //ForcedSignal: 0,
            tabla_audio: '',  
            tabla_indices_calidad: [],
            iSesionPrio: 0,
            iPttPrio: 0,
            iPrecisionAudio: 0,
            colateral: {
                name: "",
                tipoConmutacion: 0,
                emplazamientos: [{
                    uriTxA: "",
                    uriTxB: "",
                    activoTx: 0,
                    uriRxA: "",
                    uriRxB: "",
                    activoRx: 0
                }, {
                    uriTxA: "",
                    uriTxB: "",
                    activoTx: 0,
                    uriRxA: "",
                    uriRxB: "",
                    activoRx: 0
                }, {
                    uriTxA: "",
                    uriTxB: "",
                    activoTx: 0,
                    uriRxA: "",
                    uriRxB: "",
                    activoRx: 0
                }
                ]
            }
        };
        this.telefonia = {
   			tipo: 0,
            lado: 1,
            t_eym: 0,
            h2h4: 0,
            ladoeym: 0,
            modo: 0,
            r_automatica: 1,
            no_test_local: "",
            no_test_remoto: "",
            it_release: 5,
            uri_remota: "",
            detect_vox: 0,
            umbral_vox: -10,
            tm_inactividad: 2,
            superv_options: 1,
            tm_superv_options: 2,
            colateral_scv: 0,
            iT_Int_Warning: 0,
            ats_rangos_dst: [
				{ inicial: "", final: "" },
				{ inicial: "", final: "" },
				{ inicial: "", final: "" },
				{ inicial: "", final: "" }
            ],
            ats_rangos_org: [
				{ inicial: "", final: "" },
				{ inicial: "", final: "" },
				{ inicial: "", final: "" },
				{ inicial: "", final: "" }
            ],
			iModoCalculoClimax: 0       	
        };
		this.LlamadaAutomatica = 0;
		this.restriccion = 0;
		this.blanca= ["", "", "", "", "", "", "", ""];
        this.negra= ["", "", "", "", "", "", "", ""];
	}

	// Crear lista de recursos
	var recursos=[];
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

			//var recursos=[new resource(0),new resource(1),new resource(2),new resource(3)];
			//var gtw = new gateway();

			async.each(hw,
				function(h,callback){
					var recurso = new resource(h.slave_rank, h.resource_rank);

					recurso.IdRecurso = h.name;
					recurso.Radio_o_Telefonia = h.tipo;
					recurso.TamRTP = h.tamRTP;
					recurso.Codec = h.codec;
					recurso.Uri_Local = 'sip:' + h.name + '@' + ipGtw;
					recurso.enableRegistro = h.enableRegistro;
					recurso.szClave = h.szClave;
					recurso.restriccion = h.restriccion;
					recurso.LlamadaAutomatica = h.LlamadaAutomatica;
					
					if (h.tipo == 1){	// Recurso radio
						myLibResources.getRadioParameters(h.idRECURSO,function(param){
							if (param.parametros != null){
								recurso.Buffer_jitter = param.parametros.Buffer_jitter;
								recurso.hardware = param.parametros.hardware;
								recurso.radio = param.parametros.radio;

								recurso.radio.tabla_audio = param.parametros.tablaAudio.name; 
								recurso.radio.tabla_indices_calidad=[];
								if (param.parametros.valoresTablaAudio!=null){
									for (var i=0;i < param.parametros.valoresTablaAudio.length; i++){
										recurso.radio.tabla_indices_calidad.push(param.parametros.valoresTablaAudio[i].valor_rssi);
									}
								}
            					
            					recurso.radio.colateral= {
                					name: "",
                					tipoConmutacion: 0,
					                emplazamientos: [{
					                    uriTxA: "",
					                    uriTxB: "",
					                    activoTx: 0,
					                    uriRxA: "",
					                    uriRxB: "",
					                    activoRx: 0
					                }, {
					                    uriTxA: "",
					                    uriTxB: "",
					                    activoTx: 0,
					                    uriRxA: "",
					                    uriRxB: "",
					                    activoRx: 0
					                }, {
					                    uriTxA: "",
					                    uriTxB: "",
					                    activoTx: 0,
					                    uriRxA: "",
					                    uriRxB: "",
					                    activoRx: 0
					                }
					                ]
					            };

								myLibRadioDestination.getRadioDestinationAssignedToResource(h.idRECURSO,function(data){
									if (data.error == null){
										recurso.radio.colateral.name = data.destination.name;
										recurso.radio.colateral.tipoConmutacion = data.destination.tipoConmutacion;
										var i=0;
										async.each(data.destination.emplazamientos,
											function(r,callback){
												recurso.radio.colateral.emplazamientos[i++] = r;

												callback();
											},
											function(err){
												// Obtener listas blancas y negras
												myLibResources.getResource(h.idRECURSO,function(rscs){
													var blanca=[];
													var negra=[];
													var b,n;
													b=n=0;
													async.each(rscs.recursos,
														function(r,callback){
															if (r.blanca && r.ip != null){
																recurso.blanca[b++]=r.ip;
																//blanca.push(r.ip);
															}
															else if (!r.blanca && r.ip != null){
																recurso.negra[n++]=r.ip;
																//negra.push(r.ip);
															}
															callback();
														},
														function(err){
															//recurso.blanca=blanca;
															//recurso.negra=negra;
															recursos.push(recurso);
															callback();
														}
													);	// End async.each
												});
											}
										);	// End async.each
									}
									else
										callback();
								})
							}
						else
							callback();
						});
					}
					else{	// Recurso telefonía
						myLibResources.getTelephoneParameters(h.idRECURSO,function(param){
							if (param.parametros != null){
								recurso.Buffer_jitter = param.parametros.Buffer_jitter;
								recurso.hardware = param.parametros.hardware;
								recurso.telefonia = param.parametros.telefonia;
								recurso.telefonia.ats_rangos_dst= [
																{ inicial: "", final: "" },
																{ inicial: "", final: "" },
																{ inicial: "", final: "" },
																{ inicial: "", final: "" }
												            ];
								recurso.telefonia.ats_rangos_org= [
																{ inicial: "", final: "" },
																{ inicial: "", final: "" },
																{ inicial: "", final: "" },
																{ inicial: "", final: "" }
												            ];    
								recurso.telefonia.iModoCalculoClimax = 0;   	
								var i=0;
								async.each(param.parametros.ats_rangos_dst,
									function(r,callback){
										if (r.inicial != '' && r.final != '')
											recurso.telefonia.ats_rangos_dst[i++] = r;

										callback();
									},
									function(err){
									}
								);	// End async.each
								i=0;
								async.each(param.parametros.ats_rangos_org,
									function(r,callback){
										if (r.inicial != '' && r.final != '')
											recurso.telefonia.ats_rangos_org[i++] = r;

										callback();
									},
									function(err){
									}
								);	// End async.each

								// Obtener listas blancas y negras
								myLibResources.getResource(h.idRECURSO,function(rscs){
									var blanca=[];
									var negra=[];
									var b,n;
									b=n=0;
									async.each(rscs.recursos,
										function(r,callback){
											if (r.blanca && r.ip != null){
												recurso.blanca[b++]=r.ip;
												//blanca.push(r.ip);
											}
											else if (!r.blanca && r.ip != null){
												recurso.negra[n++]=r.ip;
												//negra.push(r.ip);
											}
											callback();
										},
										function(err){
											//recurso.blanca=blanca;
											//recurso.negra=negra;
											recursos.push(recurso);
											callback();
										}
									);	// End async.each
								});

							}
							else
								callback();
						});
					}

					// Obtener listas blancas y negras
					// myLibResources.getResource(h.idRECURSO,function(rscs){
					// 	var blanca=[];
					// 	var negra=[];
					// 	var b,n;
					// 	b=n=0;
					// 	async.each(rscs.recursos,
					// 		function(r,callback){
					// 			if (r.blanca && r.ip != null){
					// 				recurso.blanca[b++]=r.ip;
					// 				//blanca.push(r.ip);
					// 			}
					// 			else if (!r.blanca && r.ip != null){
					// 				recurso.negra[n++]=r.ip;
					// 				//negra.push(r.ip);
					// 			}
					// 			callback();
					// 		},
					// 		function(err){
					// 			//recurso.blanca=blanca;
					// 			//recurso.negra=negra;
					// 			recursos.push(recurso);
					// 			callback();
					// 		}
					// 	);	// End async.each
					// });
				},
				function(err){
					connection.end();	
					f(recursos);
				}
			);
		}
	});
}

function removeEveryPos(slave,f){
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

			// Eliminar todas las posiciones de una slave
			var query = connection.query('DELETE FROM pos WHERE SLAVES_idSLAVES=?', slave, function(err, result) {
			
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();
					return f({error:err});
				}

				logging.LoggingDate(query.sql);
				connection.end();	

				f({error: null});
			});
		}
	});
}

function setWhiteAndBlackLists(rsc, blanca, negra, f){
	async.parallel({
		listablanca: function(callback){
			async.each(blanca,
				function(b,callback){
					if (b != null && b != ""){
						// Comprobar si la IP existe en la lista de uris
						myLibResources.getUriByIp(b,function(result){
							if (result === null){
								// Si la URI no existe se crea
								myLibResources.postUriList(b,function(result){
									// Y se asigna la URI al recurso
									myLibResources.postUriToResource(rsc,{white:true,black:false,idURILISTAS:result.data},function(result){
										callback();
									})
								})
							}
							else{
								myLibResources.postUriToResource(rsc,{white:true,black:false,idURILISTAS:result.idURILISTAS},function(result){
									callback();
								});
							}
						})
					}
					else
						callback();
				},
				function(err){
					callback();
				}
			);
		},
		listanegra: function(callback){
			async.each(negra,
				function(b,callback){
					if (b != null && b != ""){
						// Comprobar si la IP existe en la lista de uris
						myLibResources.getUriByIp(b,function(result){
							if (result === null){
								// Si la URI no existe se crea
								myLibResources.postUriList(b,function(result){
									// Y se asigna la URI al recurso
									myLibResources.postUriToResource(rsc,{white:false,black:true,idURILISTAS:result.data},function(result){
										callback();
									})
								})
							}
							else{
								myLibResources.postUriToResource(rsc,{white:false,black:true,idURILISTAS:result.idURILISTAS},function(result){
									callback();
								});
							}
						})
					}
					else
						callback();
				},
				function(err){
					callback();
				}
			);
		}
	},
		function(err){
			if (err)
				f({error:err, data: null});
			else
				f({error:null, data: ''});
		}
	);
}

