(function($) {

	var x=0;
	var y=0;
	
	var body = $(document.body);
	
	document.body.style.backgroundImage = x + 'px' + ' ' + y + 'px';
	
	console.log("ran");
	
	window.setInterval(function(){
		//document.body.style.backgroundImage = x + 'px' + ' ' + y + 'px';
		body.css('background-position', '50px 100px');
		console.log("x is: " + x);
		console.log("y is: " + y);
		
		y--;
		
	}, 90);
	
	
}) (jQuery);