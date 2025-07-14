'use client';

import { useState, useEffect } from 'react';
import { getWeatherData, getCurrentLocation } from '@/lib/weather';
import { getMusicRecommendation } from '@/lib/music';
import WeatherMusicRecommendation from '@/components/WeatherMusicRecommendation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [musicRecommendation, setMusicRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherAndMusic = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const location = await getCurrentLocation();
        const weatherData = await getWeatherData(location.lat, location.lon);
        setWeather(weatherData);
        
        const musicRec = await getMusicRecommendation(weatherData.condition, weatherData.temperature);
        setMusicRecommendation(musicRec);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        console.error('Weather/Music fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherAndMusic();
  }, []);

  const handleRefresh = async () => {
    if (!weather) return;
    
    try {
      setMusicRecommendation(null); // 음악 추천만 리셋
      const musicRec = await getMusicRecommendation(weather.condition, weather.temperature);
      setMusicRecommendation(musicRec);
    } catch (err) {
      console.error('Music refresh error:', err);
      setError('음악 추천을 새로고침할 수 없습니다.');
    }
  };

  // 시간대별 배경색 계산
  const getTimeBasedBackground = () => {
    const hour = new Date().getHours();
    
    if (hour >= 4 && hour < 6) {
      // 새벽 - 어두운 파란색
      return 'from-slate-900 via-blue-900 to-slate-800';
    } else if (hour >= 6 && hour < 12) {
      // 아침 - 밝은 파란색과 노란색
      return 'from-blue-400 via-sky-300 to-yellow-200';
    } else if (hour >= 12 && hour < 18) {
      // 낮 - 밝은 하늘색
      return 'from-blue-300 via-sky-200 to-cyan-200';
    } else if (hour >= 18 && hour < 20) {
      // 저녁 - 주황색과 분홍색
      return 'from-orange-400 via-pink-400 to-purple-500';
    } else {
      // 밤 - 어두운 보라색
      return 'from-slate-900 via-purple-900 to-slate-900';
    }
  };

  // 날씨별 특수 효과
  const getWeatherEffects = () => {
    if (!weather) return null;
    
    const effects = [];
    
    switch (weather.condition) {
      case 'Rain':
        // 비 효과
        effects.push(
          <div key="rain" className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 100 }, (_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-12 bg-blue-300/30 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        );
        break;
      case 'Snow':
        // 눈 효과
        effects.push(
          <div key="snow" className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-bounce opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );
        break;
      case 'Clear':
        // 맑은 날 - 반짝이는 효과
        effects.push(
          <div key="sparkle" className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );
        break;
      case 'Thunderstorm':
        // 번개 효과
        effects.push(
          <div key="lightning" className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-white/10 animate-pulse" 
                 style={{ animationDuration: '0.1s' }} />
          </div>
        );
        break;
      case 'Clouds':
        // 구름 효과 - 더 부드러운 그림자
        effects.push(
          <div key="clouds" className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-1/4 w-80 h-80 bg-gray-300/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-gray-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        );
        break;
    }
    
    return effects;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl">날씨 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto px-4">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">오류 발생</h2>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-white text-red-600 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getTimeBasedBackground()} relative overflow-hidden transition-all duration-1000`}>
      {/* 배경 장식 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:30px_30px] opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20"></div>
      
      {/* 움직이는 배경 요소들 */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* 날씨별 특수 효과 */}
      {getWeatherEffects()}
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 sm:mb-6 shadow-2xl">
            <span className="text-2xl sm:text-3xl">🎵</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            WeatherBeats
          </h1>
          <p className="text-white/70 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4">
            현재 날씨에 완벽하게 어울리는 음악을 AI가 추천해드립니다
          </p>
        </header>

        {weather && musicRecommendation && (
          <WeatherMusicRecommendation 
            weather={weather} 
            musicRecommendation={musicRecommendation} 
          />
        )}

        <div className="text-center mt-8 sm:mt-12">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="lg"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-md hover:shadow-2xl transition-all duration-300 px-6 sm:px-8 py-3 text-sm sm:text-base"
            disabled={!weather || !musicRecommendation}
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${!musicRecommendation ? 'animate-spin' : ''}`} />
            {!musicRecommendation ? '음악 불러오는 중...' : '다른 음악 추천받기'}
          </Button>
        </div>
      </div>
    </div>
  );
}