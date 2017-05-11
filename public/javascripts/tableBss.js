/******************************************************************************************************/
/****** Module: tableBss.js												*******************************/
/****** Description: Módulo de soporte a la gestion de usuarios			*******************************/
/******************************************************************************************************/

var GetTablesBss = function(f) {
	/** 20170511 AGL PERFILES */
	if (Authorize($('#BodyRedan').data('perfil'),[ccAdminProfMsc,ccConfiProfMsc])==false) {
	/*if ((($('#BodyRedan').data('perfil') & 16) != 16) && (($('#BodyRedan').data('perfil') & 64) != 64)) {
		*****************************/
		alertify.error('No tiene asignados permisos para la gestión de las tablas de calificación de audio.');
		return;
	}

	$('#AddTableBss').hide();
	$("#FormTableBss").show();	
	$('#DivTableBss').animate({width: '535px'});

	$.ajax({type: 'GET', 
				url: '/tableBss'})
			.done(function(data){
				$("#listTablesBss").empty();
				if (data.tables != null && data.tables.length > 0){
					$.each(data.tables, function(index, value){
						var item = $("<li><a onclick='GetTable(" + value.idtabla_bss + ")'>" + value.name + "</li>");
						item.appendTo($("#listTablesBss"));
			   		});
			   		if (f != null)
			   			f();
				}
				else if (f != null)
					f();
		});
};

var GetTable = function (idTable){
	$('#DivTableBss').animate({width:'950px'});
	$('#AddTableBss').show();

	if (idTable != -1){
		$.ajax({
			type: 'GET',
			url: '/tableBss/' + idTable,
			success: function(data){
				if (data.tables != null){
					translateWord('Update',function(result){
						$('#UpdateTableButton').text(result)
												.attr('onclick','PutTable()');
					});
					$('#FormTableBss').data('idtabla_bss',data.tables[0].idtabla_bss);
					$('#IdTable').val(data.tables[0].name);
					$('#DescTable').val(data.tables[0].description);
					$('#RowCreationUser').show();
					$('#RowCreationDate').show();
					$('#RowModificationUser').show();
					$('#RowModificationDate').show();
					$('#LblCreationUser').text(data.tables[0].UsuarioCreacion);
					$('#LblCreationDate').text(data.tables[0].FechaCreacion);
					$('#LblModificationUser').text(data.tables[0].UsuarioModificacion);
					$('#LblModificationDate').text(data.tables[0].FechaModificacion);

					for (var i=0;i<data.tables.length;i++){
						$('#CbRssi'+i+' option[value="' + data.tables[i].valor_rssi + '"]').prop('selected', true);
					}
					$('#RowValuesTable').show();
				}
			}
		});
	}
	else{
		translateWord('Add',function(result){
			$('#UpdateTableButton').text(result)
									.attr('onclick','PostTable()');
		});
		$('#FormTableBss').data('idtabla_bss',null);
		$('#IdTable').val('');
		$('#DescTable').val('');
		$('#RowCreationUser').hide();
		$('#RowCreationDate').hide();
		$('#RowModificationUser').hide();
		$('#RowModificationDate').hide();
		$('#RowValuesTable').hide();
	}
};

var PostTable = function(){
	var listValues=[];
	for (var i=0;i<6;i++){
		listValues[i] = $('#CbRssi' + i + ' option:selected').val();
	}
	$.ajax({type: 'POST', 
			dataType: 'json', 
			contentType:'application/json',
			url: '/tableBss', 
			data: JSON.stringify( {
									name: $('#IdTable').val(),
									description: $('#DescTable').val(),
									UsuarioCreacion: $('#user').val(),
									UsuarioModificacion: $('#user').val(),
									TableValues: listValues
								}),
			success: function(data){
					if (data.error == null){
						if (data.idTable != null){
							alertify.success('Tabla de calificación ' + $('#IdTable').val() + ' generada.');
							GetTablesBss(function(){
								GetTable(data.idTable);
							});
						}
						else{
							alertify.error('Sobrepasado el número máximo de tablas de calificación');
						}
					}
			}
	});
};

var PutTable = function(){
	var listValues=[];
	for (var i=0;i<6;i++){
		listValues[i] = $('#CbRssi' + i + ' option:selected').val();
	}
	$.ajax({type: 'PUT', 
			dataType: 'json', 
			contentType:'application/json',
			url: '/tableBss', 
			data: JSON.stringify( {
									idtabla_bss: $('#FormTableBss').data('idtabla_bss'),
									name: $('#IdTable').val(),
									description: $('#DescTable').val(),
									UsuarioModificacion: $('#user').val(),
									TableValues: listValues
								}),
			success: function(data){
					alertify.success('Datos de la tabla \"' +  $('#IdTable').val() + '\" actualizados.');
					GetTablesBss(function(){
						GetTable($('#FormTableBss').data('idtabla_bss'));
					});
			}
	});
};

var DelTable = function(){
	alertify.confirm ('Ulises G 5000 R','¿Eliminar la tabla de calificación de audio ' + $('#IdTable').val() + '?',
		function(){
			$.ajax({type: 'DELETE', 
					url: '/tableBss/' + $('#FormTableBss').data('idtabla_bss'), 
					success: function(data){
							if (data.error == 'CANT_DELETE'){
								var mensaje = 'La tabla ' + data.TableName + 
											' está asignada al recurso [Recurso/Pasarela/Emplazamiento/Configuracion]: ' + data.ResourceName + '/' + 
											'/' + data.CgwName + 
											'/' + data.SiteName + 
											'/' + data.CfgName;
								alertify.alert(mensaje);
								alertify.error('No se puede eliminar una tabla asignada a un recurso');
							}
							else if (data.error == null){
								GenerateHistoricEvent(ID_HW,REMOVE_CALIFICATION_AUDIO_TABLE,$('#IdTable').val(),$('#loggedUser').text());
								alertify.success('Tabla \"' +  $('#IdTable').val() + '\" eliminada.');
								GetTablesBss();
							}
					}
			});
		}, 
		function(){ 
			alertify.error('Cancelado');
		}
	);
};
