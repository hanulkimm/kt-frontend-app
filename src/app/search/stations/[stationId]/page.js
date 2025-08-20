'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { FiArrowLeft, FiMapPin, FiRefreshCw, FiClock, FiHeart } from 'react-icons/fi';
import BusArrivalItem from '../../../../components/bus/BusArrivalItem';
import { getBusArrivalInfo } from '../../../../services/busArrival';
import { addStationBookmark, removeStationBookmark, checkBookmarkStatus } from '../../../../services/bookmarks';
import toast from 'react-hot-toast';

function StationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.stationId;
  
  const [busArrivals, setBusArrivals] = useState([]);
  const [stationInfo, setStationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);

  useEffect(() => {
    if (stationId) {
      loadBusArrivalInfo();
      checkBookmark();
    }
  }, [stationId]);

  // 자동 업데이트 토글 효과
  useEffect(() => {
    if (autoUpdate && stationId) {
      const interval = setInterval(() => {
        loadBusArrivalInfo(true);
      }, 30000);
      setUpdateInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }
    }
  }, [autoUpdate, stationId]);

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  const loadBusArrivalInfo = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await getBusArrivalInfo(stationId);
      
      if (response.success) {
        setBusArrivals(response.data || []);
        setLastUpdated(new Date());
        
        // 첫 로드 시 정류장 정보 설정 (임시)
        if (!stationInfo) {
          setStationInfo({
            stationId: stationId,
            stationName: `정류장 ${stationId}`,
            stationNumber: stationId
          });
        }
        
        if (isRefresh && !autoUpdate) {
          toast.success('버스 도착 정보가 업데이트되었습니다.');
        }
      } else {
        toast.error(response.message);
        setBusArrivals([]);
      }
    } catch (error) {
      console.error('버스 도착 정보 로드 실패:', error);
      toast.error(error.message || '버스 도착 정보를 불러오는데 실패했습니다.');
      setBusArrivals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await checkBookmarkStatus(stationId);
      if (response.success) {
        setIsBookmarked(response.data.isBookmarked);
      }
    } catch (error) {
      console.error('즐겨찾기 상태 확인 실패:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        const response = await removeStationBookmark(stationId);
        if (response.success) {
          setIsBookmarked(false);
          toast.success('즐겨찾기에서 제거되었습니다.');
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await addStationBookmark(stationId, stationInfo);
        if (response.success) {
          setIsBookmarked(true);
          toast.success('즐겨찾기에 추가되었습니다.');
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error('즐겨찾기 처리 실패:', error);
      toast.error(error.message || '즐겨찾기 처리에 실패했습니다.');
    }
  };

  const handleRouteClick = (busRoute) => {
    console.log('노선 선택:', busRoute);
    toast.success(`${busRoute.routeName}번 노선이 선택되었습니다.`);
    // 향후 노선 상세 페이지로 이동하는 로직 추가
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdated) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}초 전`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}분 전`;
    } else {
      return lastUpdated.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (!stationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">잘못된 정류장 정보입니다.</p>
          <button
            onClick={() => router.push('/search')}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
          >
            검색으로 돌아가기
          </button>
        </div>
      </div>
    );
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
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {stationInfo?.stationName || '정류장 정보'}
                </h1>
                <p className="text-sm text-gray-600">
                  정류장 번호: {stationInfo?.stationNumber || stationId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isBookmarked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
                title={isBookmarked ? '즐겨찾기 제거' : '즐겨찾기 추가'}
              >
                <FiHeart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={() => loadBusArrivalInfo(true)}
                disabled={refreshing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  refreshing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">새로고침</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 실시간 도착 정보 탭 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border-b-2 border-emerald-500">
                <FiClock className="w-4 h-4" />
                <span className="font-medium">실시간 도착정보</span>
                <span className="text-sm">({busArrivals.length})</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 text-gray-500 rounded-lg">
                <FiMapPin className="w-4 h-4" />
                <span className="font-medium">라이프 및 몰가</span>
                <span className="text-sm">(3)</span>
              </div>
            </div>
            
            {/* 자동 업데이트 토글 */}
            <button
              onClick={() => setAutoUpdate(!autoUpdate)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                autoUpdate 
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoUpdate ? '자동 업데이트 비활성화' : '30초마다 자동 업데이트 활성화'}
            >
              <div className={`w-2 h-2 rounded-full ${autoUpdate ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
              <span>30초마다 업데이트</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">버스 도착 정보를 불러오는 중...</p>
            </div>
            
            {/* 로딩 스켈레톤 */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : busArrivals.length === 0 ? (
          <div className="text-center py-16">
            <FiClock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">운행 중인 버스가 없습니다</h3>
            <p className="text-gray-600 mb-6">
              현재 이 정류장에 도착 예정인 버스가 없습니다.<br/>
              잠시 후 다시 확인해보세요.
            </p>
            <button
              onClick={() => loadBusArrivalInfo(true)}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
            >
              다시 확인하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {busArrivals.map((busRoute) => (
              <BusArrivalItem
                key={busRoute.routeId}
                busRoute={busRoute}
                onRouteClick={handleRouteClick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function StationDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <StationDetailContent />
    </Suspense>
  );
}
