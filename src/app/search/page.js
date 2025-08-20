'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import SearchBar from '../../components/search/SearchBar';
import SearchHistory from '../../components/search/SearchHistory';
import { getBookmarkedStations, getBookmarkedRoutes } from '../../services/bookmarks';
import { addSearchHistory } from '../../services/search';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const router = useRouter();
  const [bookmarkedStations, setBookmarkedStations] = useState([]);
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(true);

  // 한글 디코딩 유틸리티 함수
  const decodeKoreanText = (text) => {
    if (!text || typeof text !== 'string') return text;
    try {
      // URL 인코딩된 텍스트인지 확인하고 디코딩
      if (text.includes('%')) {
        return decodeURIComponent(text);
      }
      // HTML 엔티티 디코딩
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    } catch (error) {
      console.warn('텍스트 디코딩 실패:', text, error);
      return text;
    }
  };

  useEffect(() => {
    // 로그인 상태 확인
    const checkAuthStatus = () => {
      const existingUserId = localStorage.getItem('userId');
      const existingUserEmail = localStorage.getItem('userEmail');
      
      if (!existingUserId) {
        console.log('로그인되지 않은 사용자 - 로그인 페이지로 리다이렉트');
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return false;
      }
      
      setUserEmail(existingUserEmail || '');
      return true;
    };

             if (checkAuthStatus()) {
           loadBookmarkedStations();
           loadBookmarkedRoutes();
         }
  }, [router]);

  const loadBookmarkedStations = async () => {
    try {
      setBookmarksLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.log('userId가 없어 즐겨찾기를 불러올 수 없습니다.');
        setBookmarkedStations([]);
        setBookmarksLoading(false);
        return;
      }

      console.log('즐겨찾기 정류장 로드 시작 - userId:', userId);
      
      const response = await getBookmarkedStations(userId);
      if (response.success) {
        const bookmarks = response.data || [];
        
        // 한글 인코딩 문제 해결을 위한 데이터 처리
        const processedBookmarks = bookmarks.map(bookmark => ({
          ...bookmark,
          stationName: decodeKoreanText(bookmark.stationName),
          name: decodeKoreanText(bookmark.name)
        }));
        
        setBookmarkedStations(processedBookmarks);
        console.log('✅ 즐겨찾기 정류장 로드 성공:', processedBookmarks);
        

      } else {
        console.error('❌ 즐겨찾기 정류장 로드 실패:', response.message);
        setBookmarkedStations([]);
        toast.error('정류장 즐겨찾기를 불러오는데 실패했습니다: ' + response.message);
      }
    } catch (error) {
      console.error('🔥 즐겨찾기 정류장 로드 오류:', error);
      setBookmarkedStations([]);
      
      // 사용자 친화적인 오류 메시지
      if (error.message.includes('유효하지 않은 사용자 ID')) {
        toast.error('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        toast.error('정류장 즐겨찾기를 불러오는데 실패했습니다.');
      }
    } finally {
      setBookmarksLoading(false);
    }
  };

  const loadBookmarkedRoutes = async () => {
    try {
      setRoutesLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.log('userId가 없어 노선 즐겨찾기를 불러올 수 없습니다.');
        setBookmarkedRoutes([]);
        setRoutesLoading(false);
        return;
      }

      console.log('즐겨찾기 노선 로드 시작 - userId:', userId);
      
      const response = await getBookmarkedRoutes(userId);
      if (response.success) {
        const routes = response.data || [];
        
        // 한글 인코딩 문제 해결을 위한 데이터 처리
        const processedRoutes = routes.map(route => ({
          ...route,
          routeName: decodeKoreanText(route.routeName),
          routeNumber: decodeKoreanText(route.routeNumber),
          stationName: decodeKoreanText(route.stationName)
        }));
        
        setBookmarkedRoutes(processedRoutes);
        console.log('✅ 즐겨찾기 노선 로드 성공:', processedRoutes);
        

      } else {
        console.error('❌ 즐겨찾기 노선 로드 실패:', response.message);
        setBookmarkedRoutes([]);
        toast.error('노선 즐겨찾기를 불러오는데 실패했습니다: ' + response.message);
      }
    } catch (error) {
      console.error('🔥 즐겨찾기 노선 로드 오류:', error);
      setBookmarkedRoutes([]);
      
      // 사용자 친화적인 오류 메시지
      if (error.message.includes('유효하지 않은 사용자 ID')) {
        toast.error('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        toast.error('노선 즐겨찾기를 불러오는데 실패했습니다.');
      }
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    // 검색 기록 저장
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        await addSearchHistory(query.trim(), userId);
        console.log('검색 기록 저장 완료:', query.trim());
      } catch (error) {
        console.error('검색 기록 저장 실패:', error);
        // 검색 기록 저장 실패해도 검색은 계속 진행
      }
    }

    // 검색 결과 페이지로 이동
    const searchParams = new URLSearchParams({ q: query.trim() });
    window.location.href = `/search/stations?${searchParams.toString()}`;
  };

  const handleHistoryClick = (query) => {
    handleSearch(query);
  };

  const handleLogout = () => {
    // 로컬 스토리지에서 사용자 정보 제거
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    toast.success('로그아웃되었습니다.');
    
    // 로그인 페이지로 리다이렉트
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BusMate</h1>
                <p className="text-sm text-gray-600">실시간 버스 정보 서비스</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <span className="text-sm">알림</span>
              </button>
                                            <button 
                onClick={() => router.push('/mypage')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <span className="text-sm">마이페이지</span>
              </button>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors duration-200"
                >
                  로그아웃
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            안녕하세요, {userEmail ? userEmail.split('@')[0] : '사용자'}님! 👋
          </h2>
          <p className="text-gray-600">
            오늘도 BusMate와 함께 편리한 대중교통 이용하세요.
          </p>
        </div>

        {/* 검색 바 */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>



        {/* 하단 섹션들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 즐겨찾기 정류장 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❤️</span>
                <h3 className="text-lg font-semibold text-gray-900">즐겨찾기 정류장</h3>
                <span className="text-sm text-gray-500">{bookmarkedStations.length}개</span>
                {bookmarksLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                )}
              </div>
              <button
                onClick={loadBookmarkedStations}
                disabled={bookmarksLoading}
                className="text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                새로고침
              </button>
            </div>
            
            {bookmarksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-12"></div>
                        </div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-300 rounded w-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookmarkedStations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                <span className="text-4xl mb-3 block">❤️</span>
                <p>즐겨찾기한 정류장이 없습니다.</p>
                <p className="text-sm mt-1">정류장 상세 페이지에서 즐겨찾기를 추가해보세요.</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {bookmarkedStations.map((station) => (
                  <div 
                    key={station.stationId || station.targetId || station.id} 
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => {
                      const stationId = station.stationId || station.targetId || station.id;
                      const stationName = station.stationName || station.name || '정류장';
                      const encodedStationName = encodeURIComponent(stationName);
                      window.location.href = `/search/stations/${stationId}?name=${encodedStationName}`;
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-base">
                          {decodeKoreanText(station.stationName || station.name || '정류장명 없음')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          정류장 {station.stationId || station.targetId || station.number || 'ID 없음'}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 즐겨찾기 노선 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚌</span>
                <h3 className="text-lg font-semibold text-gray-900">즐겨찾기 노선</h3>
                <span className="text-sm text-gray-500">{bookmarkedRoutes.length}개</span>
                {routesLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                )}
              </div>
              <button
                onClick={loadBookmarkedRoutes}
                disabled={routesLoading}
                className="text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                새로고침
              </button>
            </div>
            
            {routesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-gray-300 rounded w-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookmarkedRoutes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                <span className="text-4xl mb-3 block">🚌</span>
                <p>즐겨찾기한 노선이 없습니다.</p>
                <p className="text-sm mt-1">노선 상세 페이지에서 즐겨찾기를 추가해보세요.</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {bookmarkedRoutes.map((route) => (
                  <div 
                    key={`${route.routeId}-${route.stationId}`} 
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => {
                      // 노선 상세 페이지로 이동하는 로직을 여기에 추가할 수 있습니다
                      // 현재는 정류장 상세 페이지로 이동하는 예시입니다
                      const stationId = route.stationId;
                      const stationName = route.stationName || '정류장';
                      const encodedStationName = encodeURIComponent(stationName);
                      window.location.href = `/search/stations/${stationId}?name=${encodedStationName}`;
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        route.routeTypeCd === '1' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {route.routeNumber || route.routeId || '번호 없음'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-base">
                          {decodeKoreanText(route.routeName || route.routeNumber || '노선명 없음')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {decodeKoreanText(route.stationName || '정류장')}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {route.routeTypeCd === '1' ? '직행좌석' : '일반'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 실시간 인기 정류장 */}
        <div className="mt-8">
          <SearchHistory onHistoryClick={handleHistoryClick} />
        </div>

        {/* 실시간 정보 */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏰</span>
            <h3 className="text-lg font-semibold text-gray-900">실시간 정보</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">실시간 버스 위치 추적</span>
              </div>
              <p className="text-xs text-gray-600">GPS 기반 정확한 도착 예상 시간</p>
            </div>
            
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">혼잡도 및 착석 정보</span>
              </div>
              <p className="text-xs text-gray-600">실시간 승차 수 및 여유 좌석</p>
            </div>
            
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">알림 서비스</span>
              </div>
              <p className="text-xs text-gray-600">버스 도착 5분 전 자동 알림</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

