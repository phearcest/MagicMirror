jQuery.fn.updateWithText = function(text, speed)
{
	var dummy = $('<div/>').html(text);

	if ($(this).html() != dummy.html())
	{
		$(this).fadeOut(speed/2, function() {
			$(this).html(text);
			$(this).fadeIn(speed/2, function() {
				//done
			});
		});
	}
}

jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

function roundVal(temp)
{
	return Math.round(temp * 10) / 10;
}

function sleep(miliseconds) {
  var currentTime = new Date().getTime();
	while (currentTime + miliseconds >= new Date().getTime()) {}
}

jQuery(document).ready(function($) {

	var eventList = [];

	var lastCompliment;
	var compliment;

    moment.locale(config.lang);

	var socket = io.connect('http://localhost:3000');
	
	socket.on('command', function (data) {
		console.log(data);
		$('.images').html(data);
		$('.images').fadeIn(250);
		$('.lower-third').fadeOut(50);
	});

	socket.on('images', function (data) {
		$('.ready').html('');
		$('.ready').fadeOut(100);
		$('.images').html(data);
		$('.images').fadeIn(250);
		$('.lower-third').fadeOut(50);
	});

	socket.on('ready', function (data) {
		$('.images').html('');
		$('.images').fadeOut(200);
		$('.ready').html(data);
		$('.ready').fadeIn(250);
		$('.lower-third').fadeOut(50);
	});

	socket.on('dismiss', function (data) {
		$('.ready').html('');
		$('.ready').fadeOut(1000);
		$('.images').html('');
		$('.images').fadeOut(1000);
		$('.lower-third').fadeIn(1000);
	});

	version.init();

	time.init();

	calendar.init();

	compliments.init();

	weather.init();

	news.init();

});
