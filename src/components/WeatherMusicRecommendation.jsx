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
    // Spotify 앱 URI로 변환
    const spotifyUri = url.replace('https://open.spotify.com/', 'spotify:');
    
    // 브라우저 감지
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    // 앱 열기 시도
    const tryOpenApp = () => {
      if (isChrome || isFirefox) {
        // Chrome/Firefox에서는 iframe 사용
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = spotifyUri;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } else {
        // Safari나 다른 브라우저에서는 직접 링크 사용
        window.location.href = spotifyUri;
      }
    };
    
    // 포커스 감지로 앱이 열렸는지 확인
    let appOpened = false;
    const startTime = Date.now();
    
    const checkIfAppOpened = () => {
      const elapsedTime = Date.now() - startTime;
      
      // 2초 후에도 포커스가 그대로면 앱이 안 열린 것으로 간주
      if (elapsedTime > 2000 && !appOpened) {
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
    tryOpenApp();
    
    // 체크 타이머
    setTimeout(checkIfAppOpened, 2500);
    
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
      <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* 앨범 커버 이미지 */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm flex-shrink-0">
              {track.album_image ? (
                <Image
                  src={track.album_image}
                  alt={`${track.album} album cover`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc className="w-6 h-6 text-white/40" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white mb-1 text-base truncate">{track.name}</h4>
              <p className="text-white/70 text-sm truncate">{track.artists.join(', ')}</p>
              <p className="text-white/50 text-xs truncate">{track.album}</p>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              {track.preview_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const audio = new Audio(track.preview_url);
                    audio.play();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none px-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg"
                  title="미리 듣기"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => openInSpotifyApp(track.external_urls.spotify)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none px-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg"
                title="Spotify에서 듣기"
              >
                {/* Spotify 아이콘 */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 날씨 정보 카드 */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl">
        <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                    <div className="relative text-7xl filter drop-shadow-lg">
                      {getWeatherIcon(weather.condition)}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white mb-2 font-bold">
                      {weather.location}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <CardDescription className="text-white/90 text-2xl font-semibold">
                        {weather.temperature}°C
                      </CardDescription>
                      <div className="h-8 w-px bg-white/30"></div>
                      <p className="text-white/70 text-lg capitalize font-medium">
                        {weather.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-sm">현재 시각</p>
                  <p className="text-white/80 text-lg font-medium">
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
        <CardHeader className="pb-6">
          <div>
            <CardTitle className="text-3xl text-white flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Music className="w-6 h-6 text-white" />
              </div>
              AI 음악 추천
            </CardTitle>
            <CardDescription className="text-white/80 text-lg leading-relaxed">
              {musicRecommendation.reason}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
              {musicRecommendation.genre}
            </span>
            <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
              {musicRecommendation.mood}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {musicRecommendation.tracks.length > 0 ? (
            <div className="grid gap-3">
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