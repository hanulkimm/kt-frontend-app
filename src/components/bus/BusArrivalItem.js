'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiUsers, FiMapPin, FiHeart } from 'react-icons/fi';
import { getBusTypeInfo, getCrowdedInfo, getLowPlateInfo } from '../../services/busArrival';
import { addRouteBookmark, removeRouteBookmark, checkRouteBookmarkStatus } from '../../services/bookmarks';
import toast from 'react-hot-toast';

const BusArrivalItem = ({ busRoute, onRouteClick }) => {
  const busTypeInfo = getBusTypeInfo(busRoute.routeTypeCd);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    checkBookmark();
  }, [busRoute.routeId]);

  const checkBookmark = async () => {
    try {
      const response = await checkRouteBookmarkStatus(busRoute.routeId);
      if (response.success) {
        setIsBookmarked(response.data.isBookmarked);
      }
    } catch (error) {
      console.error('노선 즐겨찾기 상태 확인 실패:', error);
    }
  };

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation(); // 버스 카드 클릭 이벤트 방지
    
    try {
      if (isBookmarked) {
        const response = await removeRouteBookmark(busRoute.routeId);
        if (response.success) {
          setIsBookmarked(false);
          toast.success('노선 즐겨찾기에서 제거되었습니다.');
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await addRouteBookmark(busRoute.routeId, busRoute);
        if (response.success) {
          setIsBookmarked(true);
          toast.success('노선이 즐겨찾기에 추가되었습니다.');
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error('노선 즐겨찾기 처리 실패:', error);
      toast.error(error.message || '즐겨찾기 처리에 실패했습니다.');
    }
  };

  // 현재 시간에 예상 도착 시간을 더해서 실제 도착 시간 계산
  const getActualArrivalTime = (predictTime) => {
    if (!predictTime) return '';
    
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + (predictTime * 60 * 1000));
    return arrivalTime.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
  
  const renderBusInfo = (busInfo, label) => {
    if (!busInfo.plateNo && !busInfo.predictTime) {
      return null;
    }

    const crowdedInfo = getCrowdedInfo(busInfo.crowded);
    const lowPlateInfo = getLowPlateInfo(busInfo.lowPlate);
    const actualArrivalTime = getActualArrivalTime(busInfo.predictTime);
    
    return (
      <div className="flex items-center justify-between py-4">
        {/* 왼쪽: 도착 시간 및 버스 정보 */}
        <div className="flex items-center gap-4">
          {/* 시계 아이콘 */}
          <div className="text-emerald-500">
            <FiClock className="w-5 h-5" />
          </div>
          
          {/* 도착 시간 정보 */}
          <div>
            <div className={`text-lg font-bold ${
              busInfo.predictTime <= 3 ? 'text-red-600' : 
              busInfo.predictTime <= 10 ? 'text-orange-600' : 'text-emerald-600'
            }`}>
              {busInfo.predictTime ? `${busInfo.predictTime}분` : '곧 도착'}
            </div>
            <div className="text-sm text-gray-500">
              ({actualArrivalTime})
            </div>
          </div>
          
          {/* 버스 번호판 */}
          <div className="text-sm font-medium text-gray-700 min-w-[80px]">
            {busInfo.plateNo || '정보없음'}
          </div>
          
          {/* 현재 위치 */}
          <div className="text-sm text-gray-600">
            현재 위치: {busInfo.stationName || `${busInfo.locationNo || 0}번째 전`}
          </div>
          
          {/* 운행 상태 */}
          <div className="text-sm text-emerald-600 font-medium">
            {busRoute.flag === 'PASS' ? '운행중' : '대기중'}
          </div>
        </div>

        {/* 오른쪽: 버스 상태 정보 */}
        <div className="flex items-center gap-3">
          {/* 혼잡도 */}
          <div className="flex items-center gap-1">
            <FiUsers className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${
              busInfo.crowded === 0 ? 'text-emerald-600' :
              busInfo.crowded === 1 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {crowdedInfo.text}
            </span>
          </div>
          
          {/* 빈자리 수 */}
          {busInfo.remainSeatCnt !== null && busInfo.remainSeatCnt >= 0 && (
            <span className="text-sm text-gray-600">
              {busInfo.remainSeatCnt}석 여유
            </span>
          )}
          
          {/* 저상버스 */}
          {lowPlateInfo.isLow && (
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {lowPlateInfo.text}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 노선 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* 노선 번호 */}
          <div className={`px-3 py-2 rounded-lg text-white font-bold text-lg min-w-[60px] text-center ${busTypeInfo.bgColor}`}>
            {busRoute.routeName}
          </div>
          
          {/* 목적지 */}
          <div>
            <div className="font-medium text-gray-900 text-lg">{busRoute.routeDestName} 방면</div>
            <div className="text-sm text-gray-600">{busTypeInfo.text}</div>
          </div>
        </div>

        {/* 즐겨찾기 + 알림 설정 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-full transition-all duration-200 ${
              isBookmarked ? 'text-emerald-500 bg-emerald-50' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
            }`}
            title={isBookmarked ? '노선 즐겨찾기 제거' : '노선 즐겨찾기 추가'}
          >
            <FiHeart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <span>🔔</span>
            <span>알림설정</span>
          </button>
        </div>
      </div>

      {/* 버스 도착 정보 */}
      <div className="px-4">
        {/* 첫 번째 버스 */}
        {renderBusInfo(busRoute.bus1, '첫 번째')}
        
        {/* 구분선 */}
        {(busRoute.bus1.plateNo || busRoute.bus1.predictTime) && (busRoute.bus2.plateNo || busRoute.bus2.predictTime) && (
          <div className="border-t border-gray-100"></div>
        )}
        
        {/* 두 번째 버스 */}
        {renderBusInfo(busRoute.bus2, '두 번째')}
      </div>
    </div>
  );
};

export default BusArrivalItem;
