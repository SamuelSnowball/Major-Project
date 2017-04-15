//var module = require(["tests/temp"]); // works

	/*
	var rewire = require('rewire');

	Error: Module name "rewire" has not been loaded yet for context: _. Use require([])
	*/

	/*
	require(['rewire'], function (rewire) {
	   
	});

	Error: rewire.js 404 (Not Found)
	*/


	
function testHeightMap() {

	// Use the special '__get__' accessor to get your private function.
	//var private_foobar1 = terrain.__get__('private_foobar1');
	// test the variable
	console.log("ran m8");
}
	
testHeightMap();