# WeatherBeats 🎵☀️

**바이브 코딩의 결과물** - 날씨에 딱 맞는 음악을 AI가 추천해주는 웹앱입니다.

Claude Code의 강력한 성능 덕분에 단시간에 완성된 프로젝트로, 실시간 날씨 데이터와 Spotify API를 활용한 스마트한 음악 추천 시스템을 구현했습니다.

## ✨ 주요 기능

- **🌍 실시간 날씨 감지**: 위치 기반 현재 날씨 자동 인식
- **🤖 AI 음악 추천**: 날씨, 시간, 기분을 종합한 지능형 음악 큐레이션
- **🎧 Spotify 연동**: 추천 음악을 바로 Spotify에서 재생 가능
- **📱 반응형 디자인**: 모바일부터 데스크톱까지 완벽한 UI/UX
- **⏰ 시간대별 맞춤**: 아침, 점심, 저녁, 밤 각각 다른 음악 스타일 제안
- **🎯 인기곡 중심**: 알려진 히트곡들을 우선적으로 추천

## 🛠 기술 스택

Claude Code를 활용한 바이브 코딩으로 선택한 최신 기술들:

- **Frontend**: Next.js 15 + React 18 + Tailwind CSS
- **APIs**: OpenWeatherMap API + Spotify Web API  
- **Deployment**: Vercel (원클릭 배포)
- **UI Components**: Radix UI + shadcn/ui
- **개발 도구**: Claude Code (AI 페어 프로그래밍)

## 🚀 빠른 시작

### 필요한 것들
- Node.js 18+
- Spotify 개발자 계정
- OpenWeatherMap API 키

### 환경 변수 설정

`.env.local` 파일을 루트에 생성:

```env
NEXT_PUBLIC_WEATHER_API_KEY=your_openweathermap_api_key
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id  
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/yourusername/weather-music-app.git
cd weather-music-app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

🎉 [http://localhost:3000](http://localhost:3000)에서 확인해보세요!

## 🎵 작동 원리

**Claude Code의 도움으로 구현한 똑똑한 추천 알고리즘:**

1. **날씨 인식** → 사용자 위치의 실시간 날씨 데이터 수집
2. **컨텍스트 분석** → 날씨 + 시간 + 온도를 종합 분석  
3. **음악 매칭** → Spotify에서 분위기에 맞는 인기곡들을 필터링
4. **스마트 큐레이션** → 다양성과 인기도를 고려한 최종 추천

### 🧠 추천 로직의 특징
- **인기도 필터링**: popularity 30+ 곡들만 선별
- **장르 다양성**: 같은 아티스트/앨범 중복 최소화  
- **한국 시장 최적화**: K-pop과 국내 인기곡 가중치 적용
- **시간대별 맞춤**: 아침엔 경쾌하게, 밤엔 차분하게

## 🎯 왜 이 프로젝트인가?

**바이브 코딩으로 만들어본 실용적인 앱** - 단순한 토이 프로젝트가 아닌, 실제로 매일 사용할 수 있는 음악 추천 서비스입니다.

Claude Code의 탁월한 코드 생성 능력 덕분에:
- 복잡한 API 통합을 빠르게 구현
- 반응형 UI를 효율적으로 개발  
- 실시간 데이터 처리 로직을 안정적으로 작성
- 최신 Next.js 기능들을 완벽하게 활용

## 🤝 기여하기

바이브 코딩에 참여하고 싶다면:

1. Fork 후 feature 브랜치 생성
2. Claude Code로 멋진 기능 추가
3. Pull Request 생성

**아이디어들:**
- 기분별 음악 추천 기능
- 사용자 취향 학습 알고리즘
- 소셜 음악 공유 기능
- 날씨 예보 기반 플레이리스트

## 📝 라이선스

MIT License - 자유롭게 사용하고 개선해보세요!

---

*이 프로젝트는 Claude Code와 함께한 바이브 코딩의 결과물입니다. AI 페어 프로그래밍의 가능성을 보여주는 실제 사례로, 빠르고 효율적인 개발 경험을 제공합니다.*