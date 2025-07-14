'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Music, Disc } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function WeatherMusicRecommendation({ weather, musicRecommendation }) {

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Rain': return '🌧️';
      case 'Clear': return '☀️';
      case 'Clouds': return '☁️';
      case 'Thunderstorm': return '⛈️';
      case 'Snow': return '❄️';
      case 'Mist': return '🌫️';
      default: return '🌤️';
    }
  };


  const openInSpotifyApp = (url) => {
    // Spotify URI 추출 (예: https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh)
    const trackId = url.split('/track/')[1];
    
    // 여러 방법으로 재생 시도
    const playMethods = [
      `spotify:track:${trackId}:play`,           // 바로 재생 (최신)
      `spotify:play:spotify:track:${trackId}`,   // 바로 재생 (대안)
      `spotify:track:${trackId}`                 // 기본 (fallback)
    ];
    
    // 브라우저 감지
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    // 앱 열기 시도
    const tryOpenApp = (uri) => {
      if (isChrome || isFirefox) {
        // Chrome/Firefox에서는 iframe 사용
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = uri;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } else {
        // Safari나 다른 브라우저에서는 직접 링크 사용
        window.location.href = uri;
      }
    };
    
    // 앱 열기 시도 (원래 방식으로 복구)
    const tryPlayInApp = () => {
      // 기본 재생 URI
      const playUri = `spotify:track:${trackId}:play`;
      
      if (isChrome || isFirefox) {
        // Chrome/Firefox에서는 iframe 사용
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = playUri;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } else {
        // Safari나 다른 브라우저에서는 직접 링크 사용
        window.location.href = playUri;
      }
    };
    
    // 포커스 감지로 앱이 열렸는지 확인
    let appOpened = false;
    const startTime = Date.now();
    
    const checkIfAppOpened = () => {
      const elapsedTime = Date.now() - startTime;
      
      // 3초 후에도 포커스가 그대로면 앱이 안 열린 것으로 간주하고 웹으로 fallback
      if (elapsedTime > 3000 && !appOpened) {
        toast.info('Spotify 앱을 찾을 수 없어 웹에서 열었습니다.');
        window.open(url, '_blank');
      }
    };
    
    // 윈도우 포커스 이벤트 리스너
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
        toast.success('Spotify 앱에서 열었습니다! 🎵');
      }
    };
    
    const handleBlur = () => {
      appOpened = true;
      toast.success('Spotify 앱에서 열었습니다! 🎵');
    };
    
    // 이벤트 리스너 등록
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    // 앱 열기 시도
    toast.loading('Spotify 앱을 여는 중...', { id: 'spotify-opening' });
    tryPlayInApp();
    
    // 체크 타이머 (3초로 늘림)
    setTimeout(checkIfAppOpened, 3500);
    
    // 이벤트 리스너 제거
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      toast.dismiss('spotify-opening');
      
      if (!appOpened) {
        toast.info('웹 브라우저에서 Spotify를 열었습니다.');
      }
    }, 3000);
  };


  const TrackCard = ({ track }) => {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] w-full max-w-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3 w-full max-w-full overflow-hidden">
            {/* 앨범 커버 이미지 */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm flex-shrink-0">
              {track.album_image ? (
                <Image
                  src={track.album_image}
                  alt={`${track.album} album cover`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 40px, 48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc className="w-5 h-5 sm:w-6 sm:h-6 text-white/40" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 
                  className="font-semibold text-white text-sm sm:text-base truncate cursor-help flex-1" 
                  title={track.name}
                >
                  {track.name}
                </h4>
                {track.explicit && (
                  <span className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    E
                  </span>
                )}
              </div>
              <p 
                className="text-white/70 text-xs sm:text-sm truncate cursor-help" 
                title={track.artists.join(', ')}
              >
                {track.artists.join(', ')}
              </p>
              <p 
                className="text-white/50 text-xs truncate cursor-help" 
                title={track.album}
              >
                {track.album}
              </p>
            </div>
            
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              {track.preview_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const audio = new Audio(track.preview_url);
                    audio.play();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none px-2 sm:px-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg"
                  title="미리 듣기"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => openInSpotifyApp(track.external_urls.spotify)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none px-2 sm:px-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg"
                title="Spotify에서 듣기"
              >
                {/* Spotify 아이콘 */}
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* 날씨 정보 카드 */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
        <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                    <div className="relative text-5xl sm:text-6xl lg:text-7xl filter drop-shadow-lg">
                      {getWeatherIcon(weather.condition)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-white mb-2 font-bold truncate">
                      {weather.location}
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <CardDescription className="text-white/90 text-xl sm:text-2xl font-semibold">
                        {weather.temperature}°C
                      </CardDescription>
                      <div className="hidden sm:block h-8 w-px bg-white/30"></div>
                      <p className="text-white/70 text-base sm:text-lg capitalize font-medium">
                        {weather.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-white/50 text-sm">현재 시각</p>
                  <p className="text-white/80 text-base sm:text-lg font-medium">
                    {new Date().toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
        </CardHeader>
      </Card>

      {/* 음악 추천 카드 */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
        <CardHeader className="pb-4 sm:pb-6">
          <div>
            <CardTitle className="text-2xl sm:text-3xl text-white flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              AI 음악 추천
            </CardTitle>
            <CardDescription className="text-white/80 text-base sm:text-lg leading-relaxed">
              {musicRecommendation.reason}
            </CardDescription>
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-200 text-sm sm:text-base">
                💡 <strong>팁:</strong> 다른 음악이 재생 중일 때는 Spotify에서 수동으로 재생해주세요. 
                Spotify 정책상 자동으로 현재 재생 중인 음악을 바꿀 수 없습니다.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
            <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20">
              {musicRecommendation.genre}
            </span>
            <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20">
              {musicRecommendation.mood}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {musicRecommendation.tracks.length > 0 ? (
            <div className="grid gap-3 max-w-full">
              {musicRecommendation.tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
                <Music className="w-24 h-24 text-white/40 mx-auto relative" />
              </div>
              <p className="text-white/60 text-xl mb-2">음악을 불러올 수 없습니다</p>
              <p className="text-white/40 text-sm">Spotify API 설정을 확인해주세요</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}