var async=require('async');
var logging = require('./loggingDate.js');
/** AGL */
var gcfg = require('../configUlises.json');

exports.getAllServices = function getAllServices(f){
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

			var servicesName=[];
			// Get keys of services
			var query = connection.query('SELECT idSERVICIOS,name FROM SERVICIOS', function(err, rows, fields) {
				if (err || rows.length == 0){
					return f([]);
				}

				logging.LoggingDate(query.sql);
				if (rows.length > 0)
					{
						servicesName=rows;
						f(servicesName);
					}
				else
					f(servicesName);

				connection.end();	
			});
		}
	});
}

/****************************/
/*	FUNCTION: getServices 	*/
/*  PARAMS: gatewayId,		*/
/*			serviceId		*/
/****************************/
exports.getServices= function getServices(gatewayId,serviceId,f){
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

			var result={};
			var web=null;
			var sip=null;
			var snmp=null;
			var grab=null;
			var sincr=null;
			var serviceName='';

			// CODIGO ASÍNCRONO
			async.waterfall([
				// Get keys of services
				function(callback){
					var queryString = '';
					if (gatewayId != null)
						queryString = "SELECT S.* FROM SERVICIOS S " +
											"INNER JOIN CGW C ON C.servicio = S.idSERVICIOS " +
											"WHERE C.idCGW='" + gatewayId + "'";
					else
						queryString = "SELECT S.* FROM SERVICIOS S " +
											"WHERE s.idSERVICIOS=" + serviceId;

					var query = connection.query(queryString, function(err, rows, fields) {
						if (err || rows.length == 0){
							return callback(rows.length == 0 ? 'NO_DATA' : err);
						}

						logging.LoggingDate(query.sql);
						if (rows.length > 0){
							serviceId=rows[0].idSERVICIOS;
							serviceName=rows[0].name;
							var servicio = {'SIP_idSIP': rows[0].SIP_idSIP,
											'WEB_idWEB': rows[0].WEB_idWEB,
											'SNMP_idSNMP': rows[0].SNMP_idSNMP,
											'GRAB_idGRAB': rows[0].GRAB_idGRAB,
											'SINCR_idSINCR': rows[0].SINCR_idSINCR};
							callback(null,servicio);
						}
					});
				},
				// Selecting overall services
				function(servicio,callback){
					async.parallel([
						// Select SIP service (including proxys and registrars)
						function(callback){
							if (servicio.SIP_idSIP != null){
								async.waterfall([
									// Select SIP data
									function(callback){
										var query=connection.query('SELECT * FROM SIP WHERE idSIP=?',servicio.SIP_idSIP,function(err, rows, fields){
											if (err || rows.length == 0) 
												return callback(err);

											logging.LoggingDate(query.sql);
											if (rows.length > 0){
												sip=rows[0];
												delete sip.idSIP;
												callback(null,servicio.SIP_idSIP);
											}
											else
												callback(null,null);
										});
									},
									// Select Proxys
									function(idSip,callback){
										var proxys=[{ip:'',selected:0},{ip:'',selected:0}];
										var query=connection.query('SELECT ip,selected FROM PROXYS WHERE SIP_idSIP=? ORDER BY -selected',idSip,function(err,rows,fields){
											if (err) 
												return callback(err);

											logging.LoggingDate(query.sql);
											if (rows.length > 0){
												var i=0;
												async.each(rows,
													function(r,callback){
														proxys[i++] = r;

														callback();
													},
													function(err){
													}
												);	// End async.each
												//proxys=rows;
											}
											else{
												proxys[0].ip="";
												proxys[0].selected=1;
												proxys[1].ip="";
												proxys[1].selected=0;
											}

											sip.proxys=proxys;
											callback(null,idSip);
										});
									},
									// Select Registrars
									function(idSip,callback){
										var registrars=[{ip:'',selected:0},{ip:'',selected:0}];
										var query=connection.query('SELECT ip,selected FROM REGISTRARS WHERE SIP_idSIP=? ORDER BY -selected',idSip,function(err,rows,fields){
											if (err) 
												return callback(err);

											logging.LoggingDate(query.sql);
											if (rows.length > 0){
												var i=0;
												async.each(rows,
													function(r,callback){
														registrars[i++] = r;

														callback();
													},
													function(err){
													}
												);	// End async.each
												//registrars=rows;
											}
											else{
												registrars[0].ip="";
												registrars[0].selected=1;
												registrars[1].ip="";
												registrars[1].selected=0;
											}
											sip.registrars=registrars;
											callback(null,idSip);
										});
									}
								], callback);
							}
							else
								callback(null,null);
						},
						// Select WEB service
						function(callback){
							if (servicio.WEB_idWEB != null){
								var query=connection.query('SELECT * FROM WEB WHERE idWEB=?',servicio.WEB_idWEB,function(err, rows, fields){
									if (err || rows.length==0) 
										return callback(err);

									logging.LoggingDate(query.sql);
									if (rows.length > 0){
										web=rows[0];
										delete web.idWEB;
										return callback();
									}
									else
										callback(null,null);
								});
							}
							else
								callback(null,null);
						},
						// Select SNMP service
						function(callback){
							if (servicio.SNMP_idSNMP != null){
								async.waterfall([
									// Select SNMP data
									function(callback){
										var query=connection.query('SELECT * FROM SNMP WHERE idSNMP=?',servicio.SNMP_idSNMP,function(err, rows, fields){
											if (err || rows.length == 0) 
												return callback(err);

											logging.LoggingDate(query.sql);
											if (rows.length > 0){
												snmp=rows[0];
												delete snmp.idSNMP;
												return callback(null,servicio.SNMP_idSNMP);
											}
											else
												callback(null,null);
										});
									},
									// Select TRAPS
									function(idSnmp,callback){
										traps=["",""];
										var query=connection.query('SELECT ip FROM TRAPS WHERE SNMP_idSNMP=?',idSnmp,function(err,rows,fields){
											if (err) 
												return callback(err);

											logging.LoggingDate(query.sql);
											if (rows.length > 0){
												var i=0;
												async.each(rows,function(r,callback){
													traps[i++]=r.ip;
													callback();
												},function(error){
													snmp.traps = traps;
													callback();
												});
											}
											else{
												snmp.traps = traps;
												callback();
											}
										});
									}
								], callback);
							}
							else
								callback(null,null);
						},
						// Select GRAB service
						function(callback){
							if (servicio.GRAB_idGRAB != null){
								var query=connection.query('SELECT * FROM GRAB WHERE idGRAB=?',servicio.GRAB_idGRAB,function(err, rows, fields){
									if (err || rows.length==0) 
										return callback(err);

									logging.LoggingDate(query.sql);
									if (rows.length > 0){
										grab=rows[0];
										delete grab.idGRAB;
										callback();
									}
									else
										callback();
								});
							}
							else
								callback(null,null);
						},
						// Select SINCR service
						function(callback){
							if (servicio.SINCR_idSINCR != null){
								async.waterfall([
									// Select SINCR data
									function(callback){
										var query=connection.query('SELECT ntp FROM SINCR WHERE idSINCR=?',servicio.SINCR_idSINCR,function(err, rows, fields){
											if (err || rows.length == 0) 
												return callback(err);

											logging.LoggingDate(query.sql);
											if (rows.length > 0){
												sincr=rows[0];
											}
										callback(null,servicio.SINCR_idSINCR);
										});
									},
									// Select NTP Servers
									function(idSincr,callback){
										servidores=[{ip:"",selected:0},{ip:"",selected:0}];
										var query=connection.query('SELECT ip,selected FROM SERVIDORESNTP WHERE SINCR_idSINCR=? ORDER BY -selected',idSincr,function(err,rows,fields){
											if (err) 
												return callback(err);

											logging.LoggingDate(query.sql);
											if (rows.length > 0){
												var i=0;
												async.each(rows,function(r,callback){
													servidores[i++]=r;
													callback();
												},function(error){
													sincr.servidores = servidores;
													callback();
												});
												//servidores=rows;
											}
											else{
												sincr.servidores = servidores;
												callback();
											}
										});
									}
								], callback);
							}
							else
								callback(null,null);
						}
					],callback);
				}
			], function (err){
				connection.end();

				if (err){
					if (err === 'NO_DATA')
						return f({error:null, services:null});
					else{
						logging.LoggingDate('Error in asynchronous GET services. ' + err.message);
						return f({error:err, services:null});
					}
				}

				result.idSERVICIOS=serviceId;
				result.name=serviceName;
				result.sip=sip;
				result.web=web;
				result.snmp=snmp;
				result.grab=grab;
				result.sincr=sincr;
				f({error: null, services: result});
			});
		}
	});
}

exports.getService= function getService(service,f){
	exports.getServices(null,service,function(data){
			f(data);
	})
}

/***************************************************************/
/*** postService: Crea un servicio vacío  					****/
/*** service: 	  Solo contiene el nombre del servicio     	****/
/***************************************************************/
exports.postService = function postService(service,f){
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
		
			var query = connection.query("SELECT idSERVICIOS,name FROM servicios WHERE name=?",service.name, function(err, rows, fields) {
				if (err || rows.length == 0){
					exports.insertServices(connection, service, function(err, servicioId){
						connection.end();	
						f({error: err, service: {idSERVICIOS: servicioId, name: service.name}});
					});
				}
				else{
					service.idSERVICIOS = rows[0].idSERVICIOS;
					exports.updateServices(connection, service, function(err, servicioId){
						connection.end();	
						f({error: err, service: {idSERVICIOS: rows[0].idSERVICIOS, name: rows[0].name}});
					});
				}
			})
		}
	});
}


exports.copyService = function copyService(sourceService, targetServiceName, f){
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
		
			var query=connection.query('INSERT INTO SERVICIOS (name,SIP_idSIP,WEB_idWEB,SNMP_idSNMP,GRAB_idGRAB,SINCR_idSINCR)' +
										' (SELECT ?,SIP_idSIP,WEB_idWEB,SNMP_idSNMP,GRAB_idGRAB,SINCR_idSINCR FROM SERVICIOS WHERE idSERVICIOS=?)',
											[targetService,sourceService],function(err, result){
				if (err) return f({error:err});

				logging.LoggingDate(query.sql);
				f({error:false, result:result.insertId});
			});
			connection.end();	
		}
	});
}

exports.deleteService = function deleteService(serviceId,f){
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
		
			async.waterfall([
				// Get keys of services
				function(callback){
					var query = connection.query('SELECT s.* FROM SERVICIOS s ' +
													'WHERE s.idSERVICIOS=?', serviceId, function(err, rows, fields) {
						if (err || rows.length == 0){
							return callback(err ? err :'NO_DATA');
						}

						logging.LoggingDate(query.sql);
						if (rows.length > 0){
							var servicio = {'SIP_idSIP': rows[0].SIP_idSIP,
											'WEB_idWEB': rows[0].WEB_idWEB,
											'SNMP_idSNMP': rows[0].SNMP_idSNMP,
											'GRAB_idGRAB': rows[0].GRAB_idGRAB,
											'SINCR_idSINCR': rows[0].SINCR_idSINCR};
							callback(null,servicio);
						}
					});
				},
				// Removing overall services
				function(servicio,callback){
					async.parallel([
						// delete SIP service (proxys and registrars are deleted from foreign key)
						function(callback){
							if (servicio.SIP_idSIP != null){
								var query=connection.query('DELETE FROM SIP WHERE idSIP=?',servicio.SIP_idSIP,function(err, result){
									if (err) return callback(err);

									logging.LoggingDate(query.sql);
									callback();
								});
							}
							else
								callback();
						},
						// Delete WEB service
						function(callback){
							if (servicio.WEB_idWEB != null){
								var query=connection.query('DELETE FROM WEB WHERE idWEB=?',servicio.WEB_idWEB,function(err, result){
									if (err) return callback(err);

									logging.LoggingDate(query.sql);
									callback();
								});
							}
							else
								callback();
						},
						// Delete SNMP service
						function(callback){
							if (servicio.SNMP_idSNMP != null){
								var query=connection.query('DELETE FROM SNMP WHERE idSNMP=?',servicio.SNMP_idSNMP,function(err, result){
									if (err) return callback(err);

									logging.LoggingDate(query.sql);
									callback();
								});
							}
							else
								callback();
						},
						// Delete GRAB service
						function(callback){
							if (servicio.GRAB_idGRAB != null){
								var query=connection.query('DELETE FROM GRAB WHERE idGRAB=?',servicio.GRAB_idGRAB,function(err, result){
									if (err) return callback(err);

									logging.LoggingDate(query.sql);
									return callback();
								});
							}
							else
								callback();
						},
						// Delete SINCR service
						function(callback){
							if (servicio.SINCR_idSINCR != null){
								var query=connection.query('DELETE FROM SINCR WHERE idSINCR=?',servicio.SINCR_idSINCR,function(err,result){
									if (err) return callback(err);

									logging.LoggingDate(query.sql);
									callback();
								});
							}
							else
								callback();
						}
					],callback);
				}
			], function (err){
					if (err == null){
						var query=connection.query('DELETE FROM SERVICIOS WHERE idSERVICIOS=?',serviceId,function(err,result){
							if (err) return callback(err);

							logging.LoggingDate(query.sql);

							connection.end();	
						});
					}
					else
						connection.end();	

					f({error:err, serviceId:serviceId});
				});
		}		
	});
}

exports.updateServices= function updateServices(connection, services, f){
	// CODIGO ASÍNCRONO
	async.waterfall([
		// Get keys of services
		function(callback){
			var query = connection.query('SELECT s.* FROM SERVICIOS s ' +
											'WHERE s.idSERVICIOS=?', services.idSERVICIOS, function(err, rows, fields) {
				if (err){
					return callback(rows==null || rows.length == 0 ? 'NO_DATA' : err);
				}
				else if (rows==null || rows.length == 0){
					logging.LoggingDate(query.sql);
					var servicio = {'SIP_idSIP': null,
									'WEB_idWEB': null,
									'SNMP_idSNMP': null,
									'GRAB_idGRAB': null,
									'SINCR_idSINCR': null};
					callback(null,servicio);
				}
				else if (rows.length > 0){
					logging.LoggingDate(query.sql);
					var servicio = {'SIP_idSIP': rows[0].SIP_idSIP,
									'WEB_idWEB': rows[0].WEB_idWEB,
									'SNMP_idSNMP': rows[0].SNMP_idSNMP,
									'GRAB_idGRAB': rows[0].GRAB_idGRAB,
									'SINCR_idSINCR': rows[0].SINCR_idSINCR};
					callback(null,servicio);
				}
			});
		},
		// Updating overall services
		function(servicio,callback){
			async.parallel([
				// Update SIP service (including proxys and registrars)
				function(callback){
					if (servicio.SIP_idSIP != null){
						async.parallel([
							// Update SIP data
							function(callback){
								// Crear copia del objeto services.sip
								if (services != null && services.sip != null){
									var sip = JSON.parse(JSON.stringify(services.sip));
									delete sip.proxys;
									delete sip.registrars;
									var query=connection.query('UPDATE SIP SET ? WHERE idSIP=?',[sip,servicio.SIP_idSIP],function(err, result){
										if (err) return callback(err);

										logging.LoggingDate(query.sql);
										callback();
										});
								}
								else
									callback();
							},
							// Update Proxys
							function(callback){
								if (services != null && services.sip != null && services.sip.proxys != null){
									var query=connection.query('DELETE FROM PROXYS WHERE SIP_idSIP=?',servicio.SIP_idSIP,function(err,result){
										if (err) return callback(err);

										logging.LoggingDate(query.sql);

										async.each(services.sip.proxys,function(p,callback){
											var queryInsert=connection.query('INSERT INTO PROXYS SET SIP_idSIP=?,IP=?,SELECTED=?',[servicio.SIP_idSIP,p.ip,p.selected],function(err,result){	
												if (err) return callback(err);

												logging.LoggingDate(queryInsert.sql);
												callback();
											});
										},function(error){
											callback();
										});
									});
								}
								else
									callback();
							},
							// Update Registrars
							function(callback){
								if (services != null && services.sip != null && services.sip.registrars != null){
									var query=connection.query('DELETE FROM REGISTRARS WHERE SIP_idSIP=?',servicio.SIP_idSIP,function(err,result){
										if (err) return callback(err);

										logging.LoggingDate(query.sql);

										async.each(services.sip.registrars,function(r,callback){
											var queryInsert=connection.query('INSERT INTO REGISTRARS SET SIP_idSIP=?,IP=?,SELECTED=?',[servicio.SIP_idSIP,r.ip,r.selected],function(err,result){	
												if (err) return callback(err);

												logging.LoggingDate(queryInsert.sql);
												callback();
											});
										},function(error){
											callback();
										});
									});
								}
								else
									callback();
							}
						], function(err){
							callback(err);
						});
					}
					else
						callback();
				},
				// Update WEB service
				function(callback){
					if (servicio.WEB_idWEB != null && services.web != null){
						var query=connection.query('UPDATE WEB SET ? WHERE idWEB=?',[services.web,servicio.WEB_idWEB],function(err, result){
							if (err) return callback(err);

							logging.LoggingDate(query.sql);
							callback();
						});
					}
					else
						callback();
				},
				// Update SNMP service
				function(callback){
					if (servicio.SNMP_idSNMP != null){
						async.parallel([
							// Update SNMP data
							function(callback){
								// Crear copia del objeto services.sip
								if (services != null && services.snmp != null){
									var snmp = JSON.parse(JSON.stringify(services.snmp));
									delete snmp.traps;
									var query=connection.query('UPDATE SNMP SET ? WHERE idSNMP=?',[snmp,servicio.SNMP_idSNMP],function(err, result){
										if (err) return callback(err);

										logging.LoggingDate(query.sql);
										callback();
									});
								}
								else
									callback();
							},
							// Select TRAPS
							function(callback){
								if (services != null && services.snmp != null && services.snmp.traps != null){
									var query=connection.query('DELETE FROM TRAPS WHERE SNMP_idSNMP=?',servicio.SNMP_idSNMP,function(err,result){
										if (err) return callback(err);

										logging.LoggingDate(query.sql);

										async.each (services.snmp.traps,function(t,callback){
											var queryInsert=connection.query('INSERT INTO TRAPS SET SNMP_idSNMP=?,IP=?',[servicio.SNMP_idSNMP,t],function(err,result){	
												if (err) return callback(err);

												logging.LoggingDate(queryInsert.sql);
												callback();
											});
										},function(err){
												callback();
											}
										);
									});
								}
								else
									callback();
							}
						], callback);
					}
					else
						callback();
				},
				// Update GRAB service
				function(callback){
					if (servicio.GRAB_idGRAB != null && services != null && services.grab != null){
						/** 20170517 AGL. Quito porque ya he dado de alta el campo en BD */
						// if(services.grab.hasOwnProperty("rtspb_ip"))
						// 	delete services.grab.rtspb_ip;
						var query=connection.query('UPDATE GRAB SET ? WHERE idGRAB=?',[services.grab,servicio.GRAB_idGRAB],function(err, result){
							if (err) return callback(err);

							logging.LoggingDate(query.sql);
							return callback();
						});
					}
					else
						callback();
				},
				// Update SINCR service
				function(callback){
					if (servicio.SINCR_idSINCR != null){
						if (services == null || services.sincr == null || services.sincr.servidores == null)
							callback();
						else{
							var query=connection.query('DELETE FROM SERVIDORESNTP WHERE SINCR_idSINCR=?',servicio.SINCR_idSINCR,function(err,result){
								if (err) return callback(err);

								logging.LoggingDate(query.sql);
								async.each(services.sincr.servidores,function(s,callback){
									var queryInsert=connection.query('INSERT INTO SERVIDORESNTP SET SINCR_idSINCR=?,IP=?,SELECTED=?',[servicio.SINCR_idSINCR,s.ip,s.selected],function(err,result){
										if (err) return callback(err);

										logging.LoggingDate(queryInsert.sql);
										callback();
									});
								},function(error){
									callback();
								});
							});
						}
					}
					else
						callback();
				}
			],callback);
		}
	], function (err){
			f(err);
		});
}

exports.insertServices= function insertServices(connection, services, callback){
	// CODIGO ASÍNCRONO
	async.parallel({
		// Insert SIP service (including proxys and registrars)
		SIP_idSIP: function(callback){
			async.waterfall([
				// Insert SIP data
				function(callback){
					// Crear copia del objeto services.sip
					if (services.sip != null){
						var sip = JSON.parse(JSON.stringify(services.sip));
						delete sip.proxys;
						delete sip.registrars;
						var query=connection.query('INSERT INTO SIP SET ?',sip,function(err, result){
							if (err) return callback(err);

							logging.LoggingDate(query.sql);
							callback(null, result.insertId);
						});
					}
					else{
						var query=connection.query('INSERT INTO SIP VALUES()',function(err, result){
							if (err) return callback(err);

							logging.LoggingDate(query.sql);
							callback(null, result.insertId);
						});
					}
				},
				// Insert Proxys
				function(sipId, callback){
					if (services.sip != null){
						async.each(services.sip.proxys,function(p,callback){
							var query=connection.query('INSERT INTO PROXYS SET SIP_idSIP=?,IP=?,SELECTED=?',[sipId,p.ip, p.selected],function(err,result){	
								if (err) return callback(err);

								logging.LoggingDate(query.sql);
								callback();
							});
						},function(error){
							callback(null,sipId);
						});
					}
					else
						callback(null,sipId);
				},
				// Insert Registrars
				function(sipId, callback){
					if (services.sip != null){
						async.each(services.sip.registrars,function(r,callback){
							var query=connection.query('INSERT INTO REGISTRARS SET SIP_idSIP=?,IP=?,SELECTED=?',[sipId,r.ip,r.selected],function(err,result){	
								if (err) return callback(err);

								logging.LoggingDate(query.sql);
								callback();
							});
						},function(error){
							callback(null, sipId);
						});
					}
					else
						callback(null,sipId);
				}
			], function(err, sipId){
				if (err)	return callback(err);

				callback(null, sipId);
			});
		},
		// Insert WEB service
		WEB_idWEB: function(callback){
			if (services.web != null){
				var query=connection.query('INSERT INTO WEB SET ?',services.web,function(err, result){
					if (err) return callback(err);

					logging.LoggingDate(query.sql);
					callback(null, result.insertId);
				});
			}
			else{
				var query=connection.query('INSERT INTO WEB VALUES()',function(err, result){
					if (err) return callback(err);

					logging.LoggingDate(query.sql);
					callback(null, result.insertId);
				});
			}
		},
		// Insert SNMP service
		SNMP_idSNMP: function(callback){
			async.waterfall([
				// Insert SNMP data
				function(callback){
					// Crear copia del objeto services.sip
					if (services.snmp != null){
						var snmp = JSON.parse(JSON.stringify(services.snmp));
						delete snmp.traps;
						var query=connection.query('INSERT INTO SNMP SET ?',snmp,function(err, result){
							if (err) return callback(err);

							logging.LoggingDate(query.sql);
							callback(null, result.insertId);
						});
					}
					else{
						var query=connection.query('INSERT INTO SNMP VALUES()',function(err, result){
							if (err) return callback(err);

							logging.LoggingDate(query.sql);
							callback(null, result.insertId);
						});
					}
				},
				// Insert TRAPS
				function(snmpId,callback){
					if (services.snmp != null){
						async.each(services.snmp.traps,function(t,callback){
							var query=connection.query('INSERT INTO TRAPS SET SNMP_idSNMP=?,IP=?',[snmpId,t],function(err,result){	
								if (err) return callback(err);

								logging.LoggingDate(query.sql);
								callback();
							});
						},function(error){
							callback(null, snmpId);
						})
					}
					else
						callback(null,snmpId);
				}
			], function(err, snmpId){
				if (err)	return callback(err);

				callback(null, snmpId);
			});
		},
		// Insert GRAB service
		GRAB_idGRAB: function(callback){
			if (services.grab != null){
				var query=connection.query('INSERT INTO GRAB SET ?',services.grab,function(err, result){
					if (err) return callback(err);

					logging.LoggingDate(query.sql);
					callback(null, result.insertId);
				});
			}
			else{
				var query=connection.query('INSERT INTO GRAB VALUES()',function(err, result){
					if (err) return callback(err);

					logging.LoggingDate(query.sql);
					callback(null, result.insertId);
				});
			}
		},
		// Insert SINCR service
		SINCR_idSINCR: function(callback){
			var query=connection.query('INSERT INTO SINCR VALUES()',function(err,result){
				if (err) return callback(err);

				logging.LoggingDate(query.sql);
				if (services.sincr != null){
					async.each(services.sincr.servidores,function(s,callback){
						var queryInsert=connection.query('INSERT INTO SERVIDORESNTP SET SINCR_idSINCR=?,IP=?,SELECTED=?',[result.insertId,s.ip,s.selected],function(err,result){	
							if (err) return callback(err);

							logging.LoggingDate(queryInsert.sql);
							callback();
						});
					},function(error){
						callback(null, result.insertId);
					});
				}
				else
					callback(null,result.insertId);
			});
		}
	},function (err, results){
		// Insert SERVICIO with service component ids (results = {sip:sipId, web:webId, snmp:snmpId, grab:grabId, sincr:sincrId})
		var query=connection.query('INSERT INTO SERVICIOS SET name=?,?',[services.name,results],function(err, result){
			if (err) return callback(err);

			logging.LoggingDate(query.sql);
			// Returns idServicios to insert it into CGW table
			callback(null, result.insertId);
		});
	});
}

exports.getGatewaysOfService = function getGatewaysOfService(service,f){
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

			// Get keys of services
			var query = connection.query('SELECT idCGW FROM CGW WHERE servicio=?', service, function(err, rows, fields) {
				connection.end();	
				logging.LoggingDate(query.sql);

				if (err || rows.length == 0){
					return f([]);
				}

				f(rows);
			});
		}
	});
}

