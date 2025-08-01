import { NextResponse } from 'next/server';

const getAccessToken = async () => {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  return data.access_token;
};

const searchTracks = async (query, limit = 50) => {
  const token = await getAccessToken();
  
  // 음악 트랙만 가져오기 위한 쿼리 개선 + 인기도 높은 곡들 위주로 검색
  const musicQuery = `${query} NOT podcast NOT audiobook NOT talk NOT speech`;
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(musicQuery)}&type=track&limit=${limit}&market=KR`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search tracks');
  }

  const data = await response.json();
  
  // 음악 트랙만 필터링하고 인기도 기준으로 정렬
  const filteredTracks = data.tracks.items
    .filter((track) => {
      // 음악 트랙만 허용 (팟캐스트, 오디오북 등 제외)
      return track.type === 'track' && 
             track.album && 
             track.album.album_type !== 'compilation' && // 컴필레이션 제외
             track.artists && track.artists.length > 0 &&
             track.duration_ms > 30000 && // 30초 이상만 (짧은 광고/효과음 제외)
             track.duration_ms < 600000 && // 10분 이하만 (긴 팟캐스트 제외)
             track.popularity >= 30; // 인기도 30 이상만 (더 알려진 곡들)
    })
    .map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      album: track.album.name,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
      album_image: track.album.images?.[0]?.url || null,
      explicit: track.explicit || false, // 성인 컨텐츠 표시
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      primary_artist: track.artists[0].name, // 메인 아티스트
      album_id: track.album.id // 앨범 ID
    }))
    .sort((a, b) => b.popularity - a.popularity); // 인기도 높은 순으로 정렬

  // 상위 인기곡들에서 일부 랜덤성 추가 (너무 뻔하지 않게)
  const topTracks = filteredTracks.slice(0, 30); // 상위 30곡만 선택
  const shuffledTracks = [...topTracks].sort(() => Math.random() - 0.5);
  
  // 다양성을 위한 중복 제거 (같은 아티스트 최대 2곡, 같은 앨범 최대 1곡)
  const diversifiedTracks = [];
  const artistCount = {};
  const albumSet = new Set();
  
  for (const track of shuffledTracks) {
    const artist = track.primary_artist;
    const albumId = track.album_id;
    
    // 같은 앨범은 1곡만
    if (albumSet.has(albumId)) {
      continue;
    }
    
    // 같은 아티스트는 최대 2곡만
    if (artistCount[artist] && artistCount[artist] >= 2) {
      continue;
    }
    
    diversifiedTracks.push(track);
    albumSet.add(albumId);
    artistCount[artist] = (artistCount[artist] || 0) + 1;
    
    // 10곡 채우면 중단
    if (diversifiedTracks.length >= 10) {
      break;
    }
  }

  return diversifiedTracks;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const weatherCondition = searchParams.get('condition');
    const temperature = parseFloat(searchParams.get('temperature'));

    if (!weatherCondition || isNaN(temperature)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const weatherMoodMap = {
      Rain: {
        genre: "Jazz/Lo-fi",
        mood: "차분하고 편안한",
        searchQuery: "chill jazz rain lo-fi",
        reason: "비 오는 날에는 차분한 재즈나 로파이 음악이 분위기를 더해줍니다."
      },
      Clear: {
        genre: "Pop/Indie",
        mood: "밝고 활기찬",
        searchQuery: "upbeat pop happy sunny",
        reason: "맑은 날씨에는 밝고 경쾌한 팝 음악이 기분을 더욱 좋게 만듭니다."
      },
      Clouds: {
        genre: "Indie/Alternative",
        mood: "차분하고 몽환적인",
        searchQuery: "indie alternative dreamy cloudy",
        reason: "구름 낀 날씨에는 몽환적인 인디 음악이 분위기와 잘 어울립니다."
      },
      Thunderstorm: {
        genre: "Rock/Electronic",
        mood: "강렬하고 역동적인",
        searchQuery: "electronic rock energetic storm",
        reason: "천둥번개와 함께하는 날에는 강렬한 록이나 일렉트로닉 음악이 어울립니다."
      },
      Snow: {
        genre: "Classical/Ambient",
        mood: "고요하고 평온한",
        searchQuery: "classical ambient winter peaceful",
        reason: "눈 내리는 날에는 클래식이나 앰비언트 음악이 고요한 분위기를 만듭니다."
      },
      Mist: {
        genre: "Ambient/Chillout",
        mood: "신비롭고 차분한",
        searchQuery: "ambient chillout mysterious fog",
        reason: "안개 낀 날씨에는 신비롭고 차분한 앰비언트 음악이 분위기를 더해줍니다."
      }
    };

    const weatherInfo = weatherMoodMap[weatherCondition] || weatherMoodMap.Clear;
    
    let searchQuery = weatherInfo.searchQuery;
    let reason = weatherInfo.reason;

    // 시간대별 키워드 추가
    const hour = new Date().getHours();
    const timeKeywords = {
      morning: ["morning", "sunrise", "wake up", "fresh", "energetic"],
      afternoon: ["afternoon", "daytime", "bright", "active", "upbeat"],
      evening: ["evening", "sunset", "chill", "relaxing", "mellow"],
      night: ["night", "midnight", "dreamy", "ambient", "soft"]
    };

    let timeCategory;
    if (hour >= 6 && hour < 12) {
      timeCategory = "morning";
    } else if (hour >= 12 && hour < 18) {
      timeCategory = "afternoon";
    } else if (hour >= 18 && hour < 22) {
      timeCategory = "evening";
    } else {
      timeCategory = "night";
    }

    // 랜덤 시간대 키워드 추가
    const randomTimeKeyword = timeKeywords[timeCategory][Math.floor(Math.random() * timeKeywords[timeCategory].length)];
    searchQuery += ` ${randomTimeKeyword}`;

    // K-pop 비중 조절 (60% 확률로 K-pop 키워드 추가)
    const shouldAddKpop = Math.random() < 0.6;
    if (shouldAddKpop) {
      const kpopKeywords = ["kpop", "korean", "k-pop", "korean pop", "korea"];
      const randomKpopKeyword = kpopKeywords[Math.floor(Math.random() * kpopKeywords.length)];
      searchQuery += ` ${randomKpopKeyword}`;
    }

    // 인기곡 위주의 키워드 풀
    const popularityKeywords = [
      "popular", "trending", "hit", "chart", "billboard", "top", "mainstream",
      "famous", "viral", "bestseller", "classic", "iconic", "well-known"
    ];
    
    // 인기곡 키워드 1-2개 추가
    const numRandomKeywords = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numRandomKeywords; i++) {
      const randomKeyword = popularityKeywords[Math.floor(Math.random() * popularityKeywords.length)];
      searchQuery += ` ${randomKeyword}`;
    }

    // 온도에 따른 조정
    if (temperature > 30) {
      searchQuery += " summer cool";
      reason = `더운 날씨(${temperature}°C)에는 ${weatherInfo.genre} 음악으로 시원함을 느껴보세요.`;
    } else if (temperature < 0) {
      searchQuery += " winter warm cozy";
      reason = `추운 날씨(${temperature}°C)에는 ${weatherInfo.genre} 음악으로 마음을 따뜻하게 해보세요.`;
    }

    // 시간대별 이유 업데이트
    const timeDescriptions = {
      morning: "상쾌한 아침",
      afternoon: "활기찬 오후", 
      evening: "편안한 저녁",
      night: "고요한 밤"
    };

    if (!reason.includes("날씨")) {
      reason += ` ${timeDescriptions[timeCategory]}에 어울리는 곡들을 선별했습니다.`;
    }

    const tracks = await searchTracks(searchQuery);
    
    return NextResponse.json({
      genre: weatherInfo.genre,
      mood: weatherInfo.mood,
      tracks: tracks,
      reason: reason
    });

  } catch (error) {
    console.error('Failed to get music recommendations:', error);
    return NextResponse.json({ error: 'Failed to get music recommendations' }, { status: 500 });
  }
}