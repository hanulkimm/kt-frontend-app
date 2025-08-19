'use client';

import { FiMapPin } from 'react-icons/fi';

const FallbackMiniMap = ({ station, className = "" }) => {
  // 간단한 좌표 기반 상대적 위치 표시
  const getRelativePosition = () => {
    // 위도/경도를 0-100% 범위로 변환 (서울 기준 대략적)
    const lat = parseFloat(station.latitude);
    const lng = parseFloat(station.longitude);
    
    // 서울 대략적 좌표 범위
    const minLat = 37.4, maxLat = 37.7;
    const minLng = 126.8, maxLng = 127.2;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100; // Y축 반전
    
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  const position = getRelativePosition();

  return (
    <div className={`relative bg-gradient-to-br from-blue-50 to-emerald-50 ${className}`}>
      {/* 격자 패턴 배경 */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-4 grid-rows-3 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border border-gray-300"></div>
          ))}
        </div>
      </div>
      
      {/* 정류장 마커 */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%` 
        }}
      >
        <FiMapPin className={`w-4 h-4 ${
          station.centerYn === 'Y' ? 'text-red-500' : 'text-blue-500'
        } drop-shadow-sm`} />
      </div>
      
      {/* 정류장 정보 오버레이 */}
      <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        <div className="truncate">{station.name}</div>
      </div>
      
      {/* 차로 구분 표시 */}
      <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-xs font-medium ${
        station.centerYn === 'Y' 
          ? 'bg-red-500 text-white' 
          : 'bg-blue-500 text-white'
      }`}>
        {station.centerYn === 'Y' ? '중앙' : '일반'}
      </div>
      
      {/* 좌표 정보 */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-600 bg-white bg-opacity-80 px-1 rounded">
        {station.latitude.toFixed(3)}
      </div>
    </div>
  );
};

export default FallbackMiniMap;
