
var GetVersion = function(isFirstLoad) {
	$('#DivVersion').animate({width: '435px'});
	if(!isFirstLoad) {
		$("#AddFormVersion").show();
		$("#FormVersion").show();
	}
	$.ajax({type: 'GET',
			url: '/version'})
		.done(function(data){
			// $("#IdVersion").text(data.version);
			var strSubversion = data.subversion=='' ? ',  ' : ('.' + data.subversion + ',  ');
			$("#IdVersion").text(data.version + strSubversion + data.date  );
			$("#IdSubVersion").text(data.subversion);
			$("#IdVersionDate").text(data.date);
			$("#IdNodeJSVersion").text(data.nodejsversion);
			$("#IdMySQLVersion").text(data.mysqlversion);
			$("#listVersions").empty();
			$("#hVersion").text(data.version+' '+data.subversion);
			
			$.each(data.file, function(index, value){
				// var item = $("<br>Fichero: <b>"+value.Name+"</b><ul><li>MD5: "+value.md5.toUpperCase()+"</li>" +
					// "<li>Tamaño: "+value.fileSizeInBytes+" bytes</li><li>Fecha: "+value.date+"</li></ul>");
				var item = $("<p style='color:black';>" +
							 "<b>" + value.Name + "</b>" +
							 ", "  + value.date +
							 ", "  + value.fileSizeInBytes + ' bytes' +
//							 ", "  + value.md5.toUpperCase() +
							 "</p>"
							);
				item.appendTo($("#listVersions"));
			});
		});
}
