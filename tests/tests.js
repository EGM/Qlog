var api = qlog("qlog", "Unit Testing", {test:true}).__test__;

QUnit.test("indent", function(assert) {
			   assert.equal(api.indent(1), "\t");
		   });

QUnit.test("format string", function(assert) {
			   assert.equal(api.format("string"), "\"string\"");
		   }); //end format string

QUnit.test("format number", function(assert) {
			   assert.equal(api.format(Math.PI), Math.PI);
		   }); //end xray number

QUnit.test("format error", function(assert) {
			   assert.equal(
				   api.format(Error()),
				   "Error\n"
				   + "    at Error (native)\n"
				   + "    at Object.<anonymous> (http://" + location.hostname + ":8099/tests/tests.js:17:19)\n"
				   + "    at Object.Test.run (http://" + location.hostname + ":8099/tests/qunit-1.18.0.js:895:28)\n"
				   + "    at http://" + location.hostname + ":8099/tests/qunit-1.18.0.js:1024:11\n"
				   + "    at process (http://" + location.hostname + ":8099/tests/qunit-1.18.0.js:583:24)\n"
				   + "    at begin (http://" + location.hostname + ":8099/tests/qunit-1.18.0.js:628:2)\n"
				   + "    at http://" + location.hostname + ":8099/tests/qunit-1.18.0.js:644:4"
			   );
		   }); //end format error

QUnit.test("format function", function(assert) {
			   assert.equal(
				   api.format(function() {}), "function () {}");
		   }); //end format function

QUnit.test("format null", function(assert) {
			   assert.equal(api.format(null), "null");
		   }); //end format null

QUnit.test("format undefined", function(assert) {
			   var undefined;
			   assert.equal(api.format(undefined), "undefined");
		   }); //end format undefined

QUnit.test("format array", function(assert) {
			   assert.equal(api.format([]), "[]", "Empty array");
			   assert.equal(api.format([1]), "[\n\t1\n]", "One number");
			   assert.equal(api.format([1,3]), "[\n\t1,\n\t3\n]", "Two numbers");
			   assert.equal(api.format([1,3,2]), "[\n\t1,\n\t3,\n\t2\n]", "Three numbers");
		   }); //end format array

QUnit.test("format object", function(assert) {
			   assert.equal(api.format({}), "{}", "Empty object");
			   assert.equal(api.format({one:1}), "{\n\t\"one\":1\n}", "One number");
			   assert.equal(api.format({one:1,three:3}), "{\n\t\"one\":1,\n\t\"three\":3\n}", "Two numbers");
			   assert.equal(api.format({one:1,three:3,two:2}), "{\n\t\"one\":1,\n\t\"three\":3,\n\t\"two\":2\n}", "Three numbers");
		   }); //end format object

var api2 = qlog("qlog, sorted arrays", "Unit Testing", {test:true, isSorted:true}).__test__;

QUnit.test("format array, sorted", function(assert) {
			   assert.equal(api2.format([]), "[]", "Empty array");
			   assert.equal(api2.format([1]), "[\n\t1\n]", "One number");
			   assert.equal(api2.format([1,3]), "[\n\t1,\n\t3\n]", "Two numbers");
			   assert.equal(api2.format([1,3,20]), "[\n\t1,\n\t3,\n\t20\n]", "Three numbers");
			   assert.equal(api2.format([100,3,20]), "[\n\t3,\n\t20,\n\t100\n]", "Three numbers");
			   assert.equal(api2.format(["shiny","new","toy"]), "[\n\t\"new\",\n\t\"shiny\",\n\t\"toy\"\n]", "Three words");
		   }); //end format array, sorted

QUnit.test("format object, arrays sorted", function(assert) {
			   assert.equal(api2.format({}), "{}", "Empty object");
			   assert.equal(api2.format({one:[1]}), "{\n\t\"one\":[\n\t\t1\n\t]\n}", "One number");
			   assert.equal(api2.format({one:[10,3]}), "{\n\t\"one\":[\n\t\t3,\n\t\t10\n\t]\n}", "Two numbers");
			   assert.equal(api2.format({one:[1,3,2]}), "{\n\t\"one\":[\n\t\t1,\n\t\t2,\n\t\t3\n\t]\n}", "Three numbers");
		   }); //end format object, arrays sorted

var api3 = qlog("qlog, sorted objects", "Unit Testing", {test:true, sortBy:'name'}).__test__;

QUnit.test("format object, sort by name", function(assert) {
			   assert.equal(
				   api3.format([{name: 'moe', age: 50}, {name: 'larry', age: 60}, {name: 'curly', age: 40}]),
				   "[\n\t[\n\t\t40,\n\t\t\"curly\""
				   + "\n\t],\n\t[\n\t\t60,\n\t\t\"larry\""
				   + "\n\t],\n\t[\n\t\t50,\n\t\t\"moe\""
				   + "\n\t]\n]", "");
		   }); //end format object, sort by name

