// 무료 지오코딩으로 주소 가져오기 (OpenStreetMap Nominatim)
async function getAddressFromCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ko`,
      {
        headers: {
          'User-Agent': 'WeatherBeats/1.0'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      // 한국 주소 형식으로 조합
      const address = data.display_name;
      if (address) {
        // 한국 주소에서 시/구 정보 추출
        const parts = address.split(',');
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed.includes('시') || trimmed.includes('구') || trimmed.includes('군')) {
            return trimmed;
          }
        }
        // 시/구를 찾지 못하면 첫 번째 부분 반환
        return parts[0]?.trim() || '현재 위치';
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return '현재 위치';
}

export async function getWeatherData(lat, lon) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenWeather API key가 설정되지 않았습니다');
  }

  try {
    // OpenWeatherMap API 호출 (날씨 데이터만)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
    
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      console.error('OpenWeather API Error:', errorData);
      throw new Error(`OpenWeather API Error: ${errorData.message || 'Failed to fetch weather data'}`);
    }

    const weatherData = await weatherResponse.json();
    
    // 별도로 주소 정보 가져오기
    const location = await getAddressFromCoords(lat, lon);

    return {
      location: location,
      temperature: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      condition: weatherData.weather[0].main,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind?.speed || 0
    };
    
  } catch (error) {
    console.error('Weather API Error:', error);
    throw new Error(`날씨 정보를 가져올 수 없습니다: ${error.message}`);
  }
}

export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => {
        reject(new Error('Unable to retrieve location'));
      }
    );
  });
}