var langs = ['en', 'es'];
var langCode = '';
var langJS = null;

/** */
var dictionary = [];

var translate = function (jsdata)
{	
	$("[tkey]").each (function (index)
	{
		var strTr = jsdata [$(this).attr ('tkey')];
	    $(this).html (strTr);
	});
}

var translateWord = function (key,translate){
	var strTr = '';
	var lang = navigator.languages[0].substr (0, 2);
	if (langs.indexOf(lang)>=0) {
		/** 20170529 AGL. Para que no se pida continuamente el fichero de traduccion */
		if (dictionary.length == 0) {
			$.getJSON('lang/'+lang+'.json', function(result){
				dictionary = result;
			    translate(result[key]);
			});
		}
		else {
			translate(dictionary[key]);
		}
		/**************************************/
	}
}

var translateForm = function (){
	//langCode = navigator.language.substr (0, 2);
	console.log("translateForm");
	langCode = navigator.languages[0].substr (0, 2);

	/** 20170529. AGL. Para que no se pida continuamente el fichero de traduccion */
	var langFile = langs.indexOf(langCode)>=0 ? ('lang/'+langCode+'.json') : 'lang/en.json';
	if (dictionary.length == 0) {
		$.getJSON(langFile, function(result) {
			dictionary = result;
			translate(result);
		});
	}
	/*if (langs.indexOf(langCode)>=0)
		$.getJSON('lang/'+langCode+'.json', translate);
	else
		$.getJSON('lang/en.json', translate);
	*************/
}
