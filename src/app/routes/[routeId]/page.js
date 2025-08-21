'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { FiArrowLeft, FiRefreshCw, FiClock, FiHeart, FiMap } from 'react-icons/fi';
import { addRouteBookmark, removeRouteBookmark, checkRouteBookmarkStatus } from '../../../services/bookmarks';
import { getBusArrivalItem } from '../../../services/busArrival';
import { getBusRouteStations, addDistanceToStations } from '../../../services/busRoute';
import toast from 'react-hot-toast';

function RouteDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = params.routeId;
  
  // URL에서 전달받은 노선 정보
  const routeName = searchParams.get('routeName');
  const routeNumber = searchParams.get('routeNumber');
  const stationId = searchParams.get('stationId');
  const stationName = searchParams.get('stationName');
  const staOrder = searchParams.get('staOrder');
  
  const [routeInfo, setRouteInfo] = useState(null);
  const [busArrival, setBusArrival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [routeStations, setRouteStations] = useState([]);
  const [routeStationsLoading, setRouteStationsLoading] = useState(true);

  useEffect(() => {
    if (routeId && stationId && staOrder) {
      loadRouteInfo();
      loadBusArrivalInfo();
      checkBookmark();
      loadRouteStations();
    }
  }, [routeId, stationId, staOrder]);

  const loadRouteInfo = async () => {
    try {
      // URL 파라미터로부터 노선 정보 설정
      setRouteInfo({
        routeId: routeId,
        routeName: decodeURIComponent(routeName || ''),
        routeNumber: decodeURIComponent(routeNumber || ''),
        stationId: stationId,
        stationName: decodeURIComponent(stationName || ''),
        staOrder: parseInt(staOrder || '0')
      });
    } catch (error) {
      console.error('노선 정보 로드 실패:', error);
    }
  };

  const loadBusArrivalInfo = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await getBusArrivalItem(routeId, stationId, staOrder);
      
      if (response.success) {
        setBusArrival(response.data);
        setLastUpdated(new Date());
        
        if (isRefresh) {
          toast.success('버스 도착 정보가 업데이트되었습니다.');
        }
      } else {
        toast.error(response.message);
        setBusArrival(null);
      }
    } catch (error) {
      console.error('버스 도착 정보 로드 실패:', error);
      toast.error(error.message || '버스 도착 정보를 불러오는데 실패했습니다.');
      setBusArrival(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await checkRouteBookmarkStatus(routeId, stationId);
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
        const response = await removeRouteBookmark(routeId, stationId);
        if (response.success) {
          setIsBookmarked(false);
          toast.success('즐겨찾기에서 제거되었습니다.');
        } else {
          toast.error(response.message);
        }
      } else {
        const bookmarkData = {
          routeId: routeId,
          routeName: routeInfo?.routeName || routeName,
          routeNumber: routeInfo?.routeNumber || routeNumber,
          stationId: stationId,
          stationName: routeInfo?.stationName || stationName,
          staOrder: parseInt(staOrder)
        };
        
        const response = await addRouteBookmark(bookmarkData);
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



  // 노선 경유 정류소 목록 로드
  const loadRouteStations = async () => {
    try {
      setRouteStationsLoading(true);
      console.log('🚏 노선 경유 정류소 목록 로드 시작:', routeId);
      
      const response = await getBusRouteStations(routeId);
      
      if (response.success && response.data) {
        console.log('🚏 노선 경유 정류소 목록 로드 성공:', response.data.length, '개');
        
        // GPS 좌표를 이용해서 누적 거리 계산
        const stationsWithDistance = addDistanceToStations(response.data);
        
        // stationSeq 순으로 정렬
        const sortedStations = stationsWithDistance.sort((a, b) => a.stationSeq - b.stationSeq);
        
        setRouteStations(sortedStations);
        
        console.log('🚏 정류소 목록 처리 완료:', {
          총개수: sortedStations.length,
          첫번째정류소: sortedStations[0]?.stationName,
          마지막정류소: sortedStations[sortedStations.length - 1]?.stationName
        });
      } else {
        console.warn('⚠️ 노선 경유 정류소 데이터 없음:', response.message);
        setRouteStations([]);
        toast.warn('노선의 경유 정류소 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('🔥 노선 경유 정류소 로드 실패:', error);
      setRouteStations([]);
      toast.error('노선 경유 정류소 정보를 불러오는데 실패했습니다.');
    } finally {
      setRouteStationsLoading(false);
    }
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

  const formatPredictTime = (predictTime) => {
    if (!predictTime || predictTime <= 0) return '도착 정보 없음';
    return `${predictTime}분 후`;
  };

  if (!routeId || !stationId || !staOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">잘못된 노선 정보입니다.</p>
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
                  {routeInfo?.routeName || routeName}번 버스
                </h1>
                <p className="text-sm text-gray-600">
                  {routeInfo?.stationName || stationName} 정류장
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

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 실시간 도착 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiClock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">실시간 도착 정보</h2>
            {lastUpdated && (
              <span className="text-sm text-gray-500 ml-auto">
                마지막 업데이트: {formatLastUpdated()}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-gray-600">버스 도착 정보를 불러오는 중...</p>
            </div>
          ) : busArrival ? (
            <div className="space-y-4">
              {/* 첫 번째 버스 */}
              {(busArrival.predictTime1 > 0 || busArrival.plateNo1) && (
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {busArrival.plateNo1 || '차량번호 미확인'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {busArrival.locationNo1 ? `${busArrival.locationNo1}번째 전` : '위치 정보 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      {formatPredictTime(busArrival.predictTime1)}
                    </p>
                    {busArrival.crowded1 !== undefined && (
                      <p className="text-sm text-gray-600">
                        혼잡도: {busArrival.crowded1 === 0 ? '여유' : busArrival.crowded1 === 1 ? '보통' : '혼잡'}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* 두 번째 버스 */}
              {(busArrival.predictTime2 > 0 || busArrival.plateNo2) && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {busArrival.plateNo2 || '차량번호 미확인'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {busArrival.locationNo2 ? `${busArrival.locationNo2}번째 전` : '위치 정보 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">
                      {formatPredictTime(busArrival.predictTime2)}
                    </p>
                    {busArrival.crowded2 !== undefined && (
                      <p className="text-sm text-gray-600">
                        혼잡도: {busArrival.crowded2 === 0 ? '여유' : busArrival.crowded2 === 1 ? '보통' : '혼잡'}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* 버스 정보가 없는 경우 */}
              {!busArrival.predictTime1 && !busArrival.plateNo1 && !busArrival.predictTime2 && !busArrival.plateNo2 && (
                <div className="text-center py-8">
                  <FiClock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">현재 운행 중인 버스가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiClock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">버스 도착 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>



        {/* 전체 노선 경로 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiMap className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">전체 노선 경로</h2>
            {routeStationsLoading && (
              <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">로딩 중...</span>
            )}
            {!routeStationsLoading && routeStations.length > 0 && (
              <span className="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded">
                총 {routeStations.length}개 정류장
              </span>
            )}
          </div>
          
          {routeStationsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">노선 경유 정류소를 불러오는 중...</p>
            </div>
          ) : routeStations.length === 0 ? (
            <div className="text-center py-8">
              <FiMap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">노선 경유 정류소 정보가 없습니다</p>
              <p className="text-sm text-gray-500">API에서 데이터를 가져올 수 없습니다.</p>
            </div>
                     ) : (
             <div className="space-y-4">
               {/* 현재 정류장을 맨 위에 강조 표시 */}
               {(() => {
                 const currentStation = routeStations.find(station => station.stationId === stationId);
                 
                 if (currentStation) {
                   return (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                         <h3 className="text-sm font-semibold text-emerald-700">현재 위치</h3>
                       </div>
                       <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="relative">
                               <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                 {currentStation.stationSeq}
                               </div>
                               <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center">
                                 <span className="text-white text-xs">📍</span>
                               </div>
                             </div>
                             <div>
                               <p className="font-bold text-emerald-900 text-lg">{currentStation.stationName}</p>
                               <div className="flex items-center gap-3 mt-1">
                                 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                   현재 정류장
                                 </span>
                                 {currentStation.centerYn === 'Y' && (
                                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                     중앙차로
                                   </span>
                                 )}
                                 {currentStation.regionName && (
                                   <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                     {currentStation.regionName}
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-lg font-bold text-emerald-700">{currentStation.distance}</p>
                             <p className="text-xs text-gray-500">누적거리</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 }
                 return null;
               })()}

               {/* 전체 노선 목록 */}
               <div>
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                   <h3 className="text-sm font-semibold text-gray-700">전체 노선 경로</h3>
                   <span className="text-xs text-gray-500">({routeStations.length}개 정류장)</span>
                 </div>
                 
                 <div className="max-h-80 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                   {routeStations.map((station, index) => {
                     const isCurrentStation = station.stationId === stationId;
                     const isPreviousStation = index < routeStations.findIndex(s => s.stationId === stationId);
                     const isNextStation = index > routeStations.findIndex(s => s.stationId === stationId);
                     
                     return (
                       <div
                         key={station.stationId}
                         className={`relative flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                           isCurrentStation
                             ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                             : isPreviousStation
                             ? 'bg-blue-50 border-blue-200 opacity-75'
                             : isNextStation
                             ? 'bg-orange-50 border-orange-200'
                             : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                         }`}
                       >
                         {/* 연결선 */}
                         {index < routeStations.length - 1 && (
                           <div className={`absolute left-6 top-12 w-0.5 h-6 ${
                             isCurrentStation
                               ? 'bg-emerald-300'
                               : isPreviousStation
                               ? 'bg-blue-300'
                               : 'bg-gray-300'
                           }`}></div>
                         )}
                         
                         <div className="flex items-center gap-3 flex-1">
                           <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                             isCurrentStation
                               ? 'bg-emerald-500 text-white ring-4 ring-emerald-200' 
                               : isPreviousStation
                               ? 'bg-blue-500 text-white'
                               : isNextStation
                               ? 'bg-orange-500 text-white'
                               : 'bg-gray-400 text-white'
                           }`}>
                             {station.stationSeq}
                             {isCurrentStation && (
                               <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full"></div>
                             )}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                             <p className={`font-medium truncate ${
                               isCurrentStation ? 'text-emerald-900' : 'text-gray-900'
                             }`}>
                               {station.stationName}
                             </p>
                             
                             <div className="flex items-center gap-2 mt-1">
                               {isCurrentStation && (
                                 <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                                   현재
                                 </span>
                               )}
                               {isPreviousStation && (
                                 <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                   지나온 곳
                                 </span>
                               )}
                               {isNextStation && (
                                 <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                   다음 정류장
                                 </span>
                               )}
                               {station.centerYn === 'Y' && (
                                 <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                   중앙차로
                                 </span>
                               )}
                               {station.regionName && (
                                 <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                   {station.regionName}
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>
                         
                         <div className="text-right ml-3">
                           <p className={`text-sm font-medium ${
                             isCurrentStation ? 'text-emerald-700' : 'text-gray-600'
                           }`}>
                             {station.distance}
                           </p>
                           <p className="text-xs text-gray-400">누적</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             </div>
          )}
        </div>


      </main>
    </div>
  );
}

export default function RouteDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <RouteDetailContent />
    </Suspense>
  );
}
