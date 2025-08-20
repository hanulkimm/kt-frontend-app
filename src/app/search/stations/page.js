'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { FiArrowLeft, FiMapPin, FiHeart, FiMap, FiSearch } from 'react-icons/fi';
import SearchResultItem from '../../../components/search/SearchResultItem';
import KakaoMap from '../../../components/map/KakaoMap';
import { searchStations, addSearchHistory } from '../../../services/search';
import toast from 'react-hot-toast';

function StationsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');
  
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchInput, setSearchInput] = useState(query || '');

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      router.push('/search');
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      // URL 업데이트
      const newUrl = `/search/stations?q=${encodeURIComponent(searchQuery.trim())}`;
      router.push(newUrl);
      
      // 검색 기록 저장
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          await addSearchHistory(searchQuery.trim(), userId);
          console.log('검색 기록 저장 완료:', searchQuery.trim());
        } catch (error) {
          console.error('검색 기록 저장 실패:', error);
          // 검색 기록 저장 실패해도 검색은 계속 진행
        }
      }

      const response = await searchStations(searchQuery.trim(), userId);
      
      if (response.success) {
        setStations(response.data || []);
      } else {
        setStations([]);
      }
    } catch (error) {
      console.error('검색 실패:', error);
      toast.error(error.message || '검색에 실패했습니다.');
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStationClick = (station) => {
    setSelectedStation(station);
  };

  const handleMapStationClick = (station) => {
    setSelectedStation(station);
    // 리스트에서 해당 정류장으로 스크롤
    const element = document.getElementById(`station-${station.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  if (!query) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/search')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">정류장 검색</h1>
                <p className="text-sm text-gray-600">정류장을 검색하고 지도에서 확인하세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 검색바 섹션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  performSearch(searchInput);
                }
              }}
              className="w-full pl-12 pr-20 py-3 border border-gray-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
              placeholder="정류장명을 입력하세요 (예: 강남역, 홍대입구역)"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              onClick={() => performSearch(searchInput)}
              disabled={!searchInput.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              검색
            </button>
          </div>
          
          {/* 검색 결과 요약 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>"{query || searchInput}" 검색 결과</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md font-medium">
                {stations.length}개 정류장
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMapView}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  showMap 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiMap className="w-4 h-4" />
                <span className="text-sm font-medium">{showMap ? '목록만' : '지도'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">정류장을 검색하고 있습니다...</p>
            </div>
            
            {/* 로딩 스켈레톤 */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : stations.length === 0 ? (
          <div className="text-center py-16">
            <FiMapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600 mb-6">
              "{query || searchInput}"에 대한 정류장을 찾을 수 없습니다.<br/>
              다른 검색어로 다시 시도해보세요.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSearchInput('')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                검색어 지우기
              </button>
              <button
                onClick={() => router.push('/search')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          <div className={`grid ${showMap ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            {/* 검색 결과 리스트 */}
            <div className={showMap ? 'order-2 lg:order-1' : ''}>
              
              <div className="space-y-3">
                {stations.map((station) => (
                  <div
                    key={station.id}
                    id={`station-${station.id}`}
                    className={`transition-all duration-200 ${
                      selectedStation?.id === station.id 
                        ? 'ring-2 ring-emerald-500 ring-opacity-50' 
                        : ''
                    }`}
                  >
                    <SearchResultItem
                      station={station}
                      showBookmarkButton={true}
                      onClick={() => handleStationClick(station)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 지도 */}
            {showMap && (
              <div className="order-1 lg:order-2">
                <div className="sticky top-24">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">지도</h2>
                    <p className="text-sm text-gray-600">
                      마커를 클릭하면 정류장 정보를 확인할 수 있습니다.
                    </p>
                  </div>
                  
                  <KakaoMap
                    stations={stations}
                    onStationClick={handleMapStationClick}
                    className="h-[500px] lg:h-[600px] w-full border border-gray-200 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 선택된 정류장 정보 (하단 고정) */}
        {selectedStation && (
          <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-4xl z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{selectedStation.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
                      {selectedStation.number}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-md font-medium ${
                      selectedStation.centerYn === 'Y' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedStation.distance}
                    </span>
                  </div>
                                  <p className="text-sm text-gray-600">
                  {selectedStation.regionName}
                </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    닫기
                  </button>
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200">
                    버스 정보 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <StationsPageContent />
    </Suspense>
  );
}
