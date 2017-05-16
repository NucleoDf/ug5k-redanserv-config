
/**************************************************************************************************************/
/****** Module: configurations.js												*******************************/
/****** Description: Módulo de soporte a la gestion de configuraciones			*******************************/
/**************************************************************************************************************/

var blockDrag = false;

var GetConfigurations = function(f) {
	var cfgString = '';
	translateWord('Configurations',function(result){
		$('#TitleH3').text(result);	
	});

	translateWord('Configuration',function(result){
		cfgString = result;	
	});

	$('#FormConfiguration').show();
	$.ajax({type: 'GET', 
			url: '/configurations', 
			success: function(data){
					$("#listConfigurations").empty();
					$('#CBFreeGateways').empty();
					/*translateWord('AliveGateways',function(result){
						$('#CBFreeGateways').append($('<option>',{
							text: result,
							value: 0
						}));	
					})*/

					$.each(data.result, function(index, value){
						var item = $('<li>' + 
							'<a data-cfg=' + value.idCFG + ' ondrop="dropSiteToCfg(event)" ondragover="getOverDropC(event)" style="display:block" onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(value) + ')})\'>' + value.name + '</a>' +
								'<ul class="gtwList" id="cfg-' + value.name + '" style="display:none"></ul>' + 
								'</li>');
						if (value.activa)
							item.addClass('active');
						item.appendTo($("#listConfigurations"));		

						// Preparar la lista de configuraciones para filtrar las pasarelas 
						// en la asignación de pasarelas a una configuración			
						$('#CBFreeGateways').append($('<option>',{
							text: cfgString + ' ' + value.name,
							value: value.idCFG
						}));	
					});
					$('#Add').attr("onclick","GetConfiguration(-1)");
					if (f != null)
						f();
				}
	});
};

var GetConfiguration = function(cfg){
	if (cfg != '-1'){
		$.ajax({
			type: 'GET',
			url: '/configurations/' + cfg,
			success: function(cfg){
				if (cfg.result != null && cfg.result.length > 0){
					$('#DivConfigurations').data('idCFG',cfg.result[0].idCFG);
					$('#DivConfigurations').animate({width: '1015px'});

					$("#AddFormConfiguration").show();
					$('#tableTools').show();
					$('#BtnActivate').show();

					$('#Component').text(cfg.result.name);
					$('#name').val(cfg.result.name);
					$('#activa').prop('checked',cfg.result.activa);

					$('#desc').val(cfg.result.description);
					$('#ts_activa').val(cfg.result.ts_activa != null ?  (cfg.result.ts_activa + ' UTC') : '');
					$('#idCFG').val(cfg.result.idCFG),

					translateWord('LoadConfig',function(result){
						$('#BtnActivate').text(result);
						$('#BtnActivate').attr("onclick","ActiveCfg()");

						GetGatewaysBelongConfiguration(true,cfg.result.idCFG);
					});
					
				}
			}
		});
	}
	else{
		translateWord('Configurations',function(result){
			$('#TitleH3').text(result);	
		});

		$('#AssignatedGatewaysDiv').hide();
		$('#AddFormsite').hide();
		$('#DivConfigurations').animate({width: '1130px'});
		$("#AddFormConfiguration").show();
		$('#tableTools').hide();

		translateWord('Add',function(result){
			$('#BtnActivate').text(result);
		});
		$('#BtnActivate').show();
		$('#BtnActivate').attr("onclick","PostConfiguration()");

		$('#FormConfiguration').show();
		$('#name').val('');
		$('#activa').prop('checked',false);
		$('#desc').val('');
		$('#ts_activa').val('');
	}
};

var ShowCfg = function(cfg){
	translateWord('Configurations',function(result){
		$('#TitleH3').text(result + ': ' + cfg.name);	
	});

	$('#DivConfigurations').data('idCFG',cfg.idCFG);
	$('#DivConfigurations').data('cfgJson',cfg);
	$('#DivConfigurations').animate({width: '1150px'});
 
	$('#Component').text(cfg.name);
	$('#name').val(cfg.name);
	$('#AddFormsite').fadeOut(500,function(){
		$("#AddFormConfiguration").show();
		$('#tableTools').show();
		if (cfg.activa==1)
			$('#BtnActivate').hide();
		else
			$('#BtnActivate').show();
			
		translateWord('LoadConfig',function(result){
			$('#BtnActivate').text(result);
		});
		$('#BtnActivate').attr("onclick","ActiveCfg()");
	});
	
	$('#activa').prop('checked',cfg.activa);
	$('#desc').val(cfg.description);
	$('#ts_activa').val(cfg.ts_activa != null ?  (cfg.ts_activa + ' UTC') : '');
	$('#idCFG').val(cfg.idCFG);

	translateWord('GatewaysInCfg',function(result){
		$('#LblGatewaysInCfg').text(result + ' ' + cfg.name);	
	});
	

	// Mostrar sus gateways
	var lista='#cfg-' + cfg.name;
	$('.gtwList').hide();
	$(lista).empty();

	$.ajax({type: 'GET', 
		 		url: '/configurations/' + cfg.name, 
		 		success: function(data){
		 			if (data != 'NO_DATA'){
		 				translateWord('LoadConfig',function(result){
							$('#BtnActivate').text(result);
						});
						var idCFGCopy='';
		 				if (data != 'Configuration not found.'){
							$('#CancelGtwButton').attr('onclick', 'ShowSite(\'' + data.result[0].nameSite + '\',\'' + data.result[0].idEMPLAZAMIENTO + '\')');
							/*$('#CancelGtwButton').click(function(nameSite, idSite) {
								ShowSite(nameSite, idSite);
							});*/
							$.each(data.result, function(index, value){
								var item = $('<li data-texto="' + value.idEMPLAZAMIENTO + '"  >' + 
												'<a draggable="false" ondragstart="dragGatewayToSite(event)" ondrop="dropGatewayToSite(event)" ondragover="getOverDropC(event)" style="display:block; color:#b70028" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.idEMPLAZAMIENTO + '\')})"' + '>' + value.nameSite + '</a>' +
												'<ul class="gtwList" id="site-' + value.idEMPLAZAMIENTO + '" style="display:none"></ul>' + 
											'</li>');
								
								item.appendTo($(lista));	
								idCFGCopy = value.idCFG;									
							});
							$(lista).show();

							$('#DivConfigurations').data('idCFG',idCFGCopy);
							GetGatewaysBelongConfiguration(true, idCFGCopy);
							$('#CBFreeGateways option[value="0"]').prop('selected', true);
							ClickCBFreeGateways();
						}
						else
							GetGatewaysBelongConfiguration(false);
					}
			 	}
	});
};

var ShowCfgByName = function(cfgName,cfgId){
	// Mostrar sus gateways
	var lista='#cfg-' + cfgName;
	$('.gtwList').hide();
	$(lista).empty();

	$.ajax({type: 'GET', 
		 		url: '/configurations/' + cfgName, 
		 		success: function(data){
		 				if (data != 'Configuration not found.'){
							$.each(data.result, function(index, value){
								//var item = $('<li data-texto="' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '" draggable="true" ondragstart="dragSiteToCfg(event)"><a style="display:block; color:#ff8c1a" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\')})"' + '>' + value.nameSite + '</a></li>');
								//item.appendTo($(lista));
								//var item = $('<li>' + 
								var item = $('<li data-texto="' + value.idEMPLAZAMIENTO + '" draggable="true" ondragstart="dragSiteToCfg(event)">' + 
												'<a style="display:block; color:#b70028" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.idEMPLAZAMIENTO + '\')})"' + '>' + value.nameSite + '</a>' +
												'<ul class="gtwList" id="site-' + value.idEMPLAZAMIENTO + '" style="display:none"></ul>' + 
											'</li>');
								item.appendTo($(lista));										
							});
							$(lista).show();

							GetGatewaysBelongConfiguration(true, cfgId != null ? cfgId : $('#DivConfigurations').data('idCFG'));
						}
					}
	});
};

/*****************/
/*	POST Method  */
/*****************/
var PostConfiguration = function (){
	if ($('#name').val().length == 0){
		alertify.alert('Ulises G 5000 R',"Identificador de la configuración no válido.");
		alertify.error("Identificador de la configuración no válido.");
		return;
	}
	
	for (var i = 0; i < $("#listConfigurations").children().length; i++) {
		if ($('#name').val() == ($("#listConfigurations").children()[i]).childNodes[0].text) {
			alertify.alert('Ulises G 5000 R', "Ya existe una configuración con ese nombre.");
			alertify.error("Identificador de la configuración no válido.");
			return;
		}
	}
	$.ajax({type: 'POST', 
		dataType: 'json', 
		contentType:'application/json',
		url: '/configurations/cfg', 
		data: JSON.stringify( { "name": $('#name').val(),
								"description": $('#desc').val()
								}
							),
	success: function(data){
				if (data.error === null) {
					alertify.success('La configuración \"' +  data.data.name + '\" ha sido cargada.');
					GetConfigurations();

					$('#DivConfigurations').data('idCFG',data.data.idCFG);
					GetConfiguration(data.data.name);
				}
				else if (data.error == "ER_DUP_ENTRY") {
					alertify.error('La configuración \"'+ data.data.name + '\" ya existe.');
				}
			},
	error: function(data){
					alertify.error('La configuración \"'+ data.data.name + '\" no existe.');
			}
	});
};

/****************/
/*	PUT Method  */
/****************/
var PutConfiguration = function(){
	if ($('#name').val().length == 0){
		alertify.alert('Ulises G 5000 R',"Identificador de la configuración no válido.");
		alertify.error("Identificador de la configuración no válido.");
		return;
	}

	$.ajax({type: 'PUT', 
			url: '/configurations/' + $('#DivConfigurations').data('idCFG'),
			dataType: 'json', 
			contentType:'application/json',
			data: JSON.stringify( { "idCFG": $('#DivConfigurations').data('idCFG'),
									"name": $('#name').val(),
									"description": $('#desc').val(),
									"activa": $('#activa').prop('checked')
								} ),
			success: function(data){
						alertify.success('Configuración \"' +  data.data.name + '\" actualizada.');
						GetConfigurations(function(){
							ShowCfg(data.data);	
						});
						// Añadir a la lista de pasarelas a reconfigurar 
						// todas las que pertenecen a la configuración activa
						// (Poder "aplicar cambios" en la configuración activa después de un restore)
						AddGatewaysFromActiveToListOfGateways();
					},
			error: function(data){
						alertify.error('La configuración \"'+ data.data.name + '\" ya existe.');
					}
			});
};

/*******************/
/*	DELETE Method  */
/*******************/
var DelConfiguration = function(){
	if ($('#activa').prop('checked')){
		// La configuración activa no se puede borrar
		alertify.alert('Ulises G 5000 R',"No se permite eliminar la configuración activa.");
		alertify.error("No se permite eliminar la configuración activa.");
	}
	else{
		alertify.confirm('Ulises G 5000 R', "ATENCION. ¿Desea eliminar la configuración \"" + $('#name').val() + "\"? " +
			"También se eliminarán todos los emplazamientos y pasarelas asociadas a dicha configuración.",
			function(){ 
						$.ajax({type: 'DELETE', 
						url: '/configurations/' + $('#DivConfigurations').data('idCFG'),
						success: function(data){
									if (data.error === 0)
										alertify.error('La configuración \"'+ data.data + '\" no existe.');
									else {
										alertify.success('Configuración \"'+ $('#name').val()+ '\" elminada.');
										$('#AddFormConfiguration').hide();
										$('#tableTools').hide();

										GetConfigurations();
									}
								},
						error: function(data){
										alertify.error('La configuración \"'+ data.data + '\" no existe.');
								}
			       		});

				//alertify.success('Ok'); 
			}, 
			function(){alertify.error('Cancelado');}
	    );
	}
};

var postGatewayToConfig = function(cfgId, idGtw){
	var sourceGtw = link_enlaces_libres[idGtw].valor;
	var sourceIdCfgOfGtw = link_enlaces_libres[idGtw].idCFG;


	// Si la pasarela ya existe en esta configuracion, sólo hay que asignarla
	if (sourceIdCfgOfGtw == cfgId)
		AssignGatewayToConfig(cfgId,idGtw);
	else{
		// Crear la pasarela en la configuración de trabajo: 'cfgId'
		// Obtener 'nombre' del emplazamiento sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO
		$.ajax({type: 'GET',
				url: 'sites/' + sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,
				success: function(data) {
					if (data != null){
						var siteName = data.name;

						// Buscar en cfgId el emplazamiento 'siteName'
						$.ajax({type: 'GET',
							url: 'configurations/' + cfgId + '/siteName/' + siteName,
							success: function(data) {
								// Si (emplazamiento !existe)
								if (data == null){
									// Crear emplazamiento
									$.ajax({type: 'POST', 
						 					url: '/sites/' + siteName, 
											dataType: 'json', 
											contentType:'application/json',
											data: JSON.stringify( { "cfg_idCFG": cfgId,
																	"name": siteName
																} ),
						 					success: function(data){
						 						if (data.data != null){
						 							sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = data.data;
													// Primero creo la pasarela
													$.ajax({type: 'COPY',
															dataType: 'json', 
															contentType:'application/json',
															data: JSON.stringify(sourceGtw),
															url: '/gateways/' + sourceGtw.idCGW , 
															success: function(data){
																// Luego la asigno a la configuración
									 							AssignGatewayToConfig(cfgId,data.data /*id de la nueva pasarela*/);
									 						}
						 							});
												}
						 					}
									});
								}
								else{
									sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = data.idEMPLAZAMIENTO;
									// Primero creo la pasarela
									$.ajax({type: 'COPY',
											dataType: 'json', 
											contentType:'application/json',
											data: JSON.stringify(sourceGtw),
											url: '/gateways/' + sourceGtw.idCGW , 
											success: function(data){
												// Luego la asigno a la configuración
					 							AssignGatewayToConfig(cfgId,data.data /*id de la nueva pasarela*/);
					 						}
		 							});
								}
							}
						});
					}
				}
		});
	}
};

var AssignGatewayToConfig = function (cfgId,sourceGtw){
	// Copiar sourceGtw	
	$.ajax({type: 'POST', 
			url: '/configurations/' + cfgId + '/gateways/' + sourceGtw,
			// dataType: 'json', 
			// contentType:'application/json',
			// data: JSON.stringify(sourceGtw),
			success: function(data){
						alertify.success('Gateway asignada.');
						ShowCfgByName($('#name').val());
						//GetGatewaysBelongConfiguration(true, data.data.CFG_idCFG);
					},
			error: function(data){
						alertify.error('La Gateway \"' + data.data.CFG_idCFG + '\" ya existe.');
					}
	});
};

var deleteGatewayFromConfig = function(cfgId, gtwId){
	$.ajax({type: 'DELETE', 
			url: '/configurations/' + cfgId + '/gateways/' + gtwId,
			dataType: 'json', 
			contentType:'application/json',
			success: function(data){
						alertify.success('Gateway liberada.');
						GetGatewaysBelongConfiguration(true, data.data.CFG_idCFG);
					},
			error: function(data){
						alertify.error('Gateway ' + data.name + ' exists.');
					}
	});
};

var UpdateSynchroStateInActiveConfig = function(data){
	$.each(data.general,function(index,value){
		$(".list li" ).each(function( index ) {
			if ($( this ).data('texto') == value.idCGW && 
				value.CFG_idCFG == $('#DivConfigurations').data('idCFG')){

				if (value.Viva == 1){
					if (value.Activa == 1){
						if (value.Sincro == 2){
							$( this ).find('div:first').prop('class','dragableItem VivaSincro');	// Verde claro
						}
						else if (value.Sincro == 1){
							$( this ).find('div:first').prop('class','dragableItem apply');			// Naranja
						}						
						else
							$( this ).find('div:first').prop('class','dragableItem VivaNoSincro');	// Amarillo
					}
				}
				else{	// No viva
					if (value.Activa){
						// Si antes estaba como 'Viva' mensaje de aviso
						if ($( this ).find('div:first').prop('class').indexOf('VivaSincro') != -1 || 
							$( this ).find('div:first').prop('class').indexOf('VivaNoSincro') != -1)
								alertify.alert('Ulises G 5000 R','La pasarela ' + value.name + ' ha dejado de comunicar con el servidor.');

						$( this ).find('div:first').prop('class','dragableItem NoVivaActiva');		// Azul claro
					}
				}
			}
		});
	});
};

var ClickViewFreeGateways = function(){
	if ($('#CBViewFreeGateways').prop('checked')){
		$('#CBFreeGateways').show();
		$('#freeGatewaysList').show();
/*		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(2) > td:nth-child(2)').attr('style','display:table-row')
		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(3) > td').attr('style','display:table-row')
*/	}
	else{
		$('#CBFreeGateways').hide();
		$('#freeGatewaysList').hide();
/*		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(2) > td:nth-child(2)').attr('style','display:table-column')
		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(3) > td').attr('style','display:table-column')
*/	}
};

var ClickCBFreeGateways = function(){
	var cfgId = $('#CBFreeGateways option:selected').val();

	$("#freeGatewaysList").empty();
	link_enlaces_libres = [];

	if (cfgId == 0){	// <Activa>
		$.ajax({type: 'GET', 
				url: '/gateways/alive',
				success: function(data){
					if (data != null && data.length > 0){
						$.each(data, function(index, value){
							link_enlaces_libres[value.idCGW] = {idCFG: value.idCFG, valor: value};

							var clase = '';

							if (value.Activa == 1){
								clase = 'dragableItem VivaSincro';		// Verde claro
							}
							else{	// No activa
								clase = 'dragableItem VivaNoActiva';		// Verde Oscuro
							}

							var _cfgJson={idCFG:value.idCFG,name:value.nameCfg,description:value.description,activa:value.activa,ts_activa:value.ts_activa};
							var item = $('<li data-texto="' + value.idCGW + '"><div onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(_cfgJson) + '),ShowSite("' + value.site + '","' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '") , ShowHardwareGateway("' + value.idCGW + '","' + value.name + '")})\' style="width:300px;cursor:pointer" class="' +
										clase + '" id="' +  value.idCGW + '" draggable="false" ondragstart="dragGateway(event)">' + value.name +
										'<div style="color:black' + '; font-size: 8px; margin-right: 0">' +  value.site + '</div>' +'</li>');
							item.appendTo($("#freeGatewaysList"));
						});
					}
				}
			});
	}
	else{
		$.ajax({type: 'GET', 
			url: '/configurations/' + cfgId + '/gateways',
				success: function(data){
					$.each(data.general, function(index, value){
						link_enlaces_libres[value.idCGW] = {idCFG: value.idCFG, valor: value};

						var clase = 'dragableItem';
						/*
						var clase = '';

						if (value.Viva == 1){
							if (value.Activa == 1){
								if (value.Sincro == 2){
									clase = 'dragableItem VivaSincro';		// Verde claro
								}
								else if (value.Sincro == 1){
									clase = 'dragableItem apply';			// Naranja
								}
								else
									clase = 'dragableItem VivaNoSincro';	// Amarillo
							}
							else{	// No activa
								clase = 'dragableItem VivaNoActiva';		// Azul claro
							}
						}
						else{	// No viva
							if (value.Activa)
								clase = 'dragableItem NoVivaActiva';		// Verde Oscuro
							else
								clase = 'dragableItem NoVivaNoActiva';		// Azul Oscuro
						}
						*/
						var _cfgJson={idCFG:value.idCFG,name:value.nameCfg,description:value.description,activa:value.activa,ts_activa:value.ts_activa};
						var item = $('<li data-texto="' + value.idCGW + '"><div onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(_cfgJson) + '),ShowSite("' + value.nameSite + '","' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '") , ShowHardwareGateway("' + value.idCGW + '","' + value.name + '")})\' style="width:300px;cursor:pointer" class="' + 
										clase + '" id="' +  value.idCGW + '" draggable="false" ondragstart="dragGateway(event)">' + value.name +
									'<div style="color:black' + '; font-size: 8px; margin-right: 0">' +  value.nameSite + '</div>' +'</li>');
						item.appendTo($("#freeGatewaysList"));
					});
				}
		});
	}
};

var GetGatewaysBelongConfiguration = function(show, cfgId){
	link_enlaces = {};

	if (!show){
		// Reset lista de pasarelas asignadas
		$("#assignatedGatewaysList").empty();
		$('#AssignatedGatewaysDiv').show();
	}
	else{
		// Ocultar div copia si estuviera abierto
		$('#CopyCfgForm')[0].reset();
		$('#CopyCfgDiv').hide();

		// translateWord('HideGateways',function(result){
		// 	$('#GatewaysButton').text(result);
		// })

		$('#BtnCopyCfg').prop('enabled',false);

		$('#AssignatedGatewaysDiv').show();
		$("#freeGatewaysList").addClass('dropable');
		$("#assignatedGatewaysList").addClass('dropable');

		//$('#CfgId').val(cfgId);

		$.ajax({type: 'GET', 
				url: '/configurations/' + cfgId + '/gateways', 
				success: function(data){
						$("#assignatedGatewaysList").empty();
						if (data.general.length > 0){
							//$("#assignatedGatewaysList").attr('style','height: auto');

							$.each(data.general, function(index, value){
								link_enlaces[value.idCGW]={idCFG: cfgId, valor: value};
								var item = '';
								var clase = '';

								if (value.Activa == null)
									value.Activa = 0;

								if (value.Viva == 1){
									if (value.Activa == 1){
										if (value.Sincro == 2){
											clase = 'dragableItem VivaSincro';		// Verde claro
										}
										else if (value.Sincro == 1){
											clase = 'dragableItem apply';			// Naranja
										}
										else
											clase = 'dragableItem VivaNoSincro';	// Amarillo
									}
									else{	// No activa
										clase = 'dragableItem';						// Si no es la activa, no se representa el estado
									}
								}
								else{	// No viva
									if (value.Activa)
										clase = 'dragableItem NoVivaActiva';		// Verde Oscuro
									else
										clase = 'dragableItem';		// Azul Oscuro
								}

								link_enlaces[value.idCGW]={idCFG: cfgId, valor: value};
								item = $('<li data-texto="' + value.idCGW + '"><div onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\') , ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})" style="width:300px;cursor:pointer" class="' +
											clase + '" id="' +  value.idCGW + '" ondragstart="dragGateway(event)">' + value.name + 
									'<div style="color:black; font-size: 8px; margin-right: 0"> ' + value.nameSite + '</div>' +'</li>');
								item.appendTo($("#assignatedGatewaysList"));

/*
								switch (value.Activa){
									case 0: // Asignada pero no activa
										link_enlaces[value.idCGW]={idCFG: cfgId, valor: value};
										item = $('<li data-texto="' + value.idCGW + '"><div onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\') , ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})" style="width:300px;cursor:pointer" class="' + 
													clase + '" id="' +  value.idCGW + '" ondragstart="dragGateway(event)">' + value.name + 
											'<div style="color:white; font-size: 8px; margin-right: 0"> ' + value.nameSite + '</div>' +'</li>');
										item.appendTo($("#assignatedGatewaysList"));
									break;
									case 1: // Asignada y activa
										link_enlaces[value.idCGW]={idCFG: cfgId, valor: value};
										item = $('<li data-texto="' + value.idCGW + '"><div onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\') , ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})" style="width:300px;cursor:pointer" class="' + 
													clase + '" id="' +  value.idCGW + '" ondragstart="dragGateway(event)">' + value.name + 
											'<div style="color:black; font-size: 8px; margin-right: 0"> ' + value.nameSite + '</div>' +'</li>');
										item.appendTo($("#assignatedGatewaysList"));
									break;
								}
*/
							});
							$('#NewGateway').attr("onclick","GetGateway()");
						}
				}
		});
		/*
		$("#freeGatewaysList").empty();
		$.ajax({type: 'GET', 
			url: '/configurations/' + cfgId + '/free',
			success: function(data){
				$.each(data.result, function(index, value){
					link_enlaces_libres[value.idCGW] = {idCFG: value.idCFG, valor: value};

					var clase = '';

					if (value.Viva == 1){
						if (value.Activa == 1){
							if (value.Sincro == 2){
								clase = 'dragableItem VivaSincro';		// Verde claro
							}
							else if (value.Sincro == 1){
								clase = 'dragableItem apply';			// Naranja
							}
							else
								clase = 'dragableItem VivaNoSincro';	// Amarillo
						}
						else{	// No activa
							clase = 'dragableItem VivaNoActiva';		// Azul claro
						}
					}
					else{	// No viva
						if (value.Activa)
							clase = 'dragableItem NoVivaActiva';		// Verde Oscuro
						else
							clase = 'dragableItem NoVivaNoActiva';		// Azul Oscuro
					}
					var _cfgJson={idCFG:value.idCFG,name:value.nameCfg,description:value.description,activa:value.activa,ts_activa:value.ts_activa};
					var item = $('<li data-texto="' + value.idCGW + '"><div onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(_cfgJson) + '),ShowSite("' + value.nameSite + '","' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '") , ShowHardwareGateway("' + value.idCGW + '","' + value.name + '")})\' style="width:300px;cursor:pointer" class="' + 
									clase + '" id="' +  value.idCGW + '" draggable="true" ondragstart="dragGateway(event)">' + value.name + 
						'<div style="color:white; font-size: 8px; margin-right: 0"> [' + value.nameCfg + '] ' +  value.nameSite + '</div>' +'</li>');
					item.appendTo($("#freeGatewaysList"));
				});
			}
		});
		*/
	}
};

var CopyConfiguration = function(){
	if ($('#nameCopy').val().length == 0){
		alertify.alert('Ulises G 5000 R',"Identificador de la configuración no válido.");
		alertify.error("Identificador de la configuración no válido.");
		return;
	}
	
	for (var i = 0; i < $("#listConfigurations").children().length; i++) {
		if($('#nameCopy').val() == ($("#listConfigurations").children()[i]).childNodes[0].text) {
			alertify.alert('Ulises G 5000 R',"Ya existe una configuración con ese nombre.");
			alertify.error("Identificador de la configuración no válido.");
			return;
		}
	}
	
	alertify.success('Copia de configuración en curso');

	$.ajax({type: 'POST', 
		dataType: 'json', 
		contentType:'application/json',
		url: '/configurations/' + $('#idCFG').val() + '/copy',
		// New config: 
		data: JSON.stringify( { "name": $('#nameCopy').val(),
								"description": $('#descCopy').val() }),
	success: function(data){
				if (data.error === null) {
					alertify.success('La configuración \"' + data.data.name + '\" ha sido copiada.');
					ShowCopyConfiguration(false);
					GetConfigurations();
					//GetConfiguration(data.data.name);
					ShowCfg(data.data);
					
				}
			},
	error: function(data){
					alertify.error('La configuración \"'+ data.data.name + '\" no existe.');
			}
	});
};

var ShowCopyConfiguration = function(on){
	if (on === true){
		if ($('#AssignatedGatewaysDiv').is(':visible')){
				// translateWord('Gateways',function(result){
				// 	$('#GatewaysButton').text(result);
				// })

				//$('#GatewaysButton').text('Gateways');
				$('#AssignatedGatewaysDiv').hide();
			}
			$('#CopyCfgDiv').show();
	}
	else{
		$('#CopyCfgForm')[0].reset();
		$('#CopyCfgDiv').hide();
	}
};

var ExistGatewayWithoutResources = function(f){
	$.ajax({
			type: 'GET',
			url: '/configurations/' + $('#DivConfigurations').data('idCFG') + '/gateways',
			success: function(result){
						var aplicar = true;
						if(result.general.length == 0)
							f({Aplicar:true});
						$.each(result.general, function(index, value){
							if (aplicar){
								$.ajax({
										type:'GET',
										url: '/gateways/' + value.idCGW + '/resources',
										success:function(data){
											if (index == result.general.length - 1 && aplicar){
												f({Aplicar:true});
											}
											else if (data.length == 0){
												aplicar = false;
												// No tiene recursos configurados
												alertify.confirm('Ulises G 5000 R','La pasarela ' + value.name + ' - ' +
															value.ipv + ' no tiene recursos asignados,<br />¿desea activar la configuración de todas formas?',function(){
														f({Aplicar:true});
													},
													function(){
														f({Aplicar:false});
													}
												);
											}
										}
								});
							}
						});
					}
	});
};

var ExistGatewaysOut = function(f){
	var retorno = false;
	$.ajax({
			type: 'GET',
			url: '/configurations/' + $('#DivConfigurations').data('idCFG') + '/gateways',
			success: function(result){
						var strGateways='Las siguientes pasarelas no tiene comunicación con el servidor:' + '<br />';
						var gtw=[];

						$.each(result.general, function(index, value){
							if (value.Viva == 0){
								retorno = true;
								gtw.push(value.name);
								strGateways += value.name + ' - ' + value.ipv + '<br />';
							}
						});

						if (retorno){
							strGateways += '¿Desea activar la configuración de todas formas?';
							alertify.confirm('Ulises G 5000 R',strGateways,function(){
								f({Aplicar:true,gateways:gtw});
							},
							function(){
								f({Aplicar:false,gateways:null});
							});
						}
						else
							f({Aplicar:true,gateways:null});
					}
	});
};

var ActiveCfg = function(){
	alertify.confirm('Ulises G 5000 R', "¿Desea activar la configuración \"" + $('#name').val() + "\".?", 
			function(){ 
						// Obtener aquellas pasarelas que no tiene comunicación con el servidor
						ExistGatewaysOut(function(existe){
							if (existe.Aplicar){
								// Comprobar si existe alguna pasarela de la configuración
								// a activar sin recursos configurados
								ExistGatewayWithoutResources(function(gateways){
									if (gateways.Aplicar){
										// Activar configuracion
										$.ajax({
											type: 'GET',
											url: '/configurations/' + $('#DivConfigurations').data('idCFG') + '/activate',
											success: function(data){
												if (data.result){
													GenerateHistoricEvent(ID_HW,LOAD_REMOTE_CONFIGURATION,$('#name').val(),$('#loggedUser').text());
													alertify.success('Configuración \"'+ $('#name').val() + '\" activada.');
													// Generar histórico con cada pasarela que no se pudo configurar
													// por estar desconectada del servidor
													if (existe.gateways != null){
														$.each(existe.gateways, function(index, value){
															GenerateHistoricEventArray(ID_HW,LOAD_REMOTE_CONFIGURATION_FAIL,[$('#name').val(),value],$('#loggedUser').text());
														});
													}
												}
												else{
													GenerateHistoricEvent(ID_HW,LOAD_REMOTE_CONFIGURATION_FAIL,$('#name').val(),$('#loggedUser').text());
													if(data.count == 0)
														alertify.error('No ha sido posible activar la configuración \"'+ $('#name').val() + '\" al estar vacía.');
													else {
														alertify.error('No ha sido posible activar la configuración \"'+ $('#name').val() + '\".');
														alertify.error('¿Tiene la configuración \"'+ $('#name').val() + '\" alguna pasarela asignada?.');
													}
												}
												// Provocar una actualización  en la lista de configuraciones si hubiera un cambio de configuración activa
												GetConfigurations();
												ShowCfg($('#DivConfigurations').data('cfgJson'));
											}
										});
									}
								});
							}
						});
				//alertify.success('Ok'); 
			},
			 function(){ alertify.error('Cancelado');}
	);
};

var GetActiveCfgAndActivate = function(){
	/** 20170516 AGL Este filtro ya no parece tener sentido. Comprobar... */
	// if (listOfGateways.length > 0)
	{
		$.ajax({
			type: 'GET',
			url: '/configurations/active',
			success: function(data){
				if (data != null){
					alertify.confirm('Ulises G 5000 R', "¿Desea activar la configuración \"" + data.name + "\" en las gateways?", 
						function(){ 
							ExistGatewaysOut(function(existe){
								if (existe.Aplicar){
									// Comprobar si existe alguna pasarela de la configuración
									// a activar sin recursos configurados
									ExistGatewayWithoutResources(function(gateways){
										if (gateways.Aplicar){
											if (listOfGateways.endsWith(','))
												// Eliminar el último -
												listOfGateways = listOfGateways.substr(0,listOfGateways.length - 1);

									 		$.ajax({
												type: 'GET',
												url: '/configurations/' + data.idCFG + '/activate/' + listOfGateways,
												success: function(result){
													if (result){
														GenerateHistoricEvent(ID_HW,LOAD_REMOTE_CONFIGURATION,data.name,$('#loggedUser').text());
														alertify.success('Configuración \"'+ data.name + '\" activada.');
														// Reset list of gateways to activate
														AddGatewayToList(null);
														/** 20170509. AGL Gestor 'Aplicar cambios' en usuarios */
														usersModified = false;
														/** 20170516. AGL. Activar Cambios... */
														tbbssModified = false;														
														// Generar histórico con cada pasarela que no se pudo configurar
														// por estar desconectada del servidor
														if (existe.gateways != null){
															$.each(existe.gateways, function(index, value){
																GenerateHistoricEventArray(ID_HW,LOAD_REMOTE_CONFIGURATION_FAIL,[$('#name').val(),value],$('#loggedUser').text());
															});
														}
													}
													else{
														GenerateHistoricEvent(ID_HW,LOAD_REMOTE_CONFIGURATION_FAIL,data.name,$('#loggedUser').text());
														alertify.error('No ha sido posible activar la configuración \"'+ data.name + '\".');
													}
												}
											});
										}		
									});
							 	}
							});
						},
						 function(){ alertify.error('Cancelado');}
					);
				}
			}
		});
	}
};

var GotoGateway = function (id,name,idSite,nameSite){
	 hidePrevious('#FormSites','#AddFormsite','#DivSites'); 
	 GetSites(function(){
	 	ShowSite(nameSite,idSite);
	 	ShowHardwareGateway(id,name);
	 });
};


var GenerateData = function(idCfg, f){
	$.ajax({
		type: 'GET',
		url: '/configurations/SP_cfg/' + idCfg,
		success: function(data){
			if (data != null && data.result[0].length > 0){
				f(data);
			}
			else{
				alertify.alert('Ulises G 5000 R',"No hay gateways asignados a la configuración o las gateways asignadas no tienen recursos.");
				alertify.error("No hay gateways asignados a la configuración o las gateways asignadas no tienen recursos.");
			}
		}
	});
};
//allowDrop(ev)
function checkDraggableItem(){
	alertify.alert('Ulises G 5000 R',"Estas seguro?");
}

function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

var ExportCfgToPdf = function(idCfg){
	// Llamar al SP para generar la tabla con los datos necesarios
	GenerateData(idCfg,function(result){

		// Generate report
		var header=[
			{ text: 'Pasarela', style: 'tableHeader' }, 
			{ text: 'Slot', style: 'tableHeader' }, 
			{ text: 'Posicion', style: 'tableHeader' },
			{ text: 'Recurso', style: 'tableHeader' }, 
			{ text: 'Tipo', style: 'tableHeader' }, 
			{ text: 'Subtipo', style: 'tableHeader'},
			{ text: 'Colateral', style: 'tableHeader' }
		];


		if (result.errno === 1305){
			console.log('Error: ' + result.code);
			return;
		}
		var start = 0;
		var cuantos = 300;
		var rows = result.result[0];
		var items = rows.slice(start,cuantos);
		var lastGateway = '';
		var cfgName = items[0].cfg_name;
		while (items.length > 0){
			// ** Array of arrays!! **/
			var data=[];
			data.push(header);
			
			$.each(items,function(index,value){
				var row=[];
				var uris=[];
				var red = 'black';

				if (value.resource_tipo == 2){
					red = (value.uri_remota == null || value.uri_remota == '') ? 'red' : 'black';
					// Telefónico
					row.push({text: value.cgw_name, color:red});
					row.push({text: value.slave.toString(), color:red});
					row.push({text: value.posicion.toString(), color:red});
					row.push({text: value.resource_name, color:red});
					row.push({text: "TELEFONICO", color:red});
					switch (value.tipo_tel){
						case 0:
							row.push({text: 'PP-BL', color:red});
						break;
						case 1:
							row.push({text: 'PP-BC', color:red});
						break;
						case 2:
							row.push({text: 'PP-AB', color:red});
						break;
						case 3:
							row.push({text: 'ATS-R2', color:red});
						break;
						case 4:
							row.push({text: 'ATS-N5', color:red});
						break;
						case 5:
							row.push({text: 'LCEN', color:red});
						break;
						case 6:
							row.push({text: 'ATS-QSIG', color:red});
						break;
						case 7:
							row.push({text: 'TUN-LOC', color:red});
						break;
						case 8:
							row.push({text: 'TUN-REM', color:red});
						break;
					}
					row.push({text: value.uri_remota != null ? value.uri_remota : '', color:red});

					data.push(row);
				}
				else{
					// Radio
					switch (value.tipo_rad){
						case 0: // Local-Simple
							red = ((value.uriTxA == null || value.uriRxA == null) ? 'red' : 'black');

							row.push({text: value.cgw_name, color:red});
							row.push({text: value.slave.toString(), color:red});
							row.push({text: value.posicion.toString(), color:red});
							row.push({text: value.resource_name, color:red});
							row.push({text:"RADIO",color:red});
							row.push({text:"Local-Simple",color:red});
								uris.push({ text: 'Tx:' + (value.uriTxA != null ? value.uriTxA : ''),color:red});
								uris.push({ text: 'Rx:' + (value.uriRxA != null ? value.uriRxA : ''),color:red});
								row.push(uris);
						break;
						case 1: // Local-P/R
							red = (value.uriTxA == null || value.uriRxA == null || value.uriTxB == null || value.uriRxB == null) ? 'red' : 'black';

							row.push({text: value.cgw_name, color:red});
							row.push({text: value.slave.toString(), color:red});
							row.push({text: value.posicion.toString(), color:red});
							row.push({text: value.resource_name, color:red});
							row.push({text:'RADIO',color:red});
							row.push({text:'Local-P/R',color:red});
								uris.push({ text: 'Tx A:' + (value.uriTxA != null ? value.uriTxA : ''),color:red});
								uris.push({ text: 'Tx B:' + (value.uriTxB != null ? value.uriTxB : ''),color:red});
								uris.push({ text: 'Rx A:' + (value.uriRxA != null ? value.uriRxA : ''),color:red});
								uris.push({ text: 'Rx B:' + (value.uriRxB != null ? value.uriRxB : ''),color:red});
								row.push(uris);
						break;
						case 2: // Local FD-Simple
							red = (value.uriTxA == null || value.uriRxA == null) ? 'red' : 'black';

							row.push({text: value.cgw_name, color:red});
							row.push({text: value.slave.toString(), color:red});
							row.push({text: value.posicion.toString(), color:red});
							row.push({text: value.resource_name, color:red});
							row.push({text:'RADIO',color:red});
							row.push({text:'Local FD-Simple',color:red});
								uris.push({ text: 'Tx:' + (value.uriTxA != null ? value.uriTxA : ''),color:red});
								uris.push({ text: 'Rx:' + (value.uriRxA != null ? value.uriRxA : ''),color:red});
								row.push(uris);
						break;
						case 3: // Local FD-P/R
							red = (value.uriTxA == null || value.uriRxA == null || value.uriTxB == null || value.uriRxB == null);

							row.push({text:value.cgw_name,color:red});
							row.push({text:value.slave.toString(),color:red});
							row.push({text:value.posicion.toString(),color:red});
							row.push({text:value.resource_name,color:red});
							row.push({text:'RADIO',color:red});
							row.push({text:'Local FD-P/R',color:red});
								uris.push({ text: 'Tx A:' + (value.uriTxA != null ? value.uriTxA : ''),color:red});
								uris.push({ text: 'Tx B:' + (value.uriTxB != null ? value.uriTxB : ''),color:red});
								uris.push({ text: 'Rx A:' + (value.uriRxA != null ? value.uriRxA : ''),color:red});
								uris.push({ text: 'Rx B:' + (value.uriRxB != null ? value.uriRxB : ''),color:red});
								row.push(uris);
						break;
						case 4: // Remoto RxTx
							row.push({text: value.cgw_name, color:red});
							row.push({text: value.slave.toString(), color:red});
							row.push({text: value.posicion.toString(), color:red});
							row.push({text: value.resource_name, color:red});
							row.push({text:'RADIO',color:red});
							row.push('Remoto RxTx');
							row.push('');
						break;
						case 5: // Remoto Tx
							row.push({text: value.cgw_name, color:red});
							row.push({text: value.slave.toString(), color:red});
							row.push({text: value.posicion.toString(), color:red});
							row.push({text: value.resource_name, color:red});
							row.push({text:'RADIO',color:red});

							row.push('Remoto Tx');
							row.push('');
						break;
						case 6: // Remoto Rx
							row.push({text: value.cgw_name, color:red});
							row.push({text: value.slave.toString(), color:red});
							row.push({text: value.posicion.toString(), color:red});
							row.push({text: value.resource_name, color:red});
							row.push({text:'RADIO',color:red});

							row.push('Remoto Rx');
							row.push('');
						break;
					}
					data.push(row);
				}
			});

			var base64 = getBase64Image(document.getElementById("imgLogo"));
			var docDefinition = { 
				footer: function(currentPage, pageCount) { return {text: currentPage.toString() + ' / ' + pageCount, alignment: 'center', margin: [ 0, 5, 0, 0 ]  };},
/*				background: function(currentPage){
					if (currentPage > 1)
						return	{ text: lastGateway, style: 'subheader'};
				},
*/				// a string or { width: number, height: number }
				pageSize: 'A4',
				// by default we use portrait, you can change it to landscape if you wish
				pageOrientation: 'landscape',
				content:[ 	
					{
						layout: 'noBorders',
						table:{
							widths: [100, '*'],
							body:[
									[
										{
		                    				image: 'data:image/jpeg;base64,'+ base64,
			                    			alignment: 'left',
			                    		}, 
			                    		{ text : $('#_hfecha').text() + ' ' +  $('#_hsolohora').text(), style: 'subheader', alignment:'right'} 
			                    	],
							]
						}
					},
					{ text: 'CONFIGURACION: ' + cfgName, style: 'header' },
					//{ text:  data[start + 1][0], style: 'subheader' },
					{
						style: 'tableExample',
						table: {
								headerRows: 1,
								// keepWithHeaderRows: 1,
								// dontBreakRows: true,
								body: data
						}
					},
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10],
						color: 'red',
						alignment: 'center'
					},
					subheader: {
						fontSize: 12,
						bold: true,
						color: '#D2747D',
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: 'black'
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			pdfMake.createPdf(docDefinition).open();	
			//pdfMake.createPdf(docDefinition).download('U5K-G-' + start + '.pdf');	
			items = rows.slice(++start * cuantos,(start * cuantos) + cuantos);
		}
	});
};
