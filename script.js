/**
 * What functionality do we need?
 * 1. Enter city and hit search
 * 2. Adds city to search history in localstorage, adds it to the screen
 * 3. Displays cities current day info
 * 4. Displays forecast for next 5 days
 * 5.
 * */

//DOM Variables
let pastSearchList = $("#past-search-list");
let searchBtn = $("#search-btn");
let searchInput = $('#search-input');

let weatherTitleP = $('#weather-card-title');
let weatherTempP = $('#weather-card-temp');
let weatherHumidP = $('#weather-card-humid');
let weatherWindP = $('#weather-card-wind');
let weatherUvP = $('#weather-card-uv');
let titleIconSpan = $('#title-icon');

let forecastDiv = $('#forecast-div');

let today = moment().format('MM/DD/YYYY');

let firstUrl = 'https://api.openweathermap.org/data/2.5/weather?q='
let secondUrl = "https://api.openweathermap.org/data/2.5/onecall?";
let apiKey = '&appid=32812cc185c3b2473bf291a02911cb01';

$(function() {
	const init = () => {
		displayPastSearches(true);
	};

	/**
	 * Search for a city's weather
	 */
	const searchCityWeather = async (city) => {
		saveSearch(city);
		displayPastSearches();
		let buildUrl = firstUrl + city + apiKey;
		let latAndLongCall = await $.ajax( {url: buildUrl, method: 'GET'} ).then(res => {
			return res;			
		});
		buildUrl = secondUrl + "lat=" + latAndLongCall.coord.lat + "&lon=" + latAndLongCall.coord.lon + apiKey;
		let oneCall = await $.ajax( {url: buildUrl, method: 'GET'} ).then(res => {
			return res;			
		});
		displayCurrentWeather(latAndLongCall.name, latAndLongCall.main.temp, latAndLongCall.main.humidity, latAndLongCall.wind.speed, oneCall.current.uvi);

		let currentIconSpan = $("<span>").addClass('wi wi-owm-' + oneCall.current.weather[0].id + ' ml-2');
		weatherTitleP.append(currentIconSpan);

		displayForecast(oneCall.daily);
	};

	/**
	 * Display city's current weather
	 */
	const displayCurrentWeather = ( title, temp, humidity, wind, uv ) => {
		//Convert kelvin temp to farhenheit
		// temp = Math.floor(1.8 * (temp - 273) + 32, 2);

		weatherTitleP.text(title + ' (' + today + ')');
		weatherTempP.text(convertKelvinToF(temp));
		weatherHumidP.text(humidity);
		weatherWindP.text(wind);
		weatherUvP.text(uv);

		if(uv < 4)
			weatherUvP.addClass('bg-success').removeClass('bg-warning bg-danger');
		else if(uv < 8)
			weatherUvP.addClass('bg-warning').removeClass('bg-success bg-danger');
		else
			weatherUvP.addClass('bg-danger').removeClass('bg-warning bg-success');

		weatherUvP.addClass('text-white')
	};

	/**
	 * Display city's next 5 day forecast
	 */
	const displayForecast = (forecast) => {
		forecastDiv.empty();
		for(i = 1; i < 6; i++)
		{
			let now = moment();
			let weather = forecast[i];
			let col = $("<div>").addClass('col');
			let cardDiv = $("<div>").addClass('card bg-primary text-white');
			let cardBody = $("<div>").addClass('card-body');
			let cardTitle = $("<div>").addClass('card-title').text(now.add(i, 'days').format("MM/DD/YYYY"));
			let weatherIcon = $('<div>').addClass('wi wi-owm-' + weather.weather[0].id);
			let tempDiv = $("<div>").text("Temp: " + convertKelvinToF(weather.temp.day) + String.fromCharCode(176) + 'F');
			let humidDiv = $("<div>").text("Humidity: " + weather.humidity + '%');

			cardBody.append(cardTitle, weatherIcon, tempDiv, humidDiv);
			cardDiv.append(cardBody);
			col.append(cardDiv);
			forecastDiv.append(col);
		}
	};

	const convertKelvinToF = (k) => {
		return Math.floor(1.8 * (k - 273) + 32, 2);
	};

	/**
	 * Get and display past searches
	 */
	const displayPastSearches = (searchLastSearchedCity = false) => {
		pastSearchList.empty();

		//Get past searches
		let searches = localStorage.pastSearches ? JSON.parse(localStorage.pastSearches) : [];

		//Add the searches to the DOM
		searches.forEach(search => {
			let li = $("<li>").text(search).addClass('past-search list-group-item').attr('data-text', search);
			li.click(function() {
				searchCityWeather($(this).attr('data-text'));
			});
			pastSearchList.append(li);
		});
		if(searchLastSearchedCity && searches.length > 0)
			searchCityWeather(searches[searches.length - 1]);
	};

	/**
	 * Add search to past searches
	 */
	const saveSearch = (text) => {
		let searches = localStorage.pastSearches ? JSON.parse(localStorage.pastSearches) : [];
		if(!searches.includes(text))
		{
			searches.push(text);
			localStorage.pastSearches = JSON.stringify(searches);
		}
	};

	init();

	//Event Handling
	searchBtn.on('click', () => {
		//Get text from input field
		let text = $(searchInput).val();

		//Call search function sending text
		searchCityWeather(text);
	});
})