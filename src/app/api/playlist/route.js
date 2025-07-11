import { NextResponse } from 'next/server';

// Spotify Web API를 사용해서 플레이리스트를 생성하려면 사용자 인증이 필요합니다.
// 여기서는 간단히 Spotify URI 리스트를 만들어서 클라이언트에게 전달합니다.
export async function POST(request) {
  try {
    const { tracks } = await request.json();

    if (!tracks || !Array.isArray(tracks)) {
      return NextResponse.json({ error: 'Invalid tracks data' }, { status: 400 });
    }

    // Spotify URI 형식으로 변환
    const spotifyUris = tracks.map(track => `spotify:track:${track.id}`);
    
    // 플레이리스트 URL 생성 (Spotify 앱에서 열림)
    const playlistUrl = `https://open.spotify.com/playlist/create?uris=${spotifyUris.join(',')}`;
    
    // 또는 Spotify 앱에서 직접 플레이리스트 생성 링크
    const createPlaylistUrl = `https://open.spotify.com/search/${encodeURIComponent(tracks.map(t => t.name).join(' '))}`;

    return NextResponse.json({
      success: true,
      spotifyUris,
      playlistUrl,
      createPlaylistUrl,
      message: '선택한 음악들을 Spotify에서 플레이리스트로 만들 수 있습니다.'
    });

  } catch (error) {
    console.error('Failed to create playlist:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}