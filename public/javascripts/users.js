/******************************************************************************************************/
/****** Module: users.js												*******************************/
/****** Description: Módulo de soporte a la gestion de usuarios			*******************************/
/******************************************************************************************************/
//var link_enlaces = [];
var gatewaysFromOperator=[];
/** 20170509. AGL Gestor 'Aplicar cambios' */
var usersModified = false;

var DelUsuario = function(){
	if ($('#IdOperador').val()==$('#loggedUser').text()){
		alertify.alert('Ulises G 5000 R',"No es posible eliminar el usuario con el que se está logeado.");
		alertify.error("No es posible eliminar el usuario con el que se está logeado.");
	}
	else{
		alertify.confirm('Ulises G 5000 R', "¿Eliminar el usuario \"" + $('#IdOperador').val() + "\"?", 
			function(){ 
				$.ajax({type: 'DELETE', 
					url: '/users/' + $('#IdOperador').val(), 
					//data: JSON.stringify( { "name": $('#IdOperador').val() } ),
					success: function(data){
								if (data.error === 0) {
									alertify.error('El usuario \"' + data.data + '\" no existe.');
								}
								else {
									GenerateHistoricEvent(ID_HW,REMOVE_USER,$('#IdOperador').val(),$('#loggedUser').text());
									alertify.success('Usuario \"' + data.data + '\" eliminado.');
									GetUsuarios();
									/** 20170509. AGL Gestor 'Aplicar cambios' */
									usersModified = true;								
								}
							},
					error: function(data){
									alertify.error('El usuario \"' + data.data + '\" no existe.');
							}
		       		});

				//alertify.success('Ok'); 
			},
			 function(){ alertify.error('Cancelado');}
	        );

	}
};

/****************/
/*	PUT Method  */
/****************/
var PutUser = function(){

	var perfil=GetPerfil();
	if ($('#IdOperador').val()== ''){
		alertify.alert('Ulises G 5000 R',"Identificador de usuario no válido.");
		alertify.error("Identificador de usuario no válido.");
		return;
	}
	if ($('#ClaveUser').val()== ''){
		alertify.alert('Ulises G 5000 R',"Clave de usuario no válida.");
		alertify.error("Clave de usuario no válida.");
		return;
	}
	if (perfil == 0){
		alertify.alert('Ulises G 5000 R',"Debe seleccionar un nivel de acceso para el usuario.");
		alertify.error("Debe seleccionar un nivel de acceso para el usuario.");
		return;
	}

	var gateways=[];
	/* AGL *****************
	var permisoVisualizacionGatewayLocal = perfil & 128;
	var permisoAdministracionGatewayLocal = perfil & 256;
	if ((permisoVisualizacionGatewayLocal == 128) || (permisoAdministracionGatewayLocal==256)){
		// Usuarios con perfil de pasarelas asignadas.		
		$('.cbGtw').each(function( index ) {
			if ($(this)[0].checked)
  				gateways.push($(this).data('idgtw'));
		});
	}
	*********************/
	
	$.ajax({type: 'PUT', 
			dataType: 'json', 
			contentType:'application/json',
			url: '/users/user', 
			data: JSON.stringify( {user:
									{ 	"idOPERADORES": $('#AddFormUser').data('idOperador'),
										"name": $('#IdOperador').val(), 
										"clave": btoa($("#ClaveUser").val()),
										"perfil": perfil 
									},
									gateways:gateways
							}),
			success: function(data){
						GenerateHistoricEvent(ID_HW,MODIFY_USER,$('#IdOperador').val(),$('#loggedUser').text());
						alertify.success('Usuario \"' + $('#IdOperador').val() + '\" actualizado.');
						GetUsuarios();
						/** 20170509. AGL Gestor 'Aplicar cambios' */
						usersModified = true;								
					},
			error: function(data){
						alertify.error('El usuario \"' + $('#IdOperador').val() + '\" no existe.');
					}
	});
};

/*****************/
/*	POST Method  */
/*****************/
var PostUser = function (){
	if ($('#IdOperador').val()== ''){
		alertify.alert('Ulises G 5000 R',"Identificador de usuario no válido.");
		alertify.error("Identificador de usuario no válido.");
		return;
	}
	if ($('#ClaveUser').val()== ''){
		alertify.alert('Ulises G 5000 R',"Clave de usuario no válida.");
		alertify.error("Clave de usuario no válida.");
		return;
	}
	var perfil=GetPerfil();
	if (perfil == 0){
		alertify.alert('Ulises G 5000 R',"Debe seleccionar un nivel de acceso para el usuario.");
		alertify.error("Debe seleccionar un nivel de acceso para el usuario.");
		return;
	}

	var gateways=[];
	
	/** AGL **********************
	var permisoVisualizacionGatewayLocal = perfil & 128;
	var permisoAdministracionGatewayLocal = perfil & 256;
	if ((permisoVisualizacionGatewayLocal == 128) || (permisoAdministracionGatewayLocal==256)){
		// Usuarios con perfil de pasarelas asignadas.		
		$('.cbGtw').each(function( index ) {
			if ($(this)[0].checked)
  				gateways.push($(this).data('idgtw'));
		});
	}
	*****************************/

	$.ajax({type: 'POST', 
			dataType: 'json', 
			contentType:'application/json',
			url: '/users/user', 
			data: JSON.stringify( {
									user: { "name": $('#IdOperador').val(), 
										"clave": window.btoa($("#ClaveUser").val()),
										"perfil": perfil 
										},
									gateways:gateways
								}
								),
		success: function(data){
					if (data.error === null) {
						GenerateHistoricEvent(ID_HW,ADD_USER,$('#IdOperador').val(),$('#loggedUser').text());
						alertify.success('El usuario \"' + $('#IdOperador').val() + '\" ha sido creado.');
						GetUsuarios();
						/** 20170509. AGL Gestor 'Aplicar cambios' */
						usersModified = true;								
					}
					else if (data.error == "ER_DUP_ENTRY")
						alertify.error('El usuario \"' + $('#IdOperador').val() + '\" ya existe.');
					else 
						alertify.error('Error: ' + data.error);
		},
		error: function(data){
						alertify.error('El usuario \"' + $('#IdOperador').val() + '\" no existe.');
		}
	});
};

var GetUsuario = function (ind,valor){
	/** AGL */
	var divOperadorShortWidth = {width: '535px'};
	var divOperadorLongWidth = {width: '535px'};
	var divDatoUsuarioWidth = {width: '350px'};
	
	if ($('#AddFormUser').is(':visible')){
				$('#DivOperador').animate({width: '535px'});
			}

	$('#DivOperador').animate({width: '555px'});
	$("#FormOperador").show();
	$('#AddFormUser').show();

	if (ind >= 0){
		$(':checkbox.rol').prop('checked',false);
		$.ajax({type: 'GET', 
				url: '/users/IdOperador,IdSistema,Clave', 
				data: valor,	//link_enlaces[ind].valor,
				success: function(usuario){
					$("#FormOperador").show();
					$("#IdOperador").val(usuario.name);
					$("#ClaveUser").val(window.atob(usuario.clave));
					$('#AddFormUser').data('idOperador',usuario.idOPERADORES);

					var valor = usuario.perfil;
					for (var i=0;i<16;i++){
						if ((i!=2) && (i!=5)){		// el perfil 2 no existe, y el 5 es ingenieria					
							if (Boolean(valor & 1)) {
								$('#' + (Math.pow(2,i))).prop('checked',true);
								$('#' + (Math.pow(2,i))).prop('disabled', false);
							}							
							//else
								//$('#' + (Math.pow(2,i))).prop('disabled', true);
						}
						valor >>>= 1;
					}

					/** AGL ***************************************
					GetGatewaysToOp(usuario.idOPERADORES,function(){
						GetSitesToOp();
					});
					*************************************/	
					//$('#' + usuario.perfil).prop('checked',true);

/** AGL... *************************************/					
					$('#DivOperador').animate({width: '1000px'});
					$('#DatosUsuario').animate({width: '410px'});
					$('#GatewayToOp').hide();
					$('#IdOperador').prop( "disabled", true );
/*
					if ((usuario.perfil & 128) == 128 || (usuario.perfil & 256) == 256) {
						$('#DivOperador').animate({width: '1250px'});
						$('#DatosUsuario').animate({width: '650px'},function(){
							$('#GatewayToOp').show();
						});
					}
					else{
						$('#DivOperador').animate({width: '900px'});
						$('#DatosUsuario').animate({width: '290px'},function(){
							$('#GatewayToOp').hide();
						});
					}
*/

					translateWord('Update',function(result){
						$('#UpdateUserButton').text(result)
												.attr('onclick','PutUser();AddGatewaysFromActiveToListOfGateways()');
					});
				}
		});
	}
	else{
		$('#GatewayToOp').hide();
		
		/** AGL **********************************	
		GetGatewaysToOp(-1,function(){
			GetSitesToOp();
		});
		****************************************/

		for (var i=0;i<16;i++){
		/*La posicion 3 es el reconocimiento de alarmas que ya no se usa pero se mantienen  la posición del resto por compatibilidad con otras aplicaciones*/
		/*Con la 5 pasa lo mismo, era el perfil ingenieria*/
			if ((i!=2) && (i!=5)) {
				var valor = Math.pow(2,i);
				$('#' + valor).prop('disabled', false);
			}
		}

		$('#FormOperador').show();
		$('#DivOperador').animate({width: '1000px'});
		/** AGL */
		$('#DatosUsuario').animate({width: '410px'});
		$('#IdOperador').prop( "disabled", false );
		/*****************/
		translateWord('Add',function(result){
			$('#UpdateUserButton').text(result)
								.attr('onclick','PostUser();AddGatewaysFromActiveToListOfGateways()');
		});
		$('#IdOperador').val('');
		$('#ClaveUser').val('');
		$('#LbPerfil option[value="0"]').prop('selected',true);
		$('#LbPerfil input').prop('checked',false);
	}
};

var GetUsuarios = function() {

	if ((($('#BodyRedan').data('perfil') & 16) != 16) && (($('#BodyRedan').data('perfil') & 64) != 64)){
		alertify.error('No tiene asignados permisos para la gestión de usuarios.');
		return;
	}

	$('#DivOperador').animate({width: '535px'});

	$("#FormOperador").show();
	translateWord('Update',function(result){
		$('#UpdateUserButton').text(result)
								.attr('onclick','PutUser();AddGatewaysFromActiveToListOfGateways()');
	});

	$.ajax({type: 'GET', 
			url: '/users'})
		.done(function(data){
			$("#listUsers").empty();
			//link_enlaces.splice(0,link_enlaces.length);
			$.each(data.users, function(index, value){
				//link_enlaces.push({indice: index, valor: value});
				var item = $("<li><a onclick='GetUsuario(" + index + "," + JSON.stringify(value) + ")'>" + value.name + "</li>");
				item.appendTo($("#listUsers"));
			// $('#Add').attr("onclick","GetUsuario(-1)");
	   });
	});
};

var GetPerfil = function(){
	var valor=0;
	for (var i=0;i<16;i++){
		/*La posicion 3 es el reconocimiento de alarmas que ya no se usa pero se mantienen  la posición del resto por compatibilidad con otras aplicaciones*/
		/*Con la 5 pasa lo mismo, era el perfil ingenieria*/
		if ((i!=2) && (i!=5)) {
			if ($('#' + (Math.pow(2,i))).prop('checked'))
				valor+=Math.pow(2,i);
		}
	}

	return valor;
};

var GetSitesToOp = function(){
    /** AGL ********************************
	$.ajax({type: 'GET', 
			url: '/sites'})
		.done(function(data){
			$("#listSitesToOp").empty(); 
			
			var configAnterior="";
			var primeraVez= 1;
			var texto="<li> <table>"; 

			$.each(data.data, function(index, value){
				if (value.idEMPLAZAMIENTO != 1)
				{
					if (configAnterior != value.nameCfg)
					{
						if (configAnterior!="")
						{ 
							texto += "</table> </li> <li> <table>";
						}
						else
						{
							if (primeraVez==1)
								primeraVez=2;
						}
						configAnterior= value.nameCfg;						
						texto += "<tr><td>" + "<div style='color:black; font-size: 10px; margin-right: 0'>[" + value.nameCfg + "]</div>" + "</td></tr>" ;
						texto += "<tr>" +
									"<td style='width:90%'><a onclick='GetGtwToSite(" + value.idEMPLAZAMIENTO + "," + JSON.stringify(value.name) + ",true)'>" + value.name + "</a></td>" +									
								"</tr>" +
								"<tr><td>"+
								'<ul class="gtwList" id="gtw-site-' + value.idEMPLAZAMIENTO + '" style="display:none"></ul>'+
								"</td></tr>";								
					}
					else
					{
						texto += "<tr>" +
									"<td style='width:90%'><a onclick='GetGtwToSite(" + value.idEMPLAZAMIENTO + "," + JSON.stringify(value.name) + ",true)'>" + value.name + "</a></td>" +
								"</tr>" +
								"<tr><td>"+
								'<ul class="gtwList" id="gtw-site-' + value.idEMPLAZAMIENTO + '" style="display:none"></ul>'+
								"</td></tr>";			
					}
				}
	   });
	   texto += "</table>" + "</li>";
	   var item = $(texto);
	   item.appendTo($("#listSitesToOp"));
	});
	***************************************/
	console.log("Llamando a GetSitesToOp");
};


var GetGtwToSite = function (id,name,showMe){
/** AGL ***********************
	if (showMe){
		var lista='#gtw-site-' + id;
		if ($(lista).is(':visible')){
			$(lista).empty();
			$(lista).hide();
			return;
		}
	}

	$.ajax({type: 'GET', 
		 		url: '/sites/' + id + '/gateways', 
		 		success: function(data){
					// Mostrar sus gateways
					var lista='#gtw-site-' + id;
					$(lista).empty();

		 			var visible = showMe;
		 			if (data.data != 'NO_DATA'){
						$.each(data.data, function(index, value){
							var gtwData = JSON.stringify({cgw:value.idCGW,site:id,usr:$('#AddFormUser').data('idOperador')});
							var checked = gatewaysFromOperator.indexOf(value.idCGW) >= 0;
							visible |= checked;
							var item = $('<li data-texto="' + value.idCGW + '"> ' + 
											'<table><tr>' +
												'<td style="width:90%"><a style="display:block; color:#ff8c1a">' + value.name + '</a></td>' +
												'<td style="width:10%"><input class="cbGtw" type="checkbox" align="right" data-idgtw=' + gtwData + (checked ? ' checked' : '') +'></td>' + 
											'</tr></table>' +
										'</li>');
							item.appendTo($(lista));
							if (visible)
								$(lista).show();
						});
					}
			 	}
	});	
	*********************/
	console.log("Llamando a GetGwToSite");
};


var CheckEveryGateway = function(sender,list){
    /** AGL ****************************
	if ($('#' + sender).prop ('checked'))
		$('#'+list + ' input:checkbox').prop ('checked',true);
	else
		$('#'+list + ' input:checkbox').prop ('checked',false);
	****************/
	console.log("Llamando a CheckEveryGateway");
};

var ShowGateways = function(){
	/** AGL
	var perfil = GetPerfil();
	var permisoVisualizacion = perfil & 128;
	var permisoAdministracion = perfil & 256;
	
	if ((permisoVisualizacion== 128) || (permisoAdministracion== 256)){
		$('#DivOperador').animate({width: '1250px'});
		$('#DatosUsuario').animate({width: '650px'},function(){
			$('#GatewayToOp').show();
		});
	}
	else{
		$('#DivOperador').animate({width: '900px'});
		$('#DatosUsuario').animate({width: '290px'},function(){
			$('#GatewayToOp').hide();
		});
	}
	*******************************/
	console.log("Llamando a ShowGateways");
	
	//Habilitar o deshabilitar perfiles para que no se pueda asignar mas de uno a un usuario
	// /*for (var i=0;i<16;i++){
		// //La posicion 3 es el reconocimiento de alarmas que ya no se usa pero se mantienen  la posición del resto por compatibilidad con otras aplicaciones
		// //Con la 5 pasa lo mismo, era el perfil ingenieria
		// if ((i!=2) && (i!=5)) {
			// var valor = Math.pow(2,i);
			// if (perfil != 0){
				// if ($('#' + valor).prop('checked')){
					// $('#' + valor).prop('disabled', false);
				// }
				// else				
				// {
					// $('#' + valor).prop('disabled', true);
				// }
			// }
			// else{
				// $('#' + valor).prop('disabled', false);
			// }
		
		// }
	// }*/
};

var GetGatewaysToOp = function(idOperador,f){
/** AGL *************************
	gatewaysFromOperator=[];

	$.ajax({type: 'GET', 
			url: '/gateways/operator/' + idOperador})
		.done(function(data){
			if (data != null && data.length > 0){
				$.each(data,function(index,value){
					gatewaysFromOperator.push(value.cgw_idCGW);
				});
			}

			if (f != null)
				f();
		});
	************************/
	console.log("Llamando a GetGatewaysToOp");
};

/** AGL */
var OperationExt=function(elem, checkVis) {
	console.log("Llamando a OperationExt " + $(elem).prop("checked").toString() + " " + checkVis.toString());
	if (checkVis==true) {
		if ($(elem).prop("checked")) {
			$('#1').prop("checked", true);
		}
	}
};



