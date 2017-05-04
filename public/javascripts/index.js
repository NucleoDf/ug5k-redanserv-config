var ACCESS_SYSTEM_OK						=	50;
var ACCESS_SYSTEM_FAIL						=	51;
var ADD_USER								=	52;
var REMOVE_USER								= 	53;
var MODIFY_USER								=	54;
var USER_LOGOUT_SYSTEM						=	55;
var LOAD_REMOTE_CONFIGURATION				=	105;
var LOAD_REMOTE_CONFIGURATION_FAIL			= 	106;
var ADD_GATEWAY								=	107;
var REMOVE_GATEWAY							=	108;
var MODIFY_GATEWAY_COMMON_PARAM				=	109;
var MODIFY_ATS_ROUTES						=	110;
var ADD_IA4_SLAVE							=	111;
var REMOVE_IA4_SLAVE						=	112;
var ADD_HARDWARE_RESOURCE					=	113;
var REMOVE_HARDWARE_RESOURCE				=	114;
var MODIFY_HARDWARE_RESOURCE_PARAM			=	115;
var MODIFY_HARDWARE_RESOURCE_LOGIC_PARAM	=	116;
var REMOVE_CALIFICATION_AUDIO_TABLE			=	117;

var ID_HW	=	'CFG';

var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.2.min.js';
script.type = 'text/javascript';

function SetCookie(name, value){
	if ($('#BodyRedan').data('logintimeout') != '0'){
	  var now = new Date();
	  var time = now.getTime();
	  var expireTime = time + $('#BodyRedan').data('logintimeout')*60*1000;	// min*seg*msg
	  now.setTime(expireTime);
	  
	  document.cookie = name + '=' + value + ';expires='+now.toGMTString()+';path=/';
	  checkCookie=true;
	}
}

function ResetAfterImport(datos){
	var data = JSON.parse(datos);

	$('#loggedUser').text(data.user);
	$('#BodyRedan').data('perfil',data.perfil);
	$('#BodyRedan').data('LoginTimeout',data.LoginTimeout);
	$('#BodyRedan').data('region',data.Region);
	$('#BodyRedan').data('urlbackupservice',data.BackupServiceDomain);
	$('#BodyRedan').data('actualLocation',window.location.href);
	
	// Fijar region en el titulo
	SetRegion();
	// Register cookie
	SetCookie('U5K-G',data.perfil);

	// Hidden fields to render import.jade
	$('#user').val(data.user);
	$('#clave').val(data.clave);
	$('#perfil').val(data.perfil);

	$('#ImportResult').hide();
	$('#MenuOpciones').attr('style','display:table-cell;width:11%');
	translateWord('Activate',function(result){
		if ($('#listaOpciones li:nth-last-child(2)').text() != result){
			var item = $('<li style="margin-top:100px"><a id="opcionAplCambios" onclick="CheckingAnyChange(\'GeneralContent\', function(){GetActiveCfgAndActivate()})">' + result + '</li>');
			item.insertBefore($('#listaOpciones li:last-child'));
		}
	});
	EnableOptions(data.perfil);

	// Reinit layout.jade variables
	actual = '#FormConfiguration';
	actualShow = '#AddFormConfiguration';
	actualAnimate = '#DivConfigurations';

	$('#DivConfigurations').animate({height: '670px'});
	GetConfigurations(function(){
		ShowCfg(JSON.parse(data.cfgData));
	});
}

function getAuthenticatedUser(data){
	var index = data.toString().indexOf('.');

	if(index > -1)
        return data.toString().substring(index+1);
	else
		return "";
}

function myEncode(e){
	e.preventDefault();
	

	$('#BodyRedan').data('actualLocation',window.location.href);

	// Reconocer usuario puerta atrás
	if ($('#Operador').val() == "ULISESG5000R" && 
		window.btoa($('#TextClave').val()) == "KlVHNUtSKg=="){

		GenerateHistoricEvent(ID_HW,ACCESS_SYSTEM_OK,$('#Operador').val());
		$('#Login-Operador').hide();
		$('#loggedUser').text($('#Operador').val());
		$('#MenuGeneral').attr('style','display:table-cell;width:11%');
		//$('#MenuOpciones').attr('style','display:table-cell;width:11%')
		//$('#MenuMantenimiento').attr('style','display:table-column')
		$('#BodyRedan').data('perfil',64);
		$('#BodyRedan').data('LoginTimeout',0);
		$('#BodyRedan').data('region',$('#Login-Operador').data('region'));
		$('#BodyRedan').data('urlbackupservice',$('#Login-Operador').data('urlbackupservice'));

		// Hidden fields to render import.jade
		$('#user').val($('#Operador').val());
		$('#clave').val("KlVHNUtSKg==");
		$('#perfil').val(64);
	}
	else{
		$('#Clave').val(window.btoa($('#TextClave').val()));
		$.ajax({type: 'GET', 
			url: '/users?name=' + $('#Operador').val() + '&clave=' + $('#Clave').val(),
			error: function(jqXHR, textStatus, errorThrown ){
						//alert('Error user login.' + textStatus + '.' + errorThrown)
						alertify.alert('Ulises G 5000 R', 'Error user login.' + textStatus + '.' + errorThrown);
						alertify.error('Error user login.' + textStatus + '.' + errorThrown);
					},
			success: function(usuario){
					if (usuario === "User not found."){
						$('#LoginIncorrect').show();
						GenerateHistoricEvent(ID_HW,ACCESS_SYSTEM_FAIL,$('#Operador').val());
						return;
					}
					if(usuario.alreadyLoggedUserName !== "none") {
                            $('#AlreadyLogin').show();
                            $('#UserAlreadyLogin').show();
                            $('#UserAlreadyLogin').text(': '+usuario.alreadyLoggedUserName);
                            GenerateHistoricEvent(ID_HW, ACCESS_SYSTEM_FAIL, $('#Operador').val());
                            return;
                    }

					var perfilVisualizacion        = ((usuario.perfil & 1)   ?true:false);
					var perfilMando                = ((usuario.perfil & 2)   ?true:false);
					var perfilReconAlarmas         = ((usuario.perfil & 8)   ?true:false);
					var perfilGestUsuarios         = ((usuario.perfil & 16)  ?true:false);
					var perfilAdministracion       = ((usuario.perfil & 64)  ?true:false);
					var perfilVerLocalGateway      = ((usuario.perfil & 128) ?true:false);
					var perfilAdminLocalGateway    = ((usuario.perfil & 256) ?true:false);
					var perfilHistoricos           = ((usuario.perfil & 512) ?true:false);
					var perfilBackup               = ((usuario.perfil & 1024)?true:false);
					var perfilBocina               = ((usuario.perfil & 2048)?true:false);
					var perfilGestionConfLocal     = ((usuario.perfil & 4096)?true:false);
					var perfilActualizacionSw      = ((usuario.perfil & 8192)?true:false);
					var perfilConfiguraciones      = ((usuario.perfil & 16384)?true:false);
					var perfilCargaConfiguraciones = ((usuario.perfil & 32768)?true:false);

					if ((perfilMando || perfilReconAlarmas || perfilVerLocalGateway || perfilAdminLocalGateway || perfilBocina || perfilGestionConfLocal || perfilActualizacionSw) &&
						(!perfilVisualizacion && !perfilGestUsuarios && !perfilAdministracion && !perfilHistoricos && !perfilBackup && !perfilConfiguraciones &&
						 !perfilCargaConfiguraciones)){

						$('#LoginIncorrect').show();
						GenerateHistoricEvent(ID_HW,ACCESS_SYSTEM_FAIL,$('#Operador').val());
						return;
					}


					// Resto de perfiles de usuario

					$('#BodyRedan').data('perfil',usuario.perfil);
					$('#BodyRedan').data('LoginTimeout',$('#Login-Operador').data('LoginTimeout'));
					$('#BodyRedan').data('region',$('#Login-Operador').data('region'));
					$('#BodyRedan').data('urlbackupservice',$('#Login-Operador').data('urlbackupservice'));
					$('#BodyRedan').data('version',$('#Login-Operador').data('version'));
					GetVersion(true);//Obtiene la versión para el footer al ser primera carga
					
					GenerateHistoricEvent(ID_HW,ACCESS_SYSTEM_OK,$('#Operador').val());

					// Fijar region en el titulo
					SetRegion();
					
					// Register cookie
					SetCookie('U5K-G',usuario.perfil);
					
					$('#buttonLogout').show();
					
					// Hidden fields to render import.jade
					$('#user').val($('#Operador').val());
					$('#clave').val($('#Clave').val());
					$('#perfil').val(usuario.perfil);

					$('#Login-Operador').hide();
					$('#loggedUser').text(usuario.name);
				
					/*$('#MenuGeneral').addClass('menuListDisabled')
					$('#MenuOpciones ul li').addClass('menuListDisabled');
					$('.New').addClass('NotAllowedTd');
					$('.New *:first-child').addClass('NotAllowedBtn');
					*/
					var list = [
						{id: '#opcionConfig', text: $('#opcionConfig').text(), func: $('#opcionConfig').attr('onclick')},
						{id: '#opcionMant', text: $('#opcionMant').text(), func: $('#opcionMant').attr('onclick')},
						{id: '#opcionBackup', text: $('#opcionBackup').text(), func: $('#opcionBackup').attr('onclick')},
						{id: '#opcionConfigs', text: $('#opcionConfigs').text(), func: $('#opcionConfigs').attr('onclick')},
						{id: '#opcionTabla', text: $('#opcionTabla').text(), func: $('#opcionTabla').attr('onclick')},
						{id: '#opcionConfig', text: $('#opcionUsuarios').text(), func: $('#opcionUsuarios').attr('onclick')},
						{id: '#opcionVersion', text: $('#opcionVersion').text(), func: $('#opcionVersion').attr('onclick')},
						{id: '#opcionHistoric', text: $('#opcionHistoric').text(), func: $('#opcionHistoric').attr('onclick')},
						{id: '#opcionEstadi', text: $('#opcionEstadi').text(), func: $('#opcionEstadi').attr('onclick')},
						{id: '#opcionPasarel', text: $('#opcionPasarel').text(), func: $('#opcionPasarel').attr('onclick')}
					];
				
					$('#MenuGeneral').attr('style','display:table-cell;width:11%');
					$('#MenuGeneral').removeClass('menuListDisabled')
					$('#MenuOpciones').removeClass('menuListDisabled');
				
					$('.New').addClass('NotAllowedTd');
					$('.New *:first-child').addClass('NotAllowedBtn');
				
					$('#opcionConfig').text('');
					$('#opcionConfig').attr('onclick', '');
					$('#opcionConfig').addClass('hide');
					$('#opcionMant').text('');
					$('#opcionMant').attr('onclick', '');
					$('#opcionMant').addClass('hide');
					$('#opcionBackup').text('');
					$('#opcionBackup').attr('onclick', '');
					$('#opcionBackup').addClass('hide');
					$('#opcionConfigs').text('');
					$('#opcionConfigs').attr('onclick', '');
					$('#opcionConfigs').addClass('hide');
					$('#opcionTabla').text('');
					$('#opcionTabla').attr('onclick', '');
					$('#opcionTabla').addClass('hide');
					$('#opcionUsuarios').text('');
					$('#opcionUsuarios').attr('onclick', '');
					$('#opcionUsuarios').addClass('hide');
					$('#opcionVersion').text('');
					$('#opcionVersion').attr('onclick', '');
					$('#opcionVersion').addClass('hide');
					$('#opcionHistoric').text('');
					$('#opcionHistoric').attr('onclick', '');
					$('#opcionHistoric').addClass('hide');
					$('#opcionEstadi').text('');
					$('#opcionEstadi').attr('onclick', '');
					$('#opcionEstadi').addClass('hide');
					$('#opcionPasarel').text('');
					$('#opcionPasarel').attr('onclick', '');
					$('#opcionPasarel').addClass('hide');
					
				
					if (perfilAdministracion){
						$('.New').removeClass('NotAllowedTd');
						$('.New *:first-child').removeClass('NotAllowedBtn');
						
						$('#opcionConfig').text(list[0].text);
						$('#opcionConfig').attr('onclick', list[0].func);
						$('#opcionConfig').removeClass('hide');
						$('#opcionMant').text(list[1].text);
						$('#opcionMant').attr('onclick', list[1].func);
						$('#opcionMant').removeClass('hide');
						$('#opcionBackup').text(list[2].text);
						$('#opcionBackup').attr('onclick', list[2].func);
						$('#opcionBackup').removeClass('hide');
						$('#opcionConfigs').text(list[3].text);
						$('#opcionConfigs').attr('onclick', list[3].func);
						$('#opcionConfigs').removeClass('hide');
						$('#opcionTabla').text(list[4].text);
						$('#opcionTabla').attr('onclick', list[4].func);
						$('#opcionTabla').removeClass('hide');
						$('#opcionUsuarios').text(list[5].text);
						$('#opcionUsuarios').attr('onclick', list[5].func);
						$('#opcionUsuarios').removeClass('hide');
						$('#opcionVersion').text(list[6].text);
						$('#opcionVersion').attr('onclick', list[6].func);
						$('#opcionVersion').removeClass('hide');
						$('#opcionHistoric').text(list[7].text);
						$('#opcionHistoric').attr('onclick', list[7].func);
						$('#opcionHistoric').removeClass('hide');
						$('#opcionEstadi').text(list[8].text);
						$('#opcionEstadi').attr('onclick', list[8].func);
						$('#opcionEstadi').removeClass('hide');
						$('#opcionPasarel').text(list[9].text);
						$('#opcionPasarel').attr('onclick', list[9].func);
						$('#opcionPasarel').removeClass('hide');
						return;
					}
					if (perfilVisualizacion || perfilConfiguraciones) {
						$('#MenuGeneral').attr('style','display:table-cell;width:11%');
						$('#MenuGeneral').removeClass('menuListDisabled');
						
						$('#opcionConfig').text(list[0].text);
						$('#opcionConfig').attr('onclick', list[0].func);
						$('#opcionConfig').removeClass('hide');
						$('#opcionConfigs').text(list[3].text);
						$('#opcionConfigs').attr('onclick', list[3].func);
						$('#opcionConfigs').removeClass('hide');
						
						if(perfilConfiguraciones) {
							$('.New').removeClass('NotAllowedTd');
							$('.New *:first-child').removeClass('NotAllowedBtn');
						}
					}
					
					if (perfilGestUsuarios){
						$('#MenuGeneral').attr('style','display:table-cell;width:11%');
						$('#MenuGeneral').removeClass('menuListDisabled');
						
						$('#opcionUsuarios').text(list[5].text);
						$('#opcionUsuarios').attr('onclick', list[5].func);
						$('#opcionUsuarios').removeClass('hide');
					}

					if (perfilHistoricos) {
						$('#MenuGeneral').attr('style','display:table-cell;width:11%');
						$('#MenuGeneral').removeClass('menuListDisabled');
						
						$('#opcionMant').text(list[1].text);
						$('#opcionMant').attr('onclick', list[1].func);
						$('#opcionMant').removeClass('hide');
						
						$('#opcionHistoric').text(list[7].text);
						$('#opcionHistoric').attr('onclick', list[7].func);
						$('#opcionHistoric').removeClass('hide');
						$('#opcionEstadi').text(list[8].text);
						$('#opcionEstadi').attr('onclick', list[8].func);
						$('#opcionEstadi').removeClass('hide');
					}
				
					if (perfilBackup) {
						$('#MenuGeneral').attr('style','display:table-cell;width:11%');
						$('#MenuGeneral').removeClass('menuListDisabled');
						
						$('#opcionBackup').text(list[2].text);
						$('#opcionBackup').attr('onclick', list[2].func);
						$('#opcionBackup').removeClass('hide');
					}
					
					
					//si es un perfil no controlado
					//$('#MenuGeneral').attr('style','display:table-cell;width:11%');
					//$('#MenuOpciones ul li').removeClass('menuListDisabled');

					return;


					/*	switch (usuario.perfil){
							case 1: 	// Visualizacion
								$('#MenuOpciones').attr('style','display:table-cell;width:11%');
								EnableOptions(usuario.perfil);
								$('.New').addClass('NotAllowedTd');
								$('.New *:first-child').addClass('NotAllowedBtn');
								$('.ActivateCfg').addClass('NotAllowedTd');
								$('.ActivateCfg *:first-child').addClass('NotAllowedBtn');
								break;
							case 16: 	// Gestion Usuarios
								$('#MenuOpciones').attr('style','display:table-cell;width:11%');
								EnableOptions(usuario.perfil);
								break;
							case 32: // perfil ingenieria
							case 64:
								$('#MenuGeneral').attr('style','display:table-cell;width:11%');
								EnableOptions(usuario.perfil);
								break;
					*/
						/*
						if (usuario.perfil >= 16) {
							// if ((usuario.perfil & 32) == 32){
							// 	$('#MenuOpciones').attr('style','display:table-cell;width:11%')
							// 	EnableOptions(usuario.perfil);
							// }
							// else{
								//$('#MenuGeneral').attr('style','display:table-cell;width:11%')
								$('#MenuOpciones').attr('style','display:table-cell;width:11%')
								EnableOptions(usuario.perfil);
							//}
						}
						else{
							if ((usuario.perfil & 4) == 4){
								// Solo mantenimiento
								hideMenu('#MenuHistoricos','#MenuMantenimiento'); 
								LoadGatewaysInActiveConfiguration()
							}
							else{
								//if ((usuario.perfil & 1) == 1){
									$('.New').addClass('NotAllowedTd');
									$('.New *:first-child').addClass('NotAllowedBtn')
								//}
								
								// Configuracion y administracion
								//$('#MenuOpciones').attr('style','display:table-cell;width:11%')
								EnableOptions(usuario.perfil);
							}
						}
						*/
					//}
			}
		});
	}
}

function EnableAplicarCambiosPerfil(perfil) {
	var perfilAdministracion 	= ((perfil & 64) ? true : false);
	var perfilCargaConfiguraciones = ((perfil & 32768)?true:false);
	
	if(perfilAdministracion || perfilCargaConfiguraciones)
		return true;
	else
		return false;
	
}
function EnableOptions(perfil){

	var perfilVisualizacion     = ((perfil & 1)   ?true:false);
	var perfilMando             = ((perfil & 2)   ?true:false);
	var perfilReconAlarmas      = ((perfil & 8)   ?true:false);
	var perfilGestUsuarios      = ((perfil & 16)  ?true:false);
	var perfilAdministracion    = ((perfil & 64)  ?true:false);
	var perfilVerLocalGateway   = ((perfil & 128) ?true:false);
	var perfilAdminLocalGateway = ((perfil & 256) ?true:false);
	var perfilHistoricos        = ((perfil & 512) ?true:false);
	var perfilBackup            = ((perfil & 1024)?true:false);

	
	/*if (perfilAdministracion){
		$('#MenuGeneral').attr('style','display:table-cell;width:11%');
		$('#MenuOpciones ul li').removeClass('menuListDisabled');	
		return;
	}

	if (perfilVisualizacion){
		$('#MenuOpciones ul li').removeClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(2)').addClass('menuListDisabled'); 
		return;
	}

	if (perfilGestUsuarios){
		//$('#MenuOpciones ul li').addClass('menuListDisabled');
		$('#MenuOpciones ul li').removeClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(1)').addClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(2)').addClass('menuListDisabled'); 
		$('#MenuOpciones ul li:nth-child(3)').removeClass('menuListDisabled'); // se cambia indice 3 por 2 para esconder tablaBSS
		return;
	}

	if (perfilVisualizacion){
		$('#MenuOpciones ul li').removeClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(2)').addClass('menuListDisabled'); 
		return;
	}

	$('#MenuOpciones ul li').removeClass('menuListDisabled');	*/
}