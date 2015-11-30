/**
 * qlog.js
 * version : 0.1
 * author  : John LaDuke
 * license : MIT
 */

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
				return string.replace(/\b\S+\b/g, function(string) {return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();}); 
			},
			isError: function(object) {
				return object instanceof Error;
			}
		}); 

/**
 * Quick logging to screen.
 * @param {String} input the message to write.
 * @param {String} title the optional heading.
 * @param {Object} options the optional options,
 * 	see “Default options” below.
 */
function qlog(input, title, options) {
	
	// default options
	var option = {
		isFormatted: true, 	//TRUE to "unwrap" objects etc
		isSorted: false 	//TRUE to sort arrays using array[0] to select sorting type
	};
	_.extend(option, options);
	
	// init if first time use.
	if (!$('#qlog').exists()) {
		var fullSize = $(window).width() * 0.8;
		var compactSize = fullSize * 0.3;
		var compactLog = false;
		$("<div>")
			.prop("id", "qlogContainer")
			.click(function() { 
					   $("#qlog").slideToggle("slow"); 
					   $("#qlogHdr").html("<span class=\"button\">" + (compactLog ?"[&minus;]": "[&plus;]") + "</span> qlog:");
					   $(this).animate({width:compactLog ?fullSize: compactSize}, "slow");
					   compactLog = !compactLog;
				   })
			.appendTo("body");

		$('<h2>')
			.prop("id", "qlogHdr")
			.html("<span class=\"button\">[&minus;]</span> qlog:")
			.appendTo("#qlogContainer");

		$("<div>")
			.prop("id", "qlog")
			.appendTo("#qlogContainer");
	}

	function format(input, indentWidth) {
		if (_.isUndefined(indentWidth)) {
			indentWidth = 0;
		}

		var inputBuffer = "";
		var keys = [];

		function indent(indentLevel) {
			var indentBuffer = "";
			_.times(indentLevel, function(n) {indentBuffer += "\t";});
			return indentBuffer;
		} //end indent()

		if (_.isError(input)) {
			//Work-around for Firefox which doesn't
			//  include name and message in stack.
			if (input.stack.charAt(0) === '@') {
				title = "<span class=\"error\">" + input.name + ': ' + input.message + "</span>";
			}
			return input.stack;
		}

		if (_.isNull(input)) {
			return "null";
		}

		if (_.isUndefined(input)) {
			return "undefined";
		}

		if (_.isString(input)) {
			return "\"" + input + "\"";
		}

		if (_.isNumber(input)) {
			return input;
		}

		if (_.isBoolean(input)) {
			return input;
		}

		if (_.isFunction(input)) {
			return input;
		}

		function addArrayElement(el) {
			inputBuffer += indent(indentWidth) 
				+ format(el, indentWidth);
		}

		function addArrayElementInitial(el) {
			addArrayElement(el);
			inputBuffer += ",\n";
		}

		if (_.isArray(input)) {
			if (_.isEmpty(input)) {
				return "[]";
			}
			if (option.isSorted) {
				if (_.isNumber(input[0])) {
					input.sort(function(a, b) {return a - b;});
				}
				else {
					input.sort();
				}
			}
			indentWidth++;
			inputBuffer += "[\n";
			_.each(_.initial(input), addArrayElementInitial);
			addArrayElement(_(input).last());
			inputBuffer += "\n" + indent(--indentWidth) + "]";
			return inputBuffer;
		}

		function addObjectElement(el) {
			inputBuffer += indent(indentWidth) 
				+ "\"" + el + "\":" + format(input[el], indentWidth);
		}

		function addObjectElementInitial(el) {
			addObjectElement(el);
			inputBuffer += ",\n";
		}

		if (_.isObject(input)) {
			if (_.isEmpty(input)) {
				return "{}";
			}
			keys = _(input).keys();
			indentWidth++;
			inputBuffer += "{\n";;
			_.each(_.initial(keys), addObjectElementInitial);
			addObjectElement(_.last(keys));
			inputBuffer += "\n" + indent(--indentWidth) + "}";
			return inputBuffer;
		}
	} //end format()

	// Write log.
	if (typeof moment === "undefined") {
		var time = Date().toLocaleString();
	}
	else {
		var time = moment().format("hh:mm:ss.SSS");
	}
	var caller = arguments.callee.caller;
	caller = (!caller) ? "" : caller.name + "(): ";
	if (_.isNull(title) || _.isUndefined(title)) {
		title = "";
	} 
	else {
		title = _.capitalize(title);
	}
		
	if (option.isFormatted) {
		var message = "<pre class=\"brush: js;\">" + format(input) + "</pre>";
	}
	else {
		var message = (input).toString();
	}

	$("<p>")
		.html("[" + time + "] " + caller + "<span class=\"title\">" + title + "</span>\n" + message )
		.appendTo("#qlog");
		
	return title + "\n" + message;
} //end qlog()
