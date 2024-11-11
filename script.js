const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');

// Replace with your OpenCage Geocoding API key
const geocodingAPIKey = '2257577d44b245b7965bce6b45061ea4';

search.addEventListener('click', () => {
    const city = document.querySelector('.search-box input').value.trim();

    if (city === '') return;

    // Step 1: Fetch coordinates using Geocoding API
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${geocodingAPIKey}&countrycode=in&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                showError();
                console.error('City not found.');
                return;
            }

            // Ensure the location name returned closely matches the input
            const result = data.results[0];
            const locationName = result.formatted.toLowerCase();
            if (!locationName.includes(city.toLowerCase())) {
                showError();
                console.error('No exact match for the location entered.');
                return;
            }

            const { lat, lng } = result.geometry;

            // Step 2: Fetch weather data from Open-Meteo API
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
                .then(response => response.json())
                .then(weatherData => {
                    if (!weatherData || !weatherData.current_weather) {
                        showError();
                        console.error('Weather data not available.');
                        return;
                    }

                    displayWeather(weatherData.current_weather, city);
                })
                .catch(error => {
                    showError();
                    console.error('Error fetching weather data:', error);
                });
        })
        .catch(error => {
            showError();
            console.error('Error fetching geolocation data:', error);
        });
});

function showError() {
    container.style.height = '400px';
    weatherBox.style.display = 'none';
    weatherDetails.style.display = 'none';
    error404.style.display = 'block';
    error404.classList.add('fadeIn');
}

function displayWeather(weather, cityName) {
    error404.style.display = 'none';
    error404.classList.remove('fadeIn');

    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('.weather-box .temperature');
    const description = document.querySelector('.weather-box .description');
    const humidity = document.querySelector('.weather-details .humidity span');
    const wind = document.querySelector('.weather-details .wind span');

    const weatherCode = weather.weathercode;
    switch (weatherCode) {
        case 0:
            image.src = 'images/clear.png';
            description.innerHTML = "Clear";
            break;
        case 1: case 2: case 3:
            image.src = 'images/cloud.png';
            description.innerHTML = "Partly Cloudy";
            break;
        case 61: case 63: case 65:
            image.src = 'images/rain.png';
            description.innerHTML = "Rain";
            break;
        case 71: case 73: case 75:
            image.src = 'images/snow.png';
            description.innerHTML = "Snow";
            break;
        case 45: case 48:
            image.src = 'images/mist.png';
            description.innerHTML = "Foggy";
            break;
        default:
            image.src = '';
            description.innerHTML = "Weather unavailable";
    }

    temperature.innerHTML = `${Math.round(weather.temperature)}<span>°C</span>`;
    humidity.innerHTML = `${weather.relative_humidity || 'N/A'}%`;
    wind.innerHTML = `${Math.round(weather.windspeed)} Km/h`;

    weatherBox.style.display = '';
    weatherDetails.style.display = '';
    weatherBox.classList.add('fadeIn');
    weatherDetails.classList.add('fadeIn');
    container.style.height = '590px';
}
