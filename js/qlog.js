/**
 * jQuery 'exists' function.
 */
jQuery.fn.exists = function() {
	return this.length > 0;
};

/**
 * underscore additional functions.
 */
_.mixin({ 
			capitalize: function(string) { 
				return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase(); 
			},
			isError: function(object) {
				return object instanceof Error;
			}
		}); 

/**
 * Quick logging to screen.
 * @param {String} message the message to write.
 * @param {Object} options the optional options,
 * 	see “Default options” below.
 *
 * See “Span styles” to tweak ‘xray’ colors.
 */
function qlog(message, options) {
	// Default options.
	var opt = {
		title: '',	//add title
		xray:   true,	//false to use value
		sort:   false,	//true to sort arrays
		sortBy: null,	//set to sort objects by ‘arg’
		colFun: false,	//colorize functions (BETA)
		test:   false 	//export some private functions for unit testing
	};
	_.extend(opt, options);

	// Constants.
	var CR = '<br>';
	var TAB = '&nbsp;&nbsp;&nbsp;';
	var STRING    = {OPEN_CHAR: '“', CLOSE_CHAR: '”', valueOf: function() {return 'string';}};
	var ARRAY     = {OPEN_CHAR: '[', CLOSE_CHAR: ']', valueOf: function() {return 'array';}};
	var OBJECT    = {OPEN_CHAR: '{', CLOSE_CHAR: '}', valueOf: function() {return 'object';}};
	var ERROR     = {valueOf: function() {return 'error';}};
	var FUNCTION  = {valueOf: function() {return 'function';}};
	var NUMBER    = {valueOf: function() {return 'number';}};
	var NULL      = {valueOf: function() {return 'null';}};
	var UNDEFINED = {valueOf: function() {return 'undefined';}};

	// Run init if first time use.
	if (!$('#screenlogArea').exists()) {
		init();
	}

	// Write log.
	var time = moment().format('hh:mm:ss.SSS');
	var caller = arguments.callee.caller;
	caller = (!caller) ? '' : caller.name + '(): ';
	if (opt.xray) {
		message = xray(message);
	}
	title = _.isEmpty(opt.title) || _.isNull(opt.title) ? '' : addSpan(_.capitalize(opt.title), 'title') + CR  + addIndent(5);

	$('<p>')
		.html('[' + time + '] ' + caller + title + message)
		.appendTo('#screenlogArea');

	/**
	 * Creates html divs to write logs to.
	 */
	function init() {
		$("<style>")
			.prop("type", "text/css")
			//Span styles:
			.html("\
				.qlog-array {color: darkgreen;}\
				.qlog-object {color: darkblue;}\
				.qlog-string {color: black;}\
				.qlog-number {color: black;}\
    			.qlog-true {color: green;}\
				.qlog-false {color: red;}\
				.qlog-error {color: red;}\
				.qlog-function {color: blue;}\
				.qlog-null {color: darkred;}\
				.qlog-undefined {color: darkred;}\
				.qlog-title {font-weight: bold; font-size: 1.1em; font-family: 'san serif';}\
				.qlog-btn {background-color: #ededef; border: thin #ddd solid; border-radius: 5px;}\
    			}")
			.appendTo("head");

		var fullSize = $('body').width() * 0.8;
		var compactSize = fullSize * 0.3;
		var compactLog = false;
		$('<div>')
			.prop('id', 'screenlogContainer')
			.css({   
					 'font-family': ['Lucida Console', 'Courier', 'Courier New', 'monospace'],
					 background:'#efefef',
					 border:'1px solid silver',
					 padding:'5px',
					 top:'0px',
					 position:'absolute',
					 right:'0px',
					 width:fullSize
				 })
			.click(function() { 
					   $("#screenlogArea").slideToggle("slow"); 
					   $('#screenlogHdr').html('<span class="qlog-btn">' + (compactLog ?'[&minus;]': '[&plus;]') + '</span> qlog:');
					   $(this).animate({width:compactLog ?fullSize: compactSize}, "slow");
					   compactLog = !compactLog;
				   })
			.appendTo('body');

		$('<h2>')
			.prop('id', 'screenlogHdr')
			.html('<span class="qlog-btn">[&minus;]</span> qlog:')
			.appendTo('#screenlogContainer');

		$('<div>')
			.prop('id', 'screenlogArea')
			.css({
					 background:'#dedede',
					 border:'1px solid silver',
					 borderRadius:'5px',
					 padding:'5px'})
			.appendTo('#screenlogContainer');
	}


	/**
	 * Encode text for html consumption.
	 */
	function encode(text, level) {
		return text
			.replace(/\</g, '&lt;')
			.replace(/\n/g, CR + addIndent(level));
	} //end encode()

	/**
	 * Adds spacing to indent text.
	 */
	function addIndent(indentLevel) {
	    var indentBuffer = '';
	    _.times(indentLevel, function(n) {indentBuffer += TAB;});
		return indentBuffer;
	} //end indent()

	/**
	 * Adds tag span and class to text.
	 */
	function addSpan(text, classid) {
		if (_.isUndefined(classid)) {
			classid = text;
		}
		return '<span class="qlog-' + classid + '">' + text + '</span>';
	}

    function xray(sourceObject, indentWidth) {
        if (_.isUndefined(indentWidth)) {
			indentWidth = 5;
		}

		var xrayBuffer = '';
		var keys = [];

	    if (_.isError(sourceObject)) {
			//Work-around for Firefox which doesn't
			//  include name and message in stack.
			if (sourceObject.stack.charAt(0) === '@') {
				opt.title = addSpan(sourceObject.name + ': ' + sourceObject.message, 'error');
			}
		    return addSpan(encode(sourceObject.stack, indentWidth), ERROR);
		}

		if (_.isNull(sourceObject)) {
		    return addSpan(NULL);
		}

		if (_.isUndefined(sourceObject)) {
		    return addSpan(UNDEFINED);
		}

		if (_.isString(sourceObject)) {
		    return addSpan(STRING.OPEN_CHAR + encode(sourceObject, indentWidth) + STRING.CLOSE_CHAR, STRING);
		}

		if (_.isNumber(sourceObject)) {
		    return addSpan(sourceObject, NUMBER);
		}

		if (_.isBoolean(sourceObject)) {
		    return addSpan(sourceObject, !!sourceObject);
		}

		function colorize_function(func) {
			var c = {
				OPERAND:  'blue',
				RESERVED: 'blue',
				TEXT:     'red',
				COMMENT:  'green',
				LN: 'darkgray'
			};

			function span(string, color) {
				return '<span style="color: ' + color + '">' + string + '</span>';
			}

			var buffer = String(func)
				.replace(/\</g, '&lt;')
				.replace(/"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/g, function (x) {return span(x, c.TEXT);})
				.replace(/'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'/g, function (x) {return span(x, c.TEXT);})
				.replace(/\b(function|return|if|var|else|this)\b/g, function (x) {return span(x, c.RESERVED);})
				.replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, function (x) {return span(x, c.COMMENT);});
			
			buffer = buffer.split('\n');
			for (var i=0; i < buffer.length; i++) {
				buffer[i] = span(('00' + (i + 1)).slice(-3), c.LN) + ' ' + (buffer[i]);
			}
			return '<br><pre>' + buffer.join('<br>') + '</pre>';
		}

		if (_.isFunction(sourceObject)) {
			if (opt.colFun) {
				return colorize_function(sourceObject);
			}
		    else {
				return addSpan(encode(sourceObject.toString(), indentWidth), FUNCTION);
			}
		}

		if (_.isObject(sourceObject) && !_.isNull(opt.sortBy)) {
			sourceObject = _.sortBy(sourceObject, opt.sortBy);
		}

		function addArrayElement(arg) {
		    xrayBuffer += addIndent(indentWidth) 
				+ xray(arg, indentWidth);
		}

		function addArrayElementInitial(arg) {
			addArrayElement(arg);
			xrayBuffer += ',' + CR;
		}

		if (_.isArray(sourceObject)) {
			if (_.isEmpty(sourceObject)) {
				return addSpan(ARRAY.OPEN_CHAR + ARRAY.CLOSE_CHAR, ARRAY);
			}
			if (opt.sort) {
				if (_.isNumber(sourceObject[0])) {
					sourceObject.sort(function(a, b) {return a - b;});
				}
				else {
					sourceObject.sort();
				}
			}
			indentWidth++;
		    xrayBuffer += ARRAY.OPEN_CHAR + CR;
			_.each(_.initial(sourceObject), addArrayElementInitial);
			addArrayElement(_(sourceObject).last());
			xrayBuffer += CR + addIndent(--indentWidth) + ARRAY.CLOSE_CHAR;
			return addSpan(xrayBuffer, ARRAY);
		}

		function addObjectElement(arg) {
			xrayBuffer += addIndent(indentWidth) 
				+ STRING.OPEN_CHAR + arg + STRING.CLOSE_CHAR + ':' 
				+ xray(sourceObject[arg], indentWidth);
		}

		function addObjectElementInitial(arg) {
			addObjectElement(arg);
			xrayBuffer += ',' + CR;
		}

		if (_.isObject(sourceObject)) {
			if (_.isEmpty(sourceObject)) {
				return addSpan(OBJECT.OPEN_CHAR + OBJECT.CLOSE_CHAR, OBJECT);
			}
			keys = _(sourceObject).keys();
			indentWidth++;
		    xrayBuffer += OBJECT.OPEN_CHAR + CR;
			_.each(_.initial(keys), addObjectElementInitial);
			addObjectElement(_.last(keys));
			xrayBuffer += CR + addIndent(--indentWidth) + OBJECT.CLOSE_CHAR;
			return addSpan(xrayBuffer, OBJECT);
		}
	} //end xray()

	/* for unit testing */
	//Based on idea borrowed from 
	//  http://philipwalton.com/articles/how-to-unit-test-private-functions-in-javascript/
	if (opt.test) {
		var api = {__test__:{}};
		api.__test__.ARRAY  = ARRAY;
		api.__test__.OBJECT = OBJECT;
		api.__test__.TAB    = TAB;
		api.__test__.STRING = STRING;
		api.__test__.addIndent = addIndent;
		api.__test__.xray      = xray;
		return api;
	}
	/* end for unit testing */

} //end qlog()
