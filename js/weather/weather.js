var weather = {
	// Default language is Dutch because that is what the original author used
	lang: config.lang || 'nl',
	params: config.weather.params || null,
	iconTable: {
		'01d':'wi-day-sunny',
		'02d':'wi-day-cloudy',
		'03d':'wi-cloudy',
		'04d':'wi-cloudy-windy',
		'09d':'wi-showers',
		'10d':'wi-rain',
		'11d':'wi-thunderstorm',
		'13d':'wi-snow',
		'50d':'wi-fog',
		'01n':'wi-night-clear',
		'02n':'wi-night-cloudy',
		'03n':'wi-night-cloudy',
		'04n':'wi-night-cloudy',
		'09n':'wi-night-showers',
		'10n':'wi-night-rain',
		'11n':'wi-night-thunderstorm',
		'13n':'wi-night-snow',
		'50n':'wi-night-alt-cloudy-windy'
	},
	conditionTable: {
		'200':'wi-day-storm-showers',				//Thunderstorms
		'201':'wi-storm-showers',
		'202':'wi-thunderstorm',
		'210':'wi-lightning',
		'211':'wi-lightning',
		'212':'wi-lightning',
		'221':'wi-lightning',
		'230':'wi-day-storm-showers',
		'231':'wi-day-storm-showers',
		'232':'wi-day-storm-showers',
		'300':'wi-day-sprinkle',						//Drizzle
		'301':'wi-day-sprinkle',
		'302':'wi-day-sprinkle',
		'310':'wi-day-sprinkle',
		'311':'wi-day-sprinkle',
		'312':'wi-day-sprinkle',
		'313':'wi-sprinkle',
		'314':'wi-sprinkle',
		'321':'wi-sprinkle',
		'500':'wi-day-rain',								//Rain
		'501':'wi-rain',
		'502':'wi-rain',
		'503':'wi-rain',
		'504':'wi-rain-wind',
		'511':'wi-sleet',
		'520':'wi-day-showers',
		'521':'wi-day-showers',
		'522':'wi-showers',
		'531':'wi-showers',
		'600':'wi-snow',										//Snow
		'601':'wi-snow',
		'602':'wi-snow-wind',
		'611':'wi-sleet',
		'612':'wi-day-sleet',
		'615':'wi-day-rain-mix',
		'616':'wi-rain-mix',
		'620':'wi-day-snow',
		'621':'wi-day-snow',
		'622':'wi-day-snow',
		'701':'wi-day-cloudy-windy',									//Atmosphere
		'711':'wi-smoke',
		'721':'wi-day-fog',
		'731':'wi-sandstorm',
		'741':'wi-fog',
		'751':'wi-sandstorm',
		'761':'wi-dust',
		'762':'wi-volcano',
		'771':'wi-cloudy-gusts',
		'781':'wi-tornado',
		'800':'wi-day-sunny',								//Clear
		'801':'wi-day-cloudy',							//Cloudy
		'802':'wi-cloud',
		'803':'wi-cloud',
		'804':'wi-cloudy',
		'900':'wi-tornado',									//Extreme
		'901':'wi-thunderstorm',
		'902':'wi-hurricane',
		'903':'wi-snowflake-cold',
		'904':'wi-hot',
		'905':'wi-strong-wind',
		'906':'wi-hail'
	},
	temperatureLocation: '.temp',
	windSunLocation: '.windsun',
	forecastLocation: '.forecast',
	apiVersion: '2.5',
	apiBase: 'http://api.openweathermap.org/data/',
	weatherEndpoint: 'weather',
	forecastEndpoint: 'forecast/daily',
	updateInterval: config.weather.interval || 6000,
	fadeInterval: config.weather.fadeInterval || 1000,
	intervalId: null
}

/**
 * Rounds a float to one decimal place
 * @param  {float} temperature The temperature to be rounded
 * @return {float}             The new floating point value
 */
weather.roundValue = function (temperature) {
	return parseFloat(temperature).toFixed(1);
}


weather.roundValueFull = function (temperature) {
	return parseFloat(temperature).toFixed(0);
}

/**
 * Converts the wind speed (km/h) into the values given by the Beaufort Wind Scale
 * @see http://www.spc.noaa.gov/faq/tornado/beaufort.html
 * @param  {int} kmh The wind speed in Kilometers Per Hour
 * @return {int}     The wind speed converted into its corresponding Beaufort number
 */
weather.ms2Beaufort = function(ms) {
	var kmh = ms * 60 * 60 / 1000;
	var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
	for (var beaufort in speeds) {
		var speed = speeds[beaufort];
		if (speed > kmh) {
			return beaufort;
		}
	}
	return 12;
}

/**
 * Retrieves the current temperature and weather patter from the OpenWeatherMap API
 */
weather.updateCurrentWeather = function () {

	$.ajax({
		type: 'GET',
		url: weather.apiBase + '/' + weather.apiVersion + '/' + weather.weatherEndpoint,
		dataType: 'json',
		data: weather.params,
		success: function (data) {

			var _temperature = this.roundValue(data.main.temp),
				_temperatureMin = this.roundValueFull(data.main.temp_min),
				_temperatureMax = this.roundValueFull(data.main.temp_max),
				_wind = this.roundValue(data.wind.speed),
				_iconClass = this.conditionTable[data.weather[0]['id']];

			var _icon = '<span class="icon ' + _iconClass + ' dimmed wi"></span>';

			var _newTempHtml = _icon + '' + _temperature + '&deg;';

			$(this.temperatureLocation).updateWithText(_newTempHtml, this.fadeInterval);

			var _now = moment().format('HH:mm'),
				_sunrise = moment(data.sys.sunrise*1000).format('HH:mm'),
				_sunset = moment(data.sys.sunset*1000).format('HH:mm');

			var _newWindHtml = '<span class="wi wi-strong-wind xdimmed"></span> ' + this.ms2Beaufort(_wind),
				_newSunHtml = '<span class="wi wi-sunrise xdimmed"></span> ' + _sunrise;

			if (_sunrise < _now && _sunset > _now) {
				_newSunHtml = '<span class="wi wi-sunset xdimmed"></span> ' + _sunset;
			}

			if (_sunrise > _now || _sunset < _now) {
				_iconClass = _iconClass.replace('day', 'night');
			}

			var _icon = '<span class="icon ' + _iconClass + ' dimmed wi"></span>';

			var _newTempHtml = _icon + '' + _temperature + '&deg;';

			$(this.temperatureLocation).updateWithText(_newTempHtml, this.fadeInterval);

			$(this.windSunLocation).updateWithText(_newWindHtml + ' ' + _newSunHtml, this.fadeInterval);

		}.bind(this),
		error: function () {

		}
	});

}

/**
 * Updates the 5 Day Forecast from the OpenWeatherMap API
 */
weather.updateWeatherForecast = function () {

	$.ajax({
		type: 'GET',
		url: weather.apiBase + '/' + weather.apiVersion + '/' + weather.forecastEndpoint,
		data: weather.params,
		success: function (data) {

			var _opacity = 1,
				_forecastHtml = '';

			_forecastHtml += '<table class="forecast-table">';

			for (var i = 0, count = data.list.length; i < count; i++) {

				var _forecast = data.list[i];

				_forecastHtml += '<tr style="opacity:' + _opacity + '">';

				_forecastHtml += '<td class="day">' + moment(_forecast.dt, 'X').format('ddd') + '</td>';
				_forecastHtml += '<td class="icon-small ' + this.conditionTable[_forecast.weather[0]['id']] + '"></td>';
				_forecastHtml += '<td class="temp-max">' + this.roundValueFull(_forecast.temp.max) + '</td>';
				_forecastHtml += '<td class="temp-min">' + this.roundValueFull(_forecast.temp.min) + '</td>';

				_forecastHtml += '</tr>';

				_opacity -= 0.155;

			}

			_forecastHtml += '</table>';

			$(this.forecastLocation).updateWithText(_forecastHtml, this.fadeInterval);

		}.bind(this),
		error: function () {

		}
	});

}

weather.init = function () {

	if (this.params.lang === undefined) {
		this.params.lang = this.lang;
	}

	if (this.params.cnt === undefined) {
		this.params.cnt = 5;
	}

	this.intervalId = setInterval(function () {
		this.updateCurrentWeather();
		this.updateWeatherForecast();
	}.bind(this), this.updateInterval);

}
