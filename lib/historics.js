var async = require('async');
var logging = require('./loggingDate.js');

/** AGL */
var gcfg = require('../configUlises.json');

/****************************/
/*	FUNCTION: getHistorics 	*/
/*  PARAMS: 				*/
/****************************/
exports.getHistorics = function getHistorics(f){
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

			var query = connection.query('SELECT H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia ORDER BY -FechaHora ' +
											'LIMIT 1000', function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}

			});
		}
	});
};

exports.getHistoricsEvents = function getHistoricsEvents(f){
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

			var query = connection.query('SELECT H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
								'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario ' +
								'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND I.LineaEventos=0 ORDER BY -FechaHora ' +
								'LIMIT 1000', function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}

			});
		}
	});
};

exports.getHistoricsAlarms = function getHistoricsAlarms(f){
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

			var query = connection.query('SELECT H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND I.LineaEventos=1 ORDER BY -FechaHora ' +
											'LIMIT 1000', function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}
			});
		}
	});
};

exports.postHistorics = function postHistorics(Incidencia,f){
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

			async.parallel({
				IdEmplaz: function(callback){
						var qEmplaz = '(SELECT e.name FROM emplazamiento e ' +
							'INNER JOIN cgw c ON EMPLAZAMIENTO_idEMPLAZAMIENTO = e.idEMPLAZAMIENTO ' +
							'WHERE c.name=\'' + Incidencia.IdHw + '\')';
						var q=connection.query(qEmplaz,function(err,rows,fields){
							logging.LoggingDate(q.sql);
							if (err)
								return callback(null);
							else if  (rows==null || rows.length == 0)
								return callback(null,null);

							callback(null,rows[0].name);
						});
				},
				inciden: function(callback){
						var qIncidencias = '(SELECT Grupo,Descripcion FROM incidencias i ' +
											'WHERE i.IdIncidencia=' + Incidencia.IdIncidencia + ')';
						var q=connection.query(qIncidencias,function(err,rows,fields){
							logging.LoggingDate(q.sql);
							if (err || rows== null || rows.length == 0){
								return callback(null);
							}

							callback(null,{Grupo:rows[0].Grupo, Descripcion:rows[0].Descripcion});
						});
				},

			},function(error,results){
				if (error){
					connection.end();	
					return logging.LoggingDate("Error in parallel postHistorics() function.");
				}

				Incidencia.IdEmplaz = results.IdEmplaz;
				
				if(typeof results.inciden == 'undefined') {
					results.inciden = new Object();
					results.inciden.Grupo = null;
					results.inciden.Descripcion = null;
				}
				Incidencia.TipoHw = results.inciden.Grupo;
				Incidencia.Descripcion = results.inciden.Descripcion + ' ' + Incidencia.Param + '.';
				Incidencia.FechaHora = new Date();
				delete Incidencia.Param;

				var query = connection.query('INSERT INTO historicoincidencias SET ?',Incidencia, function(err, result) {
					connection.end();	
					if (err){
						logging.LoggingDate(query.sql);
						return f(err ? err : 'NO_DATA');
					}

					logging.LoggingDate(query.sql);
					f({error: null, Incidencia: Incidencia});
				});
			});
		}
	});
};

exports.getHistoricsRange = function getHistoricsRange(start,howMany,f){
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

			var query = connection.query('SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											'FROM historicoincidencias h, Incidencias I WHERE h.IdIncidencia=I.IdIncidencia ORDER BY -FechaHora LIMIT ?,?',[parseInt(start),parseInt(howMany)], function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	logging.LoggingDate(query.sql);
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}

			});
		}
	});
};

exports.getHistoricsRangeEvents = function getHistoricsRangeEvents(start,howMany,f){
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

			var query = connection.query('SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
											'FROM historicoincidencias h, Incidencias I WHERE h.IdIncidencia=I.IdIncidencia AND I.LineaEventos= 0 ORDER BY -FechaHora LIMIT ?,?',
											[parseInt(start),parseInt(howMany)], function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	logging.LoggingDate(query.sql);
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}

			});
		}
	});
};

exports.getHistoricsRangeAlarms = function getHistoricsRangeAlarms(start,howMany,f){
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

			var query = connection.query('SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											'FROM historicoincidencias h, Incidencias I WHERE h.IdIncidencia=I.IdIncidencia AND I.LineaEventos=1 ORDER BY -FechaHora LIMIT ?,?',[parseInt(start),parseInt(howMany)], function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	logging.LoggingDate(query.sql);
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}
			});
		}
	});
};


exports.getHistoricsByDatetime = function getHistoricsByDatetime(startTime,endTime,start,howMany,f){
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

			var queryString = '';
			if (parseInt(start)!=0 || parseInt(howMany)!=0)
				queryString = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
										'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
										'FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.FechaHora>=\'' + startTime + '\' AND h.FechaHora<=\'' + endTime + '\'  ' +
										'ORDER BY -h.FechaHora ' + 'LIMIT ' + parseInt(start) + ',' + parseInt(howMany);
			else
				queryString = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
										'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
										'FROM historicoincidencias h ,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.FechaHora>=\'' + startTime + '\' AND h.FechaHora<=\'' + endTime + '\'  ' +
										'ORDER BY -h.FechaHora LIMIT 1000';

			var query = connection.query(queryString, function(err, rows, fields) {

				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	logging.LoggingDate(query.sql);
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}
			});
		}
	});
};

exports.getHistoricsByGroup = function getHistoricsByGroup(data,f){
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

			var strQuery = '';
			if (parseInt(data.start)!=0 || parseInt(data.howMany)!=0)
				strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.TipoHw=\'' + data.code + '\'' +
											' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
											' ORDER BY -h.FechaHora ' +
											'LIMIT ' + parseInt(data.start) + ',' + parseInt(data.howMany);
			else
				strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND TipoHw=\'' + data.code + '\'' +
											' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
											' ORDER BY -h.FechaHora LIMIT 1000';

			var query = connection.query(strQuery,function(err, rows, fields) {

				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	logging.LoggingDate(query.sql);
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }
				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();	
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}

			});
		}
	});
};

exports.getHistoricsByComponent = function getHistoricsByComponent(data,f){
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

			var strQuery = '';
			if (parseInt(data.start)!= 0 || parseInt(data.howMany)!= 0)
				strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											' FROM historicoincidencias h ,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdHw=\'' + data.code + '\'' +
											' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
											' ORDER BY -h.FechaHora ' +
											'LIMIT ' + parseInt(data.start) + ',' + parseInt(data.howMany);
			else
				strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Error as TipoAlarma ' +
											' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdHw=\'' + data.code + '\'' +
											' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
											' ORDER BY -h.FechaHora LIMIT 1000';

			var query = connection.query(strQuery, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	logging.LoggingDate(query.sql);
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}
			});
		}
	});
};

exports.getHistoricsByCode = function getHistoricsByCode(data,f){
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

			var strQuery = '';
			if (parseInt(data.start)!= 0 || parseInt(data.howMany)!= 0)
				strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
											' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdIncidencia=\'' + data.code + '\'' +
											' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
											' ORDER BY -h.FechaHora' +
											' LIMIT ' + parseInt(data.start) + ',' + parseInt(data.howMany);
			else
				strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
											'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
											' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdIncidencia=\'' + data.code + '\'' +
											' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
											' ORDER BY -h.FechaHora LIMIT 1000';

			var query = connection.query(strQuery, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
				// if (err || rows.length == 0){
				// 	logging.LoggingDate(query.sql);
				// 	connection.end();	
				// 	return f(err ? err : 'NO_DATA');
				// }

				// connection.end();	
				// logging.LoggingDate(query.sql);
				// f({error: err, howMany: rows.length, historics: rows});
				connection.end();
				if (err) {
					f(err);
				}
				else {
					logging.LoggingDate(query.sql);
					f({error: err, howMany: rows.length, historics: rows});
				}
			});
		}
	});
};

exports.getGroups = function getGroups(f){
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

			var query = connection.query('SELECT DISTINCT(TipoHw) FROM historicoincidencias', function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR. «TODO» */
				if (err || rows.length == 0){
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: err, groups: rows});
			});
		}
	});
};

exports.getComponents = function getComponents(f){
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

			var query = connection.query('SELECT DISTINCT(IdHw) FROM historicoincidencias', function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR «TODO» */
				if (err || rows.length == 0){
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: err, components: rows});
			});
		}
	});
};

exports.getCodes = function getCodes(f){
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

			var query = connection.query('SELECT IdIncidencia,Incidencia,Error FROM incidencias ORDER BY Incidencia', function(err, rows, fields) {
			
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR «TODO» */
				if (err || rows.length == 0){
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: err, codes: rows});
			});
		}
	});
};

exports.deepHistorics = function deepHistorics(days,f){
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
			
			var query = connection.query('DELETE FROM historicoincidencias WHERE FechaHora < NOW() - INTERVAL ? DAY', days, function(err, result) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR «TODO» */
				if (err){
					logging.LoggingDate(query.sql);
					connection.end();	
					return f(err ? err : 'NO_DATA');
				}

				connection.end();	
				logging.LoggingDate(query.sql);
				f({error: err, affectedRows: result.affectedRows});
			});
		}
	});
};

exports.getStatisticsRateByDatetime = function getStatisticsRateByDatetime(data,f){
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

			async.parallel({
				rate: function(callback){
						var queryString = '';
						queryString = 	'SELECT ' +
										'(SELECT COUNT(*) AS fallos ' +
										'FROM historicoincidencias WHERE FechaHora>=\'' + data.startTime + '\' AND FechaHora<=\'' + data.endTime + '\' ' +
										' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1))' + 
										'/' +
										'(SELECT COUNT(*) AS total ' +
										'FROM historicoincidencias WHERE FechaHora>=\'' + data.startTime + '\' AND FechaHora<=\'' + data.endTime + '\' )' +
										' * 100 AS rate';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							callback(null,rows[0].rate);
						});
					},
				mtbf:function(callback){
						var queryString = '';
						queryString = 	'SELECT COUNT(*) AS fallos ' +
										'FROM historicoincidencias WHERE FechaHora>=\'' + data.startTime + '\' AND FechaHora<=\'' + data.endTime + '\' ' +
										' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							var ini = new Date(data.startTime);
							var fin = new Date(data.endTime);
							var dif = fin.getTime() - ini.getTime();
							var dias = Math.floor(dif / (1000 * 60 * 60 * 24));

							callback(null,  (rows[0].fallos > 0) ? (dias/rows[0].fallos) : 0);
						});
					},
				mut:function(callback){
						var queryString = '';
						queryString = 	'SELECT SUM(TiempoEnFallo) AS tiempo ' +
										'FROM estadisticas WHERE TimeStamp>=\'' + data.startTime + '\' AND TimeStamp<=\'' + data.endTime + '\' ' +
										' AND IdEvento IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							var ini = new Date(data.startTime);
							var fin = new Date(data.endTime);
							var dif = fin.getTime() - ini.getTime();
							var seg = Math.floor(dif / (1000));

							callback(null, ((seg - rows[0].tiempo)/seg)*100);
						});
					}
				},
				function(error,results){
						connection.end();	
						f({error: err, rate: results.rate, mtbf: results.mtbf, mut: results.mut});
					}
			);
		}
	});
};

exports.getStatisticsRateByIdHw = function getStatisticsRateByIdHw(data,f){
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
			async.parallel({
				rate: function(callback){
						var queryString = '';
						queryString = 	'SELECT ' +
										'(SELECT COUNT(*) AS fallos ' +
										'FROM historicoincidencias WHERE IdHw IN ('+ data.code + ')' +
										' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ' +
										' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1))' + 
										'/' +
										'(SELECT COUNT(*) AS total ' +
										'FROM historicoincidencias WHERE IdHw IN ('+ data.code + ')' +
										' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' )' +
										' * 100 AS rate';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							callback(null,rows[0].rate);
						});
					},
				mtbf:function(callback){
						var queryString = '';
						queryString = 	'SELECT COUNT(*) AS fallos ' +
										'FROM historicoincidencias WHERE IdHw IN ('+ data.code + ')' +
										' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ' +
										' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							var ini = new Date(data.startDate);
							var fin = new Date(data.endDate);
							var dif = fin.getTime() - ini.getTime();
							var dias = Math.floor(dif / (1000 * 60 * 60 * 24));

							callback(null,  (rows[0].fallos > 0) ? (dias/rows[0].fallos) : 0);
						});
					},
				mut:function(callback){
						var queryString = '';
						queryString = 	'SELECT SUM(TiempoEnFallo) AS tiempo ' +
										'FROM estadisticas WHERE IdHw IN ('+ data.code + ')' +
										' AND TimeStamp>=\'' + data.startDate + '\' AND TimeStamp<=\'' + data.endDate + '\' ' +
										' AND IdEvento IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							var ini = new Date(data.startDate);
							var fin = new Date(data.endDate);
							var dif = fin.getTime() - ini.getTime();
							var seg = Math.floor(dif / (1000));

							callback(null, ((seg - rows[0].tiempo)/seg)*100);
						});
					}
				},
				function(error,results){
						connection.end();	
						f({error: err, rate: results.rate, mtbf: results.mtbf, mut: results.mut});
					}
			);
		}
	});
};

exports.getStatisticsRateByIdEvent = function getStatisticsRateByIdEvent(data,f){
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

			async.parallel({
				rate: function(callback){
						var queryString = '';
						queryString = 	'SELECT ' +
										'(SELECT COUNT(*) AS fallos ' +
										'FROM historicoincidencias WHERE IdIncidencia=\'' + data.code + '\'' +
										' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' )' +
										'/' +
										'(SELECT COUNT(*) AS total ' +
										'FROM historicoincidencias WHERE' +
										' FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ' +
										' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1))' + 
										' * 100 AS rate';


						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							callback(null,rows[0].rate);
						});
					},
				mtbf:function(callback){
						var queryString = '';
						queryString = 	'SELECT COUNT(*) AS fallos ' +
										'FROM historicoincidencias WHERE IdIncidencia=\'' + data.code + '\'' +
										' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							var ini = new Date(data.startDate);
							var fin = new Date(data.endDate);
							var dif = fin.getTime() - ini.getTime();
							var dias = Math.floor(dif / (1000 * 60 * 60 * 24));

							callback(null,  (rows[0].fallos > 0) ? (dias/rows[0].fallos) : 0);
						});
					},
				mut:function(callback){
						var queryString = '';
						queryString = 	'SELECT SUM(TiempoEnFallo) AS tiempo ' +
										'FROM estadisticas WHERE IdEvento=' + data.code  +
										' AND TimeStamp>=\'' + data.startDate + '\' AND TimeStamp<=\'' + data.endDate + '\' ';

						var query = connection.query(queryString, function(err, rows, fields) {
				/** 20170508. Encontrar '0' registros no se debe considerar ERROR */
							if (err || rows.length == 0){
								logging.LoggingDate(query.sql);
								return callback(err);
							}

							var ini = new Date(data.startDate);
							var fin = new Date(data.endDate);
							var dif = fin.getTime() - ini.getTime();
							var seg = Math.floor(dif / (1000));

							callback(null, ((seg - rows[0].tiempo)/seg)*100);
						});
					}
				},
				function(error,results){
						connection.end();	
						f({error: err, rate: results.rate, mtbf: results.mtbf, mut: results.mut});
					}
			);
		}
	});
};