'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import SearchBar from '../../components/search/SearchBar';
import SearchHistory from '../../components/search/SearchHistory';
import SearchResultItem from '../../components/search/SearchResultItem';
import { searchStations } from '../../services/search';
import { getBookmarkedStations } from '../../services/bookmarks';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [bookmarkedStations, setBookmarkedStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 userId 설정 (실제 앱에서는 로그인 시 설정)
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', 'demo-user-123');
    }
    
    loadBookmarkedStations();
  }, []);

  const loadBookmarkedStations = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        // 더미 즐겨찾기 데이터
        setBookmarkedStations([
          {
            id: '9700',
            name: '대학역(중)',
            number: '9700',
            distance: '일반',
            latitude: 37.502345,
            longitude: 127.040123
          },
          {
            id: '146',
            name: '잠실역',
            number: '146',
            distance: '일반',
            latitude: 37.513294,
            longitude: 127.100052
          },
          {
            id: '2415',
            name: '수원역',
            number: '2415',
            distance: '직통최석',
            latitude: 37.266940,
            longitude: 127.001058
          }
        ]);
        return;
      }

      const response = await getBookmarkedStations(userId);
      if (response.success) {
        setBookmarkedStations(response.data || []);
      }
    } catch (error) {
      console.error('즐겨찾기 로드 실패:', error);
      // 에러가 발생해도 페이지는 정상적으로 표시
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      
      const response = await searchStations(query, localStorage.getItem('userId'));
      if (response.success) {
        setSearchResults(response.data || []);
        if (response.data?.length === 0) {
          toast.error('검색 결과가 없습니다.');
        }
      } else {
        toast.error(response.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('검색 실패:', error);
      toast.error(error.message || '검색에 실패했습니다.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (query) => {
    handleSearch(query);
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
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <span className="text-sm">마이페이지</span>
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
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
            안녕하세요, d님! 👋
          </h2>
          <p className="text-gray-600">
            오늘도 BusMate와 함께 편리한 대중교통 이용하세요.
          </p>
        </div>

        {/* 검색 바 */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* 검색 결과 */}
        {hasSearched && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">검색 결과</h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((station) => (
                  <SearchResultItem
                    key={station.id}
                    station={station}
                    showBookmarkButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 하단 섹션들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 즐겨찾기 정류장 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">❤️</span>
              <h3 className="text-lg font-semibold text-gray-900">즐겨찾기 정류장</h3>
              <span className="text-sm text-gray-500">{bookmarkedStations.length}개</span>
            </div>
            
            {bookmarkedStations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                <span className="text-4xl mb-3 block">❤️</span>
                <p>즐겨찾기한 정류장이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedStations.map((station) => (
                  <div key={station.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{station.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                          {station.number}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{station.distance}</p>
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      일반
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 즐겨찾기 노선 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚌</span>
              <h3 className="text-lg font-semibold text-gray-900">즐겨찾기 노선</h3>
              <span className="text-sm text-gray-500">3개</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500 text-white text-sm rounded-md font-medium">9700</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">대학역(중)</h4>
                    <p className="text-sm text-gray-600">강남역</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">일반</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500 text-white text-sm rounded-md font-medium">146</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">잠실역</h4>
                    <p className="text-sm text-gray-600">잠실역</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">일반</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-red-500 text-white text-sm rounded-md font-medium">2415</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">수원역</h4>
                    <p className="text-sm text-gray-600">역삼역.한국지식재산센터</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">직통최석</span>
              </div>
            </div>
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
