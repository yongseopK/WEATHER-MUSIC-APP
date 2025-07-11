export async function getMusicRecommendation(weatherCondition, temperature) {
  try {
    const response = await fetch(`/api/music?condition=${weatherCondition}&temperature=${temperature}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch music recommendations');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get music recommendations:', error);
    
    // 에러 시 기본 추천 반환
    const weatherMoodMap = {
      Rain: {
        genre: "Jazz/Lo-fi",
        mood: "차분하고 편안한",
        reason: "비 오는 날에는 차분한 재즈나 로파이 음악이 분위기를 더해줍니다."
      },
      Clear: {
        genre: "Pop/Indie",
        mood: "밝고 활기찬",
        reason: "맑은 날씨에는 밝고 경쾌한 팝 음악이 기분을 더욱 좋게 만듭니다."
      },
      Clouds: {
        genre: "Indie/Alternative",
        mood: "차분하고 몽환적인",
        reason: "구름 낀 날씨에는 몽환적인 인디 음악이 분위기와 잘 어울립니다."
      },
      Thunderstorm: {
        genre: "Rock/Electronic",
        mood: "강렬하고 역동적인",
        reason: "천둥번개와 함께하는 날에는 강렬한 록이나 일렉트로닉 음악이 어울립니다."
      },
      Snow: {
        genre: "Classical/Ambient",
        mood: "고요하고 평온한",
        reason: "눈 내리는 날에는 클래식이나 앰비언트 음악이 고요한 분위기를 만듭니다."
      },
      Mist: {
        genre: "Ambient/Chillout",
        mood: "신비롭고 차분한",
        reason: "안개 낀 날씨에는 신비롭고 차분한 앰비언트 음악이 분위기를 더해줍니다."
      }
    };

    const weatherInfo = weatherMoodMap[weatherCondition] || weatherMoodMap.Clear;
    
    return {
      genre: weatherInfo.genre,
      mood: weatherInfo.mood,
      tracks: [],
      reason: weatherInfo.reason
    };
  }
}