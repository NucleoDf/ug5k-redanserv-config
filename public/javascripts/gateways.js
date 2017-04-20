var dataOfResource = null;
var listOfGateways = '';
var totalRecursos = 0;
var cicloCompleto = 0;

/******************************************************************************************************/
/****** Module: gateways.js												*******************************/
/****** Description: Módulo de soporte a la gestion de pasarelas		*******************************/
/******************************************************************************************************/
var link_enlaces = [];
var link_enlaces_libres = [];

var ChangeGateWaySite = function(data){
	var oldIndex = data[data.oldValue].value;
	var newIndex = data[data.selectedIndex].value;
	var idCgw = $('#DivGateways').data('idCgw');
	alertify.confirm('Ulises G 5000 R', "¿Quiere cambiar la pasarela del emplazamiento \"" + data[data.oldValue].outerText +
		"\" al emplazamiento \"" + data[data.selectedIndex].outerText + "\"?",
		function(){
			$.ajax({type: 'POST',
				url: '/gateways/changesite/'+idCgw+'/'+newIndex,
				success: function(data){
					if(data.data == 'DUP_ENTRY_NAME')
						alertify.error('Ya existe una pasarela con el mismo nombre en el emplazamiento de destino seleccionado.');
					else
						alertify.success('La pasarela ha sido cambiada de emplazamiento.');
					ShowSite($('#IdSite').val(),$('#IdSite').data('idSite'));
				},
				error: function(data){
					alertify.error('Error en la operacion');
				}
			});
			//alertify.success('Ok');
		},
		function(){ alertify.error('Cancelado');}
	);
	
};

var DelGateway = function(){

	alertify.confirm('Ulises G 5000 R', "¿Eliminar la gateway \"" + $('#LblIdGateway').text() + "\"?", 
		function(){ 
			$.ajax({type: 'DELETE', 
				url: '/gateways/' + $('#DivGateways').data('idCgw'),
				success: function(data){
							if (data.data == 0)
								alertify.error('Una pasarela asignada a la configuración activa no puede ser eliminada.');	
							else{
								GenerateHistoricEvent(ID_HW,REMOVE_GATEWAY,$('#nameGw').val(),$('#loggedUser').text());
						
								alertify.success('Gateway \"' + $('#nameGw').val() + '\" eliminada.');

								ShowSite($('#IdSite').val(),$('#IdSite').data('idSite'));

								//GetGateways();
								// Ocultar div con los datos de una CGW
								//$('#GeneralContent,#TableToolsGateway').hide();
								//$('#DivComponents').attr('class','fadeNucleo divNucleo');
							}
						},
				error: function(data){
								alertify.error('Gateway \"' + data.data.name + '\" no existe.');
						}
	       		});
			//alertify.success('Ok'); 
		}, 
		function(){ alertify.error('Cancelado');}
        );

};

var CloseCopy = function(){
	$('#CopyGatewayZone').animate({width: '0px', height: '0px'},500,function(){
		$('#CopyGatewayZone').hide();
	
		$('#AddFormsite').removeClass('disabledDiv');
		$('#SitesList').removeClass('disabledDiv');
		$('#NavMenu').removeClass('disabledDiv');
		$('#NavConfiguration').removeClass('disabledDiv');
	});
};

var CopyGateway = function(){
	$('#AddFormsite').addClass('disabledDiv');
	$('#SitesList').addClass('disabledDiv');
	$('#NavMenu').addClass('disabledDiv');
	$('#NavConfiguration').addClass('disabledDiv');
	
	$('#CopyGatewayZone').attr('style','position:absolute;width:0px;height:0px;top:380px;left:460px');
	$('#CopyGatewayZone').show();
	$('#CopyGatewayZone').animate({width: '35%', height: '175px'},500,function(){
		$('#LblIpvCopyGateway').text($('#ipv').val());
		$('#LblNameCopyGateway').text($('#nameGw').val());

		$('#CopyGatewayZone').addClass('divNucleo');
	});
};

var Copy = function(){
	if ($('#nameCopyGw').val().length > 0){
		CopyMethodGateway($('#DivGateways').data('idCgw'),$('#nameCopyGw').val());
	}

	CloseCopy();
};

var CopyMethodGateway = function(idSourceGateway,nameTargetGateway){
	$.ajax({type: 'COPY',
			dataType: 'json', 
			//contentType:'application/json',
			//data: JSON.stringify({ipv: $('#ipv').val()}),
			url: '/gateways/' + idSourceGateway + '/' + nameTargetGateway, 
			success: function(data){
				if (data.error == 'ER_DUP_ENTRY')
					alertify.error('Gateway \"' + nameTargetGateway + '\" ya existe.');
				else{
					ShowSite($('#IdSite').val(),$('#IdSite').data('idSite'));
					alertify.success('Gateway clonado.');
					GetGateways(null,function(){
						ShowHardwareGateway(data.data,nameTargetGateway);
					});				
				}
			}
	});
};

var PostGateway = function (f){
	var cpus=[];
	var sip={};
	var proxys=[];
	var registrars=[];
	var web={};
	var snmp={};
	var traps=[];
	var rec={};
	var grab={};
	var sincr={};
	var listServers=[];
	var mensaje='';
	var mensajeNoName='';
	var mensajeNoIp='';
	var mensajeServiceError='';
	
	// RECORDING SERVICE
	grab={
		"rtsp_port": $('#rtsp_port').val(),
		//"rtsp_uri": $('#rtsp_uri').val(),
		"rtsp_uri": '',
		"rtsp_ip": $('#rtsp_ip').val(),
		//"rtsp_rtp": $('#rtp_tramas').prop('checked') ? 1 : 0
		"rtsp_rtp": 1 
	};

	// SINCR. SERVICE
	$('#NtpServersList option').each(function() {
		var selected = $("#NtpServersList option:selected").val() == $(this).val();
		listServers.push({'ip':$(this).val(),'selected':selected});
	});	
	sincr={
		"ntp": 2,
		"servidores": listServers
	};
	// Proxy list
	$('#ProxysList option').each(function() {
		var selected = $("#ProxysList option:selected").val() == $(this).val();
			proxys.push({'ip':$(this).val(),'selected':selected});
	});
	// Registrars list
	$('#RegistrarsList option').each(function() {
		var selected = $("#RegistrarsList option:selected").val() == $(this).val();
			registrars.push({'ip':$(this).val(),'selected':selected});
	});
	// Traps list
	$('#TrapsList option').each(function() {
			traps.push($(this).val());
	});

	translateWord('ErrorServiceToGateway',function(result){
		mensaje = result;
	});
	translateWord('ErrorGatewayHaveNoName',function(result){
		mensajeNoName = result;
	});
	translateWord('ErrorGatewayHaveNoIP',function(result){
		mensajeNoIp = result;
	});
	translateWord('ErrorGeneratingService',function(result){
		mensajeServiceError = result;
	});

	translateWord('Update',function(result){
		if ($('#UpdateGtwButton').text() === result){

			if ($("#ListServices option:selected").val() == ""){
				alertify.error(mensaje);
				return;
			}

			if ($('#nameGw').val() == ''){
				alertify.error(mensajeNoName);
				return;
			}

			if ($('#ipv').val() == ''){
				alertify.error(mensajeNoIp);
				return;
			}

			/*if ($('#ips').val() == ''){
				translateWord('ErrorIPServerConf',function(result){
					alertify.error(result);
				});
				return;
			}*/

			//CPU 0
			if ($('#ipb1').val() == ''){
				translateWord('ErrorIPCPU',function(result){
					alertify.error(result + " 0");
				});				
				return;
			}
			if ($('#ipg1').val() == ''){
					translateWord('ErrorIPGateway',function(result){
						alertify.error(result + " 0");
					});
				return;
			}
			if ($('#msb1').val() == ''){
				translateWord('ErrorCPUMask',function(result){
						alertify.error(result + " 0");
				});
				return;
			}
			if ($('#dual').prop('checked')){
				//CPU 1						
				if ($('#ipb2').val() == ''){
					translateWord('ErrorIPCPU',function(result){
						alertify.error(result + " 1");
					});					
					return;
				}
				if ($('#ipg2').val() == ''){
					translateWord('ErrorIPGateway',function(result){
						alertify.error(result + " 1");
					});	
					return;
				}
				if ($('#msb2').val() == ''){
					translateWord('ErrorCPUMask',function(result){
						alertify.error(result + " 1");
					});
					return;
				}	
			}



			/****************/
			/*	PUT Method  */
			/****************/
			if ($('#dual').prop('checked')){
				cpus=[
			// CPU-1
					{ 	"num": 1, 
						"tlan": 1,	//$("#Lan1 option:selected").val(),
						"ip0": $('#ip01').val(),
						"ms0": $('#ms01').val(),
						"ip1": $('#ip11').val(),
						"ms1": $('#ms11').val(),
						"ipb": $('#ipb1').val(),
						"msb": $('#msb1').val(),
						"ipg": $('#ipg1').val()},
			// CPU-2
					 { 	"num": 2, 
					 	"tlan": 1,	//$("#Lan2 option:selected").val(),
						"ip0": $('#ip02').val(),
						"ms0": $('#ms02').val(),
						"ip1": $('#ip12').val(),
						"ms1": $('#ms12').val(),
						"ipb": $('#ipb2').val(),
						"msb": $('#msb2').val(),
						"ipg": $('#ipg2').val()}
						];
			}
			else{
				cpus = [{ "num": 1, 
							"tlan": 1,	//$("#Lan1 option:selected").val(),
							"ip0": $('#ip01').val(),
							"ms0": $('#ms01').val(),
							"ip1": $('#ip11').val(),
							"ms1": $('#ms11').val(),
							"ipb": $('#ipb1').val(),
							"msb": $('#msb1').val(),
							"ipg": $('#ipg1').val()}
						];
			}

			// WEB
			web = {"wport": $('#wport').val(),
					"stime": $('#stime').val()};
			// SNMP
			snmp = {
					"agcomm": $('#agcomm').val(),
					"agcont": $('#agcont').val(),
					"agloc": $('#agloc').val(),
					"agname": $('#agname').val(),
					"agv2": $('#agv2').prop('checked'),
					"sport": $('#sport').val(),
					"snmpp": $('#snmpp').val(),
					"traps": traps
			};
			// SERVICES
				// SIP
			sip = {	"proxys":proxys,
					"registrars":registrars,
					"PuertoLocalSIP": $('#PuertoLocalSIP').val() == '' ? 5060 : $('#PuertoLocalSIP').val(),
					"KeepAlivePeriod": 200, //$('#kap').val(),
					"KeepAliveMultiplier": 10, //$('#kam').val(),
					"SupresionSilencio": false, //$('#SupresionSilencio').prop('checked'),
					"PeriodoSupervisionSIP": $('#CbRUpdatePeriod').prop('checked') ? $('#TbUpdatePeriod').val() : '90'
				};
			$.ajax({type: 'PUT', 
					url: '/gateways/gtw',
					dataType: 'json', 
					contentType:'application/json',
					data: JSON.stringify( {
											"idConf" : $('#name').val(),
											"general" : { 
												"idCGW": $('#DivGateways').data('idCgw'),
												"name": $('#nameGw').val(),
												'emplazamiento': $('#IdSite').val(),	//$('#CBEmplazamiento option:selected').text(),
												"servicio": $("#ListServices option:selected").val(),
												"ipv": $('#ipv').val(),
												"ips": $('#ips').val(),
												"dualidad": $('#dual').prop('checked'),
												"cpus": cpus
											},
											"servicios": {
												"idSERVICIOS": $("#ListServices option:selected").val(),
												"sip": sip,
												"web": web,
												"snmp": snmp,
												"grab": grab,
												"sincr": sincr
											}
										}
					),
					success: function(data){
								if (data.error == 'ER_DUP_ENTRY'){
									alertify.error('Gateway \"'+ $('#nameGw').val() +'\" o dirección IP ya existe');
								}
								else{
									// Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
									if (f != null)
										f();

									GenerateHistoricEvent(ID_HW,MODIFY_GATEWAY_COMMON_PARAM,data.name,$('#loggedUser').text());
									alertify.success('Gateway \"'+data.name +'\" actualizada.');
									ShowSite($('#IdSite').val(),$('#IdSite').data('idSite'));
									GetGateways(null,function(){
										ShowHardwareGateway(data.idCGW,data.name);
									});
								}
							},
					error: function(data){
								alertify.error('Gateway \"'+ data.name +'\" ya existe.');
							}
					});		
		}
		else{
			// Antes de dar de alta una pasarela es necesario que esta tenga asignado un servicio
			/*if ($("#ListServices option:selected").val() == ""){
				alertify.error(mensaje);
				return;
			}*/
			//TODO ya no haria falta
			
			if ($('#nameGw').val() == ''){
				alertify.error(mensajeNoName);
				return;
			}
			
			if ($('#ipv').val() == ''){
				alertify.error(mensajeNoIp);
				return;
			}
			/*if ($('#ips').val() == ''){
				translateWord('ErrorIPServerConf',function(result){
						alertify.error(result);
				});
				return;
			}*/
		
			//Comprobar que se han introducido los datos de las CPU
			//CPU 0
			if ($('#ipb1').val() == ''){
				translateWord('ErrorIPCPU',function(result){
					alertify.error(result + " 0");
				});	
				return;
			}
			if ($('#ipg1').val() == ''){
					translateWord('ErrorIPGateway',function(result){
						alertify.error(result + " 0");
					});	
				return;
			}
			if ($('#msb1').val() == ''){
				translateWord('ErrorCPUMask',function(result){
						alertify.error(result + " 0");
				});
				return;
			}
				//CPU 1
			if ($('#dual').prop('checked')){
					if ($('#ipb2').val() == ''){
						translateWord('ErrorIPCPU',function(result){
							alertify.error(result + " 1");
						});	
						return;
					}
					if ($('#ipg2').val() == ''){
						translateWord('ErrorIPGateway',function(result){
							alertify.error(result + " 1");
						});	
						return;
					}
					if ($('#msb2').val() == ''){
						translateWord('ErrorCPUMask',function(result){
							alertify.error(result + " 1");
						});
						return;
					}	
			}
			var claveServicio=$('#name').val()+'-'+$('#nameGw').val();
			//La última parte es crear el servicio.
			var newService;
			EditNewService(claveServicio, function(newService) {
				if(!newService || newService == null) {
					alertify.error(mensajeServiceError);
					return;
				}
				else {
					/*****************/
					/*	POST Method  */
					/*****************/
					if ($('#dual').prop('checked')){
						cpus=[
							// CPU-1
							{ 	"num": 1,
								"tlan": 1,	//$('#Lan1 option:selected').val(),
								"ip0": $('#ip01').val(),
								"ms0": $('#ms01').val(),
								"ip1": $('#ip11').val(),
								"ms1": $('#ms11').val(),
								"ipb": $('#ipb1').val(),
								"msb": $('#msb1').val(),
								"ipg": $('#ipg1').val()},
							// CPU-2
							{ 	"num": 2,
								"tlan": 1,	//$('#Lan2 option:selected').val(),
								"ip0": $('#ip02').val(),
								"ms0": $('#ms02').val(),
								"ip1": $('#ip12').val(),
								"ms1": $('#ms12').val(),
								"ipb": $('#ipb2').val(),
								"msb": $('#msb2').val(),
								"ipg": $('#ipg2').val()}
						];
					}
					else{
						cpus = [{ 	"num": 1,
							"tlan": 1,	//$('#Lan1 option:selected').val(),
							"ip0": $('#ip01').val(),
							"ms0": $('#ms01').val(),
							"ip1": $('#ip11').val(),
							"ms1": $('#ms11').val(),
							"ipb": $('#ipb1').val(),
							"msb": $('#msb1').val(),
							"ipg": $('#ipg1').val()}
						];
					}
					
					// SERVICES
					// SIP
					sip = {"proxys":proxys,
						"registrars":registrars,
						"PuertoLocalSIP": 5060,
						"KeepAlivePeriod": 200, //$('#kap').val(),
						"KeepAliveMultiplier": 10, //$('#kam').val(),
						"SupresionSilencio": false, //$('#SupresionSilencio').prop('checked'),
						"PeriodoSupervisionSIP": $('#CbRUpdatePeriod').prop('checked') ? $('#TbUpdatePeriod').val() : '90'
					};
					// WEB
					web = {"wport": 8080,
						"stime": 0
					};
					snmp = {
						"agcomm": "public",
						"agcont": "NUCLEO-DF DT. MADRID. SPAIN",
						"agloc": "NUCLEO-DF LABS",
						"agname": "ULISESG5000i",
						"agv2": 1,
						"sport": 65000,
						"snmpp": 161,
						"traps":traps
					};
					
					$.ajax({type: 'POST',
						dataType: 'json',
						contentType:'application/json',
						url: '/gateways/gtw',
						data: JSON.stringify( {
							"idConf" : $('#name').val(),
							"general" : {
								"name": $('#nameGw').val(),
								'emplazamiento': $('#IdSite').val(),	//$('#CBEmplazamiento option:selected').text(),
								"ipv": $('#ipv').val(),
								"ips": $('#ips').val(),
								"dualidad": $('#dual').prop('checked'),
								"cpus": cpus
							},
							"servicios": { idSERVICIOS : newService.idSERVICIOS,
								"name":  newService.name,
								"sip": sip,
								"web": web,
								"snmp": snmp,
								"grab": grab,
								"sincr": sincr
							}
						}),
						success: function(data){
							if (data.error === null) {
								$('#DivGateways').data('idCgw',data.data.idCGW);
								// Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
								if (f != null)
									f(data.data.idCGW);
								
								GenerateHistoricEvent(ID_HW,ADD_GATEWAY,data.data.name,$('#loggedUser').text());
								alertify.success('Gateway \"' + data.data.name + '\" añadida.');
								ShowSite($('#IdSite').val(),$('#IdSite').data('idSite'));
								GetGateways(null,function(){
									ShowHardwareGateway(data.data.idCGW,data.data.name);
								});
							}
							else if (data.error == "ER_DUP_ENTRY") {
								alertify.error('Gateway \"' + $('#nameGw').val() + '\" o dirección IP ya existe');
							}
						},
						error: function(data){
							alertify.error('Gateway \"' + $('#nameGw').val() + '\" no existe');
						}
					});
				}
			});
				
		}
		
	});

};

var GetGateways = function(cfg,f) {
	translateWord('Gateways',function(result){
		$('#GatewaysH3').text(result);	
	});

	if (cfg == null){
		//$('#FormGateway').show();
		/*
		$.ajax({type: 'GET', 
				url: '/sites', 
				success: function(data){
					$("#CBEmplazamiento").empty();
				    var options = '<option value="" disabled selected>Select site name</option>';
					$.each(data.data, function(index, value){
						options += '<option value="' + value.idEMPLAZAMIENTO + '">' + value.name + '</option>';
					});
					$('#CBEmplazamiento').html(options);
				}
		});*/
		$.ajax({type: 'GET', 
				url: '/gateways', 
				success: function(data){
					$("#listGateways").empty();
					link_enlaces=[];
					$.each(data.general, function(index, value){
						link_enlaces[value.idCGW] = {idCFG: null, valor: value};
						var item = $('<li value=' + value.idCGW + '><a onclick="GetGateway(\'' + value.idCGW + '\',\'' + value.LastUpdate + '\')" draggable=false ondrop="ResourceChangeOfGateway(event,\'' + value.idCGW + '\',\'' + value.name + '\')" ondragover="allowDrop(event)">' + value.name + '</li>');
						if (value.Activa != null && value.Activa != 0){
							if (value.Sincro == 1)
								item.addClass('sincro');
							else
								item.addClass('active');
						}
						item.addClass('dropable')
							.appendTo($("#listGateways"));
					});
					$('#NewGateway').attr("onclick","GetGateway()");
					if (f != null)
						f();
				}
		});
	}
};

var GetGateway = function (gtw,lastUpdate,f){
//	if ($('#AddFormGateway').is(':visible')){
//			$('#DivGateways').animate({width: '145px'});
//		}
	totalRecursos=0;
	$('#AddFormGateway').show();
	$('#AddFormsite').animate({width: '790px', height: '410px'});
	$('#DivGateways').animate({width: '1015px'});
	$('#GeneralContent').show();
	$('#TableToolsGateway').show();
	
	$('#lips').hide();
	$('#ips').hide();
	$('#ExportGateway').show();
	
	if (gtw != null){
		var urlString = '/gateways/'+gtw;
		$.ajax({type: 'GET', 
				url: urlString, 
				success: function(gtw) {
					// Recoger el idCGW de la pasarela
					$('#DivGateways').data('idCgw',gtw.general.idCGW);
					
					$.ajax({type: 'GET',
						url: '/sites',
						success: function(data) {
							// Load Site list
							loadSiteList(data.data, gtw.general.EMPLAZAMIENTO_idEMPLAZAMIENTO);
						}
					});
					ReinitFormGateways();

					/* Si la función es llamada desde site form no se muestra FormGateway */
					//$('#FormGateway').show();
					//$("#AddFormGateway").show();
					//$('#AddFormsite').animate({width: '680px', height: '380px'});
					$('#RemoveGateway').show();

					$("#nameGw").val(gtw.general.name);
					$('#ipv').val(gtw.general.ipv);
					$('#ips').val(gtw.general.ips);
					$('#dual').prop('checked', gtw.general.dualidad);
					//$('#CBEmplazamiento option[value="' + gtw.general.EMPLAZAMIENTO_idEMPLAZAMIENTO + '"]').prop('selected', true);

					//GetServices(false);

					// CPU-0
					$('#ipg1').val(gtw.general.cpus[0].ipg);
					//$("#Lan1 option[value='" + gtw.general.cpus[0].tlan +"']").prop('selected',true);
					$('#bound1').prop('checked', !gtw.general.cpus[0].tlan);
					$('#ip01').val(gtw.general.cpus[0].ip0);
					$('#ms01').val(gtw.general.cpus[0].ms0);
					$('#ip11').val(gtw.general.cpus[0].ip1);
					$('#ms11').val(gtw.general.cpus[0].ms1);
					$('#ipb1').val(gtw.general.cpus[0].ipb);
					$('#msb1').val(gtw.general.cpus[0].msb);

					$('#lan11').hide();
					$('#lan21').hide();
					$('#nic1').show();

					if (gtw.general.cpus.length === 2){
						// CPU-1
						$('#lan12').hide();
						$('#lan22').hide();
						$('#nic2').show();

						//$("#Lan2 option[value='" + gtw.general.cpus[1].tlan +"']").prop('selected',true);
						$('#bound2').prop('checked', !gtw.general.cpus[1].tlan);
						$('#ip02').val(gtw.general.cpus[1].ip0);
						$('#ms02').val(gtw.general.cpus[1].ms0);
						$('#ip12').val(gtw.general.cpus[1].ip1);
						$('#ms12').val(gtw.general.cpus[1].ms1);
						$('#ipg2').val(gtw.general.cpus[1].ipg);
						$('#ipb2').val(gtw.general.cpus[1].ipb);
						$('#msb2').val(gtw.general.cpus[1].msb);
					}

					translateWord('Update',function(result){
						$('#UpdateGtwButton').text(result)
											.attr('onclick','UpdateGateway(function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})');
					});

					if (gtw.general.dualidad)
						$('#liCpu2').show();
					else
						$('#liCpu2').hide();

					// Reset .oldValue of input tags to check any changes
					ResetOldValue('GeneralContent');


					if (f != null)
						f();
				}
			});
	}
	else {
		$('#DivGateways').data('idCgw','');
		
		// $('#ListMenuGateways li:nth-child(2)').hide();
		// $('#ListMenuGateways li:nth-child(3)').hide();
		// $('#ListMenuGateways li:nth-child(4)').hide();
		GetServices(false);
		
		$('#DivComponents').attr('class','disabledDiv');
		//$('#FormGateway').show();
		$('#AddFormGateway').show();
		$('#NewGateway').show();
		translateWord('Gateways',function(result){
			$('#GatewaysH3').text(result);	// Titulo
		});
		//$('#ServicesFormGateway').hide();
		$('#BtnShowGateway').hide();
		$('#RemoveGateway').hide();
		//$('#TableToolsGateway').hide();
		ReinitFormGateways();
		$('#tab2').hide();
		$('#UpdateGtwButton').show();
		translateWord('Add',function(result){
			$('#UpdateGtwButton').text(result)
								.attr('onclick','PostGateway(function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})');
		});
		$('#nameGw').val('');
		$('#ipv').val('');
		$('#ips').val('');
		$('#lips').hide();
		$('#ips').hide();
		$('#dual').prop('checked', true);
		// CPU-0
		$('#lan11').hide();
		$('#lan21').hide();
		$('#nic1').show();

		//$("#Lan1 option[value='1']").prop('selected',true);
		$('#ip01').val('');
		$('#ms01').val('');
		$('#ip11').val('');
		$('#ms11').val('');
		$('#ipg1').val('');
		$('#ipb1').val('');
		$('#msb1').val('');
		// CPU-1
		//$('#lan12').hide();
		$('#liCpu2').show();
		$('#lan12').hide();
		$('#lan22').hide();
		$('#nic2').show();

		//$("#Lan2 option[value='1']").prop('selected',true);
		$('#ip02').val('');
		$('#ms02').val('');
		$('#ip12').val('');
		$('#ms12').val('');
		$('#ipg2').val('');
		$('#ipb2').val('');
		$('#msb2').val('');
		
		$('#ExportGateway').hide();
		var title = $('#TitleH3').text().split(" ");
		var aux = title[1].replace(".	Emplazamientos:", "-");
		var site = '<option value="">'+aux+title[2].replace(".	Pasarelas:", "")+'</option>';
		$('#ListSites').html(site);
	}
};

/*******************************************************************************/
/****** Function: AddGatewayToList											****/
/****** Description: Añade el idCgw a la lista de pasarelas modificadas o	****/
/****** 			 reset la lista si idCgw == null						****/
/****** Parameters: idCgw 													****/
/*******************************************************************************/
var AddGatewayToList = function(idCgw){
	if (idCgw == null){
		listOfGateways='';
		$.ajax({type: 'PUT', 
				url: '/configurations/listOfGateways/',
				dataType: 'json', 
				contentType:'application/json',
				data: JSON.stringify( {Gateway:idCgw} ),

				success: function(data){
						},
				error: function(data){
						}
		});
	}
	else{
		// Sólo si idCgw pertenece a la configuración activa...
		// Y no está ya en la lista
		if (listOfGateways.indexOf(idCgw) == -1){
			// Consultar las pasarelas que pertenecen a la configuracion activa y están vivas
			$.ajax({type: 'GET', 
				url: '/gateways/activeCfg/' + idCgw, 
				success: function(data){
					if (data){
						listOfGateways = listOfGateways.concat(idCgw + ',');
						$.ajax({type: 'PUT', 
								url: '/configurations/listOfGateways/',
								dataType: 'json', 
								contentType:'application/json',
								data: JSON.stringify( {Gateway:idCgw} ),

								success: function(data){
										},
								error: function(data){
										}
						});
					}
				}
			});
		}
	}
};

/***********************************************************************************/
/****** Function: AddGatewaysFromActiveToListOfGateways							****/
/****** Description: Añade todas las pasarelas de la configuración activa		****/
/****** 			 y vivas en el sistema a la lista de pasarelas a activar	****/
/****** Parameters: 	 														****/
/***********************************************************************************/
var AddGatewaysFromActiveToListOfGateways = function(idSite){
	$.ajax({type: 'GET', 
			url: '/gateways/activeCfg',
			success: function(data){
				$.each(data, function(index, value){
					if (idSite == null || value.EMPLAZAMIENTO_idEMPLAZAMIENTO == idSite)
						AddGatewayToList(value.idCGW);
				});
			}
		});
};

function UpdateGateway(f){
	var serviceId = $("#ListServices option:selected").val();
	if (serviceId != null){
		$.ajax({type: 'PUT',
					//url: '/gateways/' + $('#Component').text() + '/services/' + serviceId,
					url: '/gateways/' + $('#DivGateways').data('idCgw') + '/services/' + serviceId,
				success: function(data){
							//GetServices(false);
							PostGateway(f);
						},
				error: function(data){
							alertify.error('Error asignando servicio a gateway.');
						}
			});
	}
	else
		PostGateway(f);
}

var GoBackGateway = function(){
	$('#DivConfigurations').attr('class','fadeNucleo divNucleo');
	$('#FormGateway').hide();
	$("#AddFormGateway").hide();
};

var GetServices = function(resetContent){

	GetAllServices();
	//if ($('#UpdateGtwButton').text() === 'Add'){
	translateWord('Add',function(result){
		if (resetContent == true && 
			$('#UpdateGtwButton').text() === result){
			SelectFirstItem('ServicesFormGateway');
			// SIP Service
			RenderSipService(null,true);
		}
		else{
			// var urlString = '/gateways/' + $('#Component').text() + '/services';
			var urlString = '/gateways/' + $('#DivGateways').data('idCgw') + '/services';
			$.ajax({type: 'GET', 
					url: urlString, 
					success: function(gtw) {
						if (gtw.servicios != null){
							CurrentService = gtw.servicios;
							
							SelectServiceName(gtw.servicios.idSERVICIOS);

							SelectFirstItem('ServicesFormGateway');
							// SIP Service
							RenderSipService(gtw.servicios.sip,true);
							// WEB Service
							RenderWebService(gtw.servicios.web,false);
							// SNMP Service
							RenderSnmpService(gtw.servicios.snmp,false);
							// Recording Service
							RenderRecordingService(gtw.servicios.grab,false);
							// Sincronization Service
							RenderSincronizationService(gtw.servicios.sincr,false);
						}
						else
							$('#ServicesFormGateway')[0].reset();	
					},
					error: function(){
						$('#ServicesFormGateway')[0].reset();
					}
				});
		}
	});
};
/*
var UpdateSynchroStateInGateways = function(data){
	$.each(data.general,function(index,value){
		$("#listGateways li" ).each(function( index ) {
			if ($( this ).text() == value.name){
				if (value.Activa != null && value.Activa != 0){
					if (value.Sincro == 2)
						$( this ).prop('class','dropable sincro');
					else if (value.Sincro == 1)
						$( this ).prop('class','dropable apply');
					else if (value.Activa)
						$( this ).prop('class','dropable active');
				}
				else
					$( this ).prop('class','dropable');	
			}
		});
	})
}
*/
/*********************************/
/*** Asignar una pasarela libre **/
/*** a una configuración		**/
/*********************************/
function dropAssignedGateway(ev) {
    ev.preventDefault();
	var data = ev.dataTransfer.getData("itemDragging");

	if (link_enlaces_libres[data] != null){
		if (link_enlaces_libres[data].valor.Activa == -1 ||	// Puede que la pasarela esté en la lista de 'No Asignadas' pero aún no se haya activado la configuración.
			!isIpvIn(link_enlaces_libres[data].valor.ipv,link_enlaces)){
			ev.target.appendChild(document.getElementById(data));
			alertify.confirm('Ulises G 5000 R', "¿Desea mover la pasarela a esta configuración?",
				function() {
					$('.dropable').removeClass('target');
					postGatewayToConfig($('#idCFG').val(), data);
				},
				function(){
					alertify.error('Cancelado');
					ev.target.removeChild(document.getElementById(data));
				}
			);
		}
		else{
			translateWord('ErrorGatewayAlreadyAssigned',function(result){
				alertify.error(result);
			});
		}
	}
}

/*************************************/
/*** Liberar una pasarela asignada 	**/
/*** a una configuración			**/
/*************************************/
function dropFreeGateway(ev) {
	ev.preventDefault();
	$('.dropable').removeClass('target');
	
	var data = ev.dataTransfer.getData("itemDragging");
	if (link_enlaces[data] != null) {
		//document.getElementById(data).classList.remove('sincro');
		ev.target.appendChild(document.getElementById(data));
		deleteGatewayFromConfig(link_enlaces[data].idCFG, link_enlaces[data].valor.idCGW);
	}
}

/*******************************************/
/*** Liberar una slave asignada 		  **/
/*** a una pasarela						  **/
/*******************************************/
function SlaveFree(ev){
	var idCgw = $('#DivGateways').data('idCgw');

    ev.preventDefault();
    $('th.dropable').removeClass('target');

	var data = JSON.parse(ev.dataTransfer.getData("slaveDragging"));
	//ev.target.appendChild(document.getElementById(data));
	ReleaseSlaveFromGateway(idCgw, data.idSLAVES, data.rank);
}

/*******************************************/
/*** Asignar un recurso en otra slave     **/
/*** asignada a la misma pasarela 		  **/
/*******************************************/
function ResourceAssigned(ev,fila,columna){
	$('td.dropable').removeClass('target');
	$('li.dropable').removeClass('target');
	
	var slaveTo=$('.Slave'+columna).data('idSLAVE');

	var data = JSON.parse(ev.dataTransfer.getData("resourceDragging"));
	// Cloning data
	var dataFrom = JSON.parse(JSON.stringify(data));

	data.SLAVES_idSLAVES=slaveTo;
	data.rank=fila;

	$.ajax({type: 'PUT', 
			url: '/hardware/positions',
			dataType: 'json', 
			contentType:'application/json',
			data: JSON.stringify(data),
			success: function(data){
				if ($('.Res' + fila + columna).data('pos') != null){
					// El slot no está vacío. Se intercambian las posiciones
					var pos = $('.Res' + fila + columna).data('pos');
					dataFrom.idPOS = pos;
					
					$.ajax({type: 'PUT', 
							url: '/hardware/positions',
							dataType: 'json', 
							contentType:'application/json',
							data: JSON.stringify(dataFrom),
							success: function(data){
										GetAllSlaves();
									}
					});
				}
				else
					GetAllSlaves();
			}
	});
}

/*******************************************/
/*** Asignar un recurso en otra slave     **/
/*** asignada a otra pasarela 			  **/
/*******************************************/
function ResourceChangeOfGateway(ev,idCgw,nameCgw){
	//$('td.dropable').removeClass('target');
	$('li.dropable').removeClass('target');

	if ($('#DivGateways').data('idCgw') != idCgw){
		alertify.success('Recurso asignado a gateway \"' + nameCgw + '\"');

		dataOfResource = JSON.parse(ev.dataTransfer.getData("resourceDragging"));
		GetGateway(idCgw,'null',function(){
			$('#TabHw').click();
		});

	}
	else{
		$('td.dropable').removeClass('target');
		alertify.error('Recurso ya asignado a este gateway.');
	}
}
function ClickToChangeResourceOfGateway(fila,columna){
	if ($('#DivGateways').data('noSlaves')){
		alertify.error('Esta gateway no tiene asignados esclavos.');
	}
	else if (dataOfResource != null){
		$('td.dropable').removeClass('target');
	
		var slaveTo=$('.Slave'+columna).data('idSLAVE');
		var dataTo = JSON.parse(JSON.stringify(dataOfResource));
		dataTo.SLAVES_idSLAVES=slaveTo;
		dataTo.rank=fila;

		$.ajax({type: 'PUT', 
			url: '/hardware/positions',
			dataType: 'json', 
			contentType:'application/json',
			data: JSON.stringify(dataTo),
			success: function(data){
						if ($('.Res' + fila + columna).data('pos') != null){
							var pos = $('.Res' + fila + columna).data('pos');
							dataOfResource.idPOS = pos;
				
							$.ajax({type: 'PUT', 
									url: '/hardware/positions',
									dataType: 'json', 
									contentType:'application/json',
									data: JSON.stringify(dataOfResource),
									success: function(data){
												dataOfResource=null;
												GetAllSlaves();
											}
							});
						}
						else{
							dataOfResource=null;
							GetAllSlaves();
						}
					}
		});

	}
}

function allowDrop(ev) {
    ev.preventDefault();
}

function dragSlave(ev, rank, slave){
    ev.dataTransfer.setData("slaveDragging", JSON.stringify({idSLAVES: slave, rank: rank}));
//    $('th.dropable').addClass('target');
}

/*******************************************/
/*** Asignar una slave libre o asignada   **/
/*** en otra pasarela a una pasarela	  **/
/*******************************************/
function SlaveAssigned(ev, rank, idSlave) {
    ev.preventDefault();
    $('.dropable').removeClass('target');

    var idCgw = $('#DivGateways').data('idCgw');
    //var idSlave = '';
	var source={'idSlave': '', 'rank': ''};
	var target={'idSlave': '', 'rank': ''};

    //idSlave = ev.dataTransfer.getData("itemDragging");
    /*
    if (idSlave != ""){
    	//	Se asigna un slave desde la lista
    	// Si la posición está ocupada, esta se libera y luego se asigna
    	if (ev.target.id != "" && $('#'+ev.target.id).data('idSLAVE') != '')
    		ReleaseSlaveFromGateway(idCgw, $('#'+ev.target.id).data('idSLAVE'), rank);
    	
		AssigSlaveToGateway(idSlave, idCgw, rank);
	} 	
	else{
	*/
		// Se cambia la slave de slot (o intercambio de slave)
		source.idSlave=JSON.parse(ev.dataTransfer.getData('slaveDragging')).idSLAVES;
		source.rank=JSON.parse(ev.dataTransfer.getData('slaveDragging')).rank;
		target.idSlave=idSlave; //$('#'+ev.target.id).data('idSLAVE');
		target.rank=rank;

		PutSlaveFromGateway(target.rank,source.idSlave,idCgw);
		//if (target.idSlave != ""){
			// El slot destino está ocupado. => Intercambio de slaves
			PutSlaveFromGateway(source.rank,target.idSlave,idCgw);
		//}
		GetAllSlaves();
	//}
}


function dragResource(ev,idPos,rank,idSLAVES){
	ev.dataTransfer.setData("resourceDragging", JSON.stringify({"idPOS": idPos,
																"SLAVES_idSLAVES":idSLAVES,
																"rank":rank
																}
												)
	);

//	$('td.dropable').addClass('target');
//	$('li.dropable').addClass('target');
}

function dragGateway(ev) {
    ev.dataTransfer.setData("itemDragging", ev.target.id);
//    $('.dropable').addClass('target');
}

function modify(editText,select){
	$(editText).val($(select).val());
}

function AddProxy(){
	if($('#ProxysList')["0"].length != 2) {
		if ($('#ProxyEdit').val() != ''){
			alertify.success('Proxy añadido.');
			$('#ProxysList').append($('<option>',{
				text: $('#ProxyEdit').val()
			}));
		}
	}
	else
		alertify.error('Solo se pueden insertar dos proxies para este servicio.');
}

function RemoveProxy(){

	alertify.confirm('Ulises G 5000 R', "¿Eliminar el proxy \"" + $("#ProxysList option:selected").val() + "\"?", 
		function(){ 
			$("#ProxysList option:selected").remove();
			$('#ProxysList option:eq(1)');
			modify('#ProxyEdit','#ProxysList');

			//alertify.success('Ok'); 
		},
		 function(){ alertify.error('Cancelado');}
        );

}

function AddRegistrar(){
	if($('#RegistrarsList')["0"].length != 2) {
		if ($('#RegistrarEdit').val() != '') {
			alertify.success('Registrar añadido.');
			$('#RegistrarsList').append($('<option>', {
				text: $('#RegistrarEdit').val()
			}));
		}
	}
	else
		alertify.error('Solo se pueden insertar dos registrars para este servicio.');
}

function RemoveRegistrar(){

	alertify.confirm('Ulises G 5000 R', "¿Eliminar el registrar \"" + $("#RegistrarsList option:selected").val() + "\"?", 
		function(){ 
			$("#RegistrarsList option:selected").remove();
			$('#RegistrarsList option:eq(1)');
			modify('#RegistrarEdit','#RegistrarsList');
		},
		function(){ alertify.error('Cancelado');}
    );

}

function AddTrap(){
	if($('#TrapsList').length == 4 || $('#TrapsList')[0].childNodes.length == 4 ) {
		translateWord('ErrorNumberTrap',function(result){
			alertify.error(result);
		});
	}
	else {
		if ($('#TrapIP').val() != '' && $('#TrapPort').val() != ''){
			$('#TrapsList').append($('<option>',{
				text: $('#TrapVersion').val() + ',' + $('#TrapIP').val() + '/' + $('#TrapPort').val()
			}));
			$('#TrapIP').val('');
			$('#TrapPort').val('');
		}
		else{
			translateWord('ErrorAddingTrap',function(result){
				alertify.error(result);
			});
		}
	}
}

function RemoveTrap(){

	alertify.confirm('Ulises G 5000 R', "¿Eliminar trap \"" +  $("#TrapsList option:selected").val()  + "\"?", 
		function(){ 
			$("#TrapsList option:selected").remove();
			$('#TrapIP').val('');
			$('#TrapPort').val('');
		},
		 function(){ alertify.error('Cancelado');}
    );
}

function AddServer(){
	if ($('#ServerEdit').val() != ''){
		if ($('#NtpServersList option:eq(1)').text().length>0)
		{
			alertify.error("Superado el número máximo de servidores NTP. Se permiten dos.");
			$('#ServerEdit').val('');		
			return;
		}

		$('#NtpServersList').append($('<option>',{
			text: $('#ServerEdit').val()
		}));
	}
	$('#ServerEdit').val('');
}

function RemoveServer(){

	alertify.confirm('Ulises G 5000 R', "¿Eliminar el servidor NTP \"" + $("#NtpServersList option:selected").val()  + "\"?", 
		function(){ 
			$("#NtpServersList option:selected").remove();
			$('#ServerEdit').val('');
			$('#NtpServersList option:eq(1)');
			//alertify.success('Ok'); 
		},
		 function(){ alertify.error('Cancelado');}
        );

}

/*
function AddServiceName(serviceName, seleccionar){
	// Load service names list
    var options = '';
	options += '<option value="' + serviceName + '">' + serviceName + '</option>';

	$('#ListServices').html(options);
	if (seleccionar)
		$('#ListServices option:eq(1)');
}
*/

function OnClickUpdatePeriod(cb){
	$('#TbUpdatePeriod').prop('disabled',!cb.checked);
	//if (!cb.checked)
	//	$('#TbUpdatePeriod').val('');
}

function RenderSipService(sip,visible){
	
	if (visible){
		$('#AddFormsite').animate({width: '790px', height: '500px'});
		$('#SipServiceGateway').show();
	}
	else
		$('#SipServiceGateway').hide();

	if (sip == null) return;

	$('#PuertoLocalSIP').val(sip.PuertoLocalSIP);
	//$('#kap').val(sip.KeepAlivePeriod);
	//$('#kam').val(sip.KeepAliveMultiplier);
	//$('#SupresionSilencio').prop('checked',sip.SupresionSilencio);
	$('#CbRUpdatePeriod').prop('checked',sip.PeriodoSupervisionSIP != 0);
	$('#TbUpdatePeriod').prop('disabled',sip.PeriodoSupervisionSIP == 0);
	$('#TbUpdatePeriod').val(sip.PeriodoSupervisionSIP);

	// Load proxys list
    var options = '';
    for (var i = 0; i < sip.proxys.length; i++) {
    	if (sip.proxys[i].ip != "")
			options += '<option value="' + sip.proxys[i].ip + '">' + sip.proxys[i].ip + '</option>';
/*		if (i==0)
			$('#ProxyEdit').val(sip.proxys[i].ip);*/	
	}
	$('#ProxysList').html(options);
	$('#ProxysList option:eq(1)');

	// Load registrars list
    options = '';
    for (var j = 0; j < sip.registrars.length; j++) {
    	if (sip.registrars[j].ip !== "")
			options += '<option value="' + sip.registrars[j].ip + '">' + sip.registrars[j].ip + '</option>';
/*		if (i==0)
			$('#RegistrarEdit').val(sip.registrars[i].ip);*/
	}
	$('#RegistrarsList').html(options);
	$('#RegistrarsList option:eq(1)');
}

function loadSiteList(data, gtwSite){
	// Load proxys list
	$('#ListSites').empty();
	var options = '';
	for (var i = 0; i < data.length; i++) {
		if(data[i].idEMPLAZAMIENTO === gtwSite)
			options += '<option selected="true" value="' + data[i].idEMPLAZAMIENTO + '">' + data[i].nameCfg + '-' + data[i].name + '</option>';
		else
			options += '<option value="' + data[i].idEMPLAZAMIENTO + '">' + data[i].nameCfg + '-' + data[i].name + '</option>';
	}
	$('#ListSites').html(options);
	//$('#ListSites').refresh();
}

function RenderWebService(web,visible){
	if (visible)
		$('#WebServiceGateway').show();
	else
		$('#WebServiceGateway').hide();

	if (web == null) return;

	$('#wport').val(web.wport);
	$('#stime').val(web.stime);
}

function RenderSnmpService(snmp, visible){
	if (visible){
		$('#SnmpServiceGateway').show();
	}
	else
		$('#SnmpServiceGateway').hide();

	if (snmp == null) return;

	$('#agv2').prop('checked',snmp.agv2 == 1);
	OnChangeVersionSnmp();
	
	$('#agcomm').prop('enabled',snmp.agv2 == 1);
	if (snmp.agv2 == 1)
		$('#agcomm').val(snmp.agcomm);
	$('#snmpp').val(snmp.snmpp == null ? '65001' : snmp.snmpp);
	$('#sport').val(snmp.sport == null ? '161' : snmp.sport);
	$('#agcont').val(snmp.agcont);
	$('#agloc').val(snmp.agloc);
	$('#agname').val(snmp.agname);
	// Trap info
	$('#TrapsList').empty();
	// Load registrars list
    var options = '';
    if (snmp.traps != null){
	    for (var i = 0; i < snmp.traps.length; i++) {
	    	if (snmp.traps[i] != '')
				options += '<option value="' + snmp.traps[i] + '">' + snmp.traps[i] + '</option>';
		}
	}
	$('#TrapsList').html(options);
}

function RenderRecordingService(grab,visible){
	if (visible)
		$('#RecordingServiceGateway').show();
	else
		$('#RecordingServiceGateway').hide();

	if (grab == null) return;

	$('#rtsp_port').val(grab.rtsp_port);
	//$('#rtsp_uri').val(grab.rtsp_uri);
	$('#rtsp_ip').val(grab.rtsp_ip);
	//$('#rtp_tramas').prop('checked', grab.rtsp_rtp ? 1 : 0);
}

function RenderSincronizationService(sincr,visible){
	if (visible)
		$('#SincrServiceGateway').show();
	else
		$('#SincrServiceGateway').hide();

	if (sincr == null) return;

	// Load servers list
    var options = '';
    if (sincr.servidores != null && sincr.servidores.length > 0){
	    for (var i = 0; i < sincr.servidores.length; i++) {
	    	if (sincr.servidores[i].ip != "")
				options += '<option value="' + sincr.servidores[i].ip + '">' + sincr.servidores[i].ip + '</option>';
		}
		$('#NtpServersList').html(options);
		$('#NtpServersList option:eq(1)');
	}
}

function ReinitFormGateways(){
	$('#LblEmplazamiento').text($('#IdSite').val());

	SelectFirstItem('ListMenuGateways');	// Seleccionar primera opción del menú (General)
	SelectFirstItem('AddFormGateway');		// Seleccionar primera opción de CPUs
	$('#tab1').show();$('#tab2').hide();
	
	$('#ServicesFormGateway').hide();
	$('#HwFormGateway').hide();
	$('#ServicesFormGateway')[0].reset();
	//$('#CBEmplazamiento option:eq(0)').prop('selected', true);

	// Reset list of class: toReset
	$('.toReset')
    	.find('option')
    	.remove();
}

function SelectServiceName(name){
	$('#ListServices option[value="' + name + '"]').prop('selected', true);
}

function SelectFirstItem(form){
	var tabs=document.getElementById(form).getElementsByTagName("a");
	for (var i=0; i < tabs.length; i++){
		if(i == 0) 
			tabs[i].className="selected";
		else
			tabs[i].className="";
	}
}

function GetAllSlaves(){
	// Identificador de la pasarela
	// var idCgw = $('#DivGateways').data('idCgw');

	$.ajax({type: 'GET', 
			url: '/hardware', 
			success: function(data){
				ResetHardware();
				ShowAssignedSlaves(data);
			}
	});	
}

function ResetFiltering(){
	// Identificador de la pasarela
	var idCgw = $('#DivGateways').data('idCgw');

	/*
	$.ajax({type: 'GET', 
			url: '/hardware/site/' + $('#CBEmplazamiento option:selected').val(), 
			success: function(data){
				var groups=[];

				$('#LFiltering li:gt(0)').remove();
				$('#CBAll').prop('checked',true);

				if (data.hardware != null){
					$.each(data.hardware, function(index, value){
						// Gestión de grupos de esclavas
						if ($.inArray(value.nameOfGroup,groups) < 0){
							groups.push(value.nameOfGroup);
							var item = $("<li>" + value.nameOfGroup + "<input id='" + value.nameOfGroup + "' type='checkbox' style='float:right' onclick='ClickFilteringGroup(this)' disabled='disabled'></li>");
							item.appendTo($("#LFiltering"));
						}
					});
				}
			}
	});	
*/
}

function UpdateHardware(f){
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			$('.Res'+i+j).data('updated',false);
		}
	}

	if (f != null)
		f();
}

function UpdateAssignedSlaves(data){
	//var loadIndex = 0;//Indica el índice de carga de la pasarela
	var idCgw = $('#DivGateways').data('idCgw');
	// Se utiliza en el click de cambio de recurso entre pasarelas
	$('#DivGateways').data('noSlaves',true);

	if (data.hardware != null){
		$.each(data.hardware, function(index, value){
			if (idCgw != null && value.CGW_idCGW == idCgw){
				$('#DivGateways').data('noSlaves',false);
				//if ($('.Slave'+value.rank).data('idSLAVE') != value.idSLAVES)
				//{
					$('.Slave'+value.rank).data('idSLAVE',value.idSLAVES);

					//assignedSlaves.push(value.name);
					//$('.listHardware li').filter(function() { return $.text([this]) === value.name; }).remove();

					$('.Slave'+value.rank  + ' a:first-child').text(value.name)
															.attr('style','color:black')
															.attr('id',value.idSLAVES)
															.data('idSLAVE',value.idSLAVES);
					$('.Slave'+value.rank + ' a:first-child').text(value.tp=='0' ? 'IA4' : 'IQ1')
															.attr('style','color:black; font-size: 8px; margin-right: 0')
															.attr('id',value.idSLAVES)
															.data('idSLAVE',value.idSLAVES);

					$('.Slave'+value.rank).addClass('dragableItem occuped')
											.attr('draggable',true)
											.attr('ondrop',"SlaveAssigned(event," + value.rank + "," + value.idSLAVES + ")")
											.attr('ondragstart',"dragSlave(event," + value.rank + "," + value.idSLAVES + ")")
											.data('idSLAVE',value.idSLAVES);
					// Obtener los recursos de la slave
					$.ajax({type: 'GET', 
							url: '/hardware/' + value.idSLAVES, 
							success: function(data){
										//ShowResourcesFromSlave(value.idSLAVES,value.rank, data, function(){if ( i>=data.hardware.length && f != null) f()});
										//Este es el que lee constantemente
										ShowResourcesFromSlave(value.idSLAVES,value.rank, data, false, function(){
											for (var i = 0; i < 4; i++) {
												for (var j = 0; j < 4; j++) {
													if ($('.Res'+i+j).data('updated') == false){
														$('.Res' + i + j + ' a').text('')
																				.data('pos',null)
																				.data('idResource',null)
																				.attr('draggable',false)
																				.attr('ondragstart',"");
														//if(loadIndex>=totalRecursos)
														//	totalRecursos = loadIndex;
														$('.Res' + i + j).attr('onclick',"GotoResource('" + i + "','" + j + "',false" + ")");													}
												}
											}
										});
									}
					});
				//}
			}
		});
	}
}

function ResetHardware(f){
	//$(".listHardware").empty();
	//$('#SiteOfSlave').text($('#CBEmplazamiento option:selected').text())

	//$('#LFiltering li:gt(0)').remove();
	//$('#CBAll').prop('checked',true);

	$('#HardwareZone a').text('')
						.data('idSLAVE','');
	$('#HardwareZone th').removeClass('occuped')
						.attr('draggable',false)
						.data('idSLAVE','');

	// Reset data y attr de recursos
	if (dataOfResource == null){
		$('td.dropable').data('pos',null)
						.attr('draggable',false);
						//.attr('onclick','');
		for (var i=0; i<4; i++){
			$('.Slave'+i).removeClass('occuped');
		}

		for (var h = 0; h < 4; h++) {
			for (var j = 0; j < 4; j++) {
				$('.Res'+h+j).data('pos',null)
							.data('idResource',null)
							.attr('draggable',false)
							.attr('ondragstart',"")
							.attr('onclick',"GotoResource('" + h + "','" + j + "',false)");
			}
		}

		if (f != null)
			f();
	}
	else{
		for (var k = 0; k < 4;k++) {
			for (var m = 0; m < 4; m++) {
				$('.Res'+k+m).data('pos',null)
							.data('idResource',null)
							.attr('draggable',false)
							.attr('onclick',"ClickToChangeResourceOfGateway(" + k + "," + m + ")");
			}
		}

		if (f != null)
			f();
	}
}

function ShowAssignedSlaves(data){
	var idCgw = $('#DivGateways').data('idCgw');
	//var assignedSlaves=[];
	//var freeSlaves=[];
	//var groups=[];
	//var i=0;

	// Se utiliza en el click de cambio de recurso entre pasarelas
	$('#DivGateways').data('noSlaves',true);

	if (data.hardware != null){
		$.each(data.hardware, function(index, value){
			//i++;
			// Guardar idSLAVE en la columna correspondiente
			//$('.Slave'+value.rank).data('idSLAVE',value.idSLAVES);

			if (idCgw != null && value.CGW_idCGW == idCgw){
				$('#DivGateways').data('noSlaves',false);
				$('.Slave'+value.rank).data('idSLAVE',value.idSLAVES);

				//assignedSlaves.push(value.name);
				//$('.listHardware li').filter(function() { return $.text([this]) === value.name; }).remove();

				$('.Slave'+value.rank  + ' a:first-child').text(value.name)
														.attr('style','color:black')
														.attr('id',value.idSLAVES)
														.data('idSLAVE',value.idSLAVES);
				$('.Slave'+value.rank + ' a:first-child').text(value.tp=='0' ? 'IA4' : 'IQ1')
														.attr('style','color:black; font-size: 8px; margin-right: 0')
														.attr('id',value.idSLAVES)
														.data('idSLAVE',value.idSLAVES);

				$('.Slave'+value.rank).addClass('dragableItem occuped')
										.attr('draggable',true)
										.attr('ondrop',"SlaveAssigned(event," + value.rank + "," + value.idSLAVES + ")")
										.attr('ondragstart',"dragSlave(event," + value.rank + "," + value.idSLAVES + ")")
										.data('idSLAVE',value.idSLAVES);

				// Obtener los recursos de la slave
				$.ajax({type: 'GET', 
						url: '/hardware/' + value.idSLAVES, 
						success: function(data){
									//ShowResourcesFromSlave(value.idSLAVES,value.rank, data, function(){if ( i>=data.hardware.length && f != null) f()});
									 ShowResourcesFromSlave(value.idSLAVES,value.rank, true, data);//Aquí lee los 4 primeros slaves
									cicloCompleto++;
								}
				});
			}
			// else{
			// 	// Solo las tarjetas no asignadas a esta pasarela se muestran en la lista
			// 	if ($.inArray(value.name,assignedSlaves) < 0 &&
			// 		$.inArray(value.name,freeSlaves) < 0){
			// 		freeSlaves.push(value.name);
				
			// 		var clase="dragableItem";

			// 		if (value.CGW_idCGW != null)
			// 			clase="dragableItemOccuped";

			// 		var item = $("<li data-group='" + value.nameOfGroup + "'><div id='" + value.idSLAVES + "' class='" + clase + "' style='color:#bf2a36' draggable='true' ondragstart='dragGateway(event)'>" + value.name + "</li>");
			// 		item.appendTo($(".listHardware"));
			// 	}
			// }

			//i++;
		});
		//}
		//
	}
}

function ShowResourcesFromSlave(idSlave,slave, data, isFirstLoad, f){
	//var i = 0;
	//if(isFirstLoad && cicloCompleto == 0)
	//	alertify.error("Cargando datos... Por favor, espere para seleccionar los recursos.");
	/*if(cicloCompleto == 4){
		alertify.success("Datos cargados con éxito.");
		cicloCompleto = 0;
	}*/
		
		
	
	//Esto no termina de funcionar bien, ya que aún permite la edición aunque salga el mensaje
	//var loadIndex = 0;
	if (data.hardware != null && data.hardware.length > 0){
		$.each(data.hardware, function(rowIndex, r) {
			/*if(data.hardware[0].tipo === 0)
				loadIndex++;
			else
			{
				if(data.hardware[0].subtipo === 2 || data.hardware[0].subtipo === 3)
					loadIndex = loadIndex + 8;
				else
					loadIndex = loadIndex + 2;
			}*/
			
			var fila = r.P_rank;
			var col = slave;
			if (r.resource != null){
				if (dataOfResource == null){
					// Guardar idSLAVE en la columna correspondiente
					$('.Res' + fila + col).data('idResource',r.idRECURSO);
					$('.Res' + fila + col).data('updated',true);

					// No viene de una operacion de D&D sobre otra pasarela
					$('.Res' + fila + col)//.attr('onclick','GotoSlave(' + idSlave + ')')
									.data('pos',r.POS_idPOS)
									.attr('draggable',true)
									.attr('ondragstart',"dragResource(event," + r.POS_idPOS + "," + fila + "," + idSlave + ")")
									.attr('onclick',"GotoResource('" + fila + "','" + col + "',true" + ")");
									//.attr('onclick',"UpdateResource('" + idSlave + "','" + fila + "')");
				}
				else{
					$('.Res' + fila + col).data('idResource',-1);

					$('.Res' + fila + col).attr('onclick',"ClickToChangeResourceOfGateway(" + fila + "," + col + ")")
									.data('pos',r.POS_idPOS)
									.attr('draggable',false)
									.attr('ondragstart',"dragResource(event," + r.POS_idPOS + "," + fila + "," + idSlave + ")");
				}

				$('.Res' + fila + col + ' a').text(r.resource)
											.append(r.tipo == 1 ? $("<img src='/images/iconRadio.gif' style='float: right'/>")
																: $("<img src='/images/iconPhone.gif' style='float: right'/>"));
			}
		});
		//totalRecursos += loadIndex;
	}
	
	if (f != null)
		f();
}

function GotoSlave(idSLAVE){
	hidePrevious('#FormHardware','#BigSlavesZone','#DivHardware'); 
	GetHardware();
	GetSlave(idSLAVE);
}

function OnChangeVersionSnmp(){
	if ($('#agv2').prop('checked')){
		$('#agLabelComm').show();
		$('#agcomm').show();
	}
	else{
		$('#agLabelComm').hide();
		$('#agcomm').hide();
	}
}

function ClickFilteringGroup(item){
	$('.listHardware li').attr('style','display:none');
	$('#LFiltering li:gt(0)').find('input').prop('disabled',false);
	$.each($('#LFiltering input:checked'),function(index,value){
		if (value.id === 'CBAll'){
			$('.listHardware li').attr('style','display:list-item');
			$('#LFiltering li:gt(0)').find('input').prop('disabled','disabled');
			return false;
		}
/*		if (value.id === 'CBNone'){
			$('.listHardware li').attr('style','display:none')
			return false;
		}
*/
		$.each($(".listHardware li"),function(index,group){
			if ($(group).data('group')== value.id)
				$(group).attr('style','display:list-item');
		});
	});
}

function isIpvIn(ipv,lista){
	var array = $.map(lista, function(value, index) {
    	return [value];
	});

	for (var i = 0; i<array.length; i++){
		if (array[i] != null && array[i].valor.ipv == ipv)
			return true;
	}

	return false;
}

var ExportConfiguration = function(){
	var idGateway=$('#IdSite').data('gatewayId');
	var nameCfg=$('#DivConfigurations').data('cfgJson').name;

	$.ajax({
		type: 'PUT',
		url: '/configurations/export/' + idGateway + '/' + nameCfg,
		dataType: 'json', 
		contentType:'application/json',
		data: JSON.stringify( { ipGtw: $('#ipv').val() } ),

		success: function (data) {
			var myLink=document.createElement('a');
			myLink.download = data.idConf + '_' + data.general.name + '_' + data.fechaHora + '.json';
			myLink.href = "data:application/json," + JSON.stringify(data,null,'\t');
			myLink.click();
		},
		error: function(data){

		}
	});
};

var CloseImportConfiguration = function(){
	$('#ImportZone').animate({width: '0px', height: '0px'},500,function(){
		$('#ColumnImportZone').attr('style','display:none');
		$('#ImportZone').hide();
	
		$('#AddFormsite').removeClass('disabledDiv');
		$('#SitesList').removeClass('disabledDiv');
		$('#NavMenu').removeClass('disabledDiv');
		$('#NavConfiguration').removeClass('disabledDiv');
	});
};

var ImportConfiguration = function(){
	$('#AddFormsite').addClass('disabledDiv');
	$('#SitesList').addClass('disabledDiv');
	$('#NavMenu').addClass('disabledDiv');
	$('#NavConfiguration').addClass('disabledDiv');

	// Datos necesarios para realizar la importación
	$('#config').val($('#DivConfigurations').data('idCFG'));
	$('#site').val($('#IdSite').data('idSite'));
	$('#cfgData').val(JSON.stringify($('#DivConfigurations').data('cfgJson')));
	

	$('#ColumnImportZone').attr('style','display:inline');
	$('#ImportZone').attr('style','position:absolute;width:0px;height:0px;top:180px;left:460px;display:inline-table');
	$('#ImportZone').animate({width: '35%', height: '195px'},500,function(){
		$('#ImportZone').addClass('divNucleo');
	});

};
