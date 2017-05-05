var async=require('async');
var logging = require('./loggingDate.js');

/** AGL */
var gcfg = require('../configUlises.json');

/****************************/
/*	FUNCTION: getTablesBss 	*/
/*  PARAMS: 				*/
/****************************/
exports.getTablesBss = function getTablesBss(req, res){
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
		
			var consulta='SELECT * FROM tabla_bss';

			var query = connection.query(consulta, function(err, rows, fields) {
				logging.LoggingDate(query.sql);
				connection.end();	

			    if (err == null && rows != null && rows.length > 0){
		    		logging.LoggingDate(JSON.stringify(rows));
					res.json({error:null,tables: rows});
			    }
			    else if (err == null){
					res.json({error:null,tables: null});
			    }
			    else{
			    	logging.loggingError(err.code);
			    	res.json({error:err,tables: null});
			    }
			});
		}
	});
};

/****************************/
/*	FUNCTION: getTableBss 	*/
/*  PARAMS: 				*/
/****************************/
exports.getTableBss = function(idTable,f){
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
		
			var query = connection.query('SELECT tb.*,vt.* FROM tabla_bss tb ' +
											'INNER JOIN valores_tabla vt ON vt.tabla_bss_idtabla_bss = tb.idtabla_bss ' +
											'WHERE idtabla_bss=? ORDER BY valor_prop',idTable, function(err, rows, fields) {
				logging.LoggingDate(query.sql);
				connection.end();	

			    if (err == null && rows != null && rows.length > 0){
		    		logging.LoggingDate(JSON.stringify(rows));
		    		if (f != null)
						f({error:null,tables: rows});
			    }
			    else if (err == null){
					f({error:null,tables: null});
			    }
			    else{
			    	logging.loggingError(err.code);
			    	f({error:err,tables: null});
			    }
			});
		}
	});
};

/****************************/
/*	FUNCTION: postTableBss 	*/
/*  PARAMS: 				*/
/****************************/
exports.postTableBss = function(table,f){
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
		
			var consulta = "SELECT COUNT(*) AS cuantos FROM tabla_bss";
			var query = connection.query(consulta,function(err,rows){
				if (err == null){
					if (rows != null && rows.length > 0 && rows[0].cuantos < 8){
						// Se permiten hasta un máximo de 8 tablas
						consulta="INSERT INTO tabla_bss SET ?";

						var tableValues = table.TableValues;
						delete table.TableValues;

						query = connection.query(consulta,table, function(err, result) {
							logging.LoggingDate(query.sql);
							// connection.end();	

						    if (err == null){
					    		logging.LoggingDate(JSON.stringify(table));
					    		var tableId = result.insertId;
					    		var cuantos=0;

					    		// Insertar los valores de la tabla
					    		// 
								async.each(tableValues,
									function(p,callback){
										query=connection.query('INSERT INTO valores_tabla SET ?',
														{tabla_bss_idtabla_bss:tableId,valor_prop:cuantos++,valor_rssi:p},function(err,result){
												callback(err);
										});
									},
									function(err){
										connection.end();
										f({error:null,idTable: tableId});
									}
								);
						    }
						    else{
						    	connection.end();
						    	logging.loggingError(err.code);
						    	f({error:err,idTable: null});
						    }
						});
					}
					else{
						logging.loggingError('Número máximo de registros (8) en tabla_bss');
						connection.end();	
						f({error:null,idTable:null});
					}
				}
				else{
					connection.end();	
			    	logging.loggingError(err.code);
			    	f({error:err,idTable: null});
				}
			});
		}
	});
};

/****************************/
/*	FUNCTION: putTableBss 	*/
/*  PARAMS: 				*/
/****************************/
exports.putTableBss = function(table,f){
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
		
			var tableValues = table.TableValues;

			var query = connection.query("UPDATE tabla_bss SET name=?,description=?,UsuarioModificacion=?,FechaModificacion=NOW() WHERE idtabla_bss=?",
											[table.name,table.description,table.UsuarioModificacion,table.idtabla_bss], function(err, result) {
				logging.LoggingDate(query.sql);
				
			    if (err == null){
		    		logging.LoggingDate(JSON.stringify(table));
		    		var cuantos=0;

		    		// Insertar los valores de la tabla
		    		// 
					async.each(tableValues,
						function(p,callback){
							var dmlString='UPDATE valores_tabla SET valor_rssi=' + p +
											' WHERE tabla_bss_idtabla_bss=' + table.idtabla_bss + 
											' AND valor_prop=' + cuantos++;

							query=connection.query(dmlString,function(err,result){
									callback(err);
							});
						},
						function(err){
							connection.end();
							f({error:null,idTable: table.idtabla_bss});
						}
					);
			    }
			    else{
					connection.end();	
			    	logging.loggingError(err.code);
			    	f({error:err,idTable: null});
			    }
			});
		}
	});
};

/****************************/
/*	FUNCTION: deleteTableBss 	*/
/*  PARAMS: 				*/
/****************************/
exports.deleteTableBss = function (idTable,f){
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
		
			var query = connection.query('SELECT t.name as TableName, r.name as ResourceName, c.name as CgwName, site.name as SiteName,cf.name as CfgName FROM tabla_bss T ' +
											'INNER JOIN tabla_bss_recurso tbr ON tbr.tabla_bss_idtabla_bss = t.idtabla_bss ' +
    										'INNER JOIN recurso r ON r.idRECURSO = tbr.recurso_idRECURSO ' +
    										'INNER JOIN pos p ON p.idPOS = r.POS_idPOS ' +
    										'INNER JOIN slaves s ON s.idSLAVES = p.SLAVES_idSLAVES ' +
    										'INNER JOIN hardware h ON h.SLAVES_idSLAVES = s.idSLAVES ' +
    										'INNER JOIN cgw c ON c.idCGW = h.CGW_idCGW ' +
    										'INNER JOIN emplazamiento site ON site.idEMPLAZAMIENTO = c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
    										'INNER JOIN cfg cf ON cf.idCFG = site.CFG_idCFG ' +
    										'WHERE t.idtabla_bss=?',idTable, function(err, rows, fields) {
				logging.LoggingDate(query.sql);

			    if (err == null && rows != null && rows.length > 0){
					connection.end();	
		    		logging.LoggingDate(JSON.stringify(rows));
					f({error:'CANT_DELETE',TableName:rows[0].TableName, ResourceName:rows[0].ResourceName, CgwName:rows[0].CgwName, SiteName:rows[0].SiteName, CfgName:rows[0].CfgName});
			    }
			    else if (err == null){
			    	query=connection.query('DELETE FROM tabla_bss WHERE idtabla_bss=?',idTable,function(err,result){
						connection.end();	
						f({error:err,tables: null});
			    	});
			    }
			    else{
					connection.end();	
			    	logging.loggingError(err.code);
			    	f({error:err,tables: null});
			    }
			});
		}
	});
};