/**
 * 버스 노선 관련 서비스 함수들
 */

/**
 * 노선의 경유 정류소 목록 조회
 * @param {string} routeId - 노선 ID
 * @returns {Promise} API 응답
 */
export const getBusRouteStations = async (routeId) => {
  try {
    console.log('🚏 노선 경유 정류소 목록 조회 시작:', routeId);
    
    const response = await fetch('/api/bus/route/stations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ routeId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🚏 노선 경유 정류소 목록 조회 성공:', data.data?.length || 0, '개');
    return data;
  } catch (error) {
    console.error('🔥 노선 경유 정류소 목록 조회 오류:', error);
    throw {
      success: false,
      message: error.message || '노선의 경유 정류소 목록을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

/**
 * 정류소 순서에 따른 거리 계산 (임시 함수)
 * @param {number} stationSeq - 정류소 순서
 * @returns {string} 거리 문자열
 */
export const calculateStationDistance = (stationSeq) => {
  // 실제로는 GPS 좌표를 이용해서 계산해야 하지만, 
  // 간단히 정류소 순서에 비례해서 거리를 계산
  const baseDistance = (stationSeq - 1) * 0.8; // 정류소간 평균 800m 가정
  return `${baseDistance.toFixed(1)}km`;
};

/**
 * 두 GPS 좌표 간의 거리 계산 (하버사인 공식)
 * @param {number} lat1 - 첫 번째 위도
 * @param {number} lon1 - 첫 번째 경도  
 * @param {number} lat2 - 두 번째 위도
 * @param {number} lon2 - 두 번째 경도
 * @returns {number} 거리 (km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

/**
 * 정류소 목록에 누적 거리 정보 추가
 * @param {Array} stations - 정류소 목록
 * @returns {Array} 거리 정보가 추가된 정류소 목록
 */
export const addDistanceToStations = (stations) => {
  if (!stations || stations.length === 0) return [];
  
  let cumulativeDistance = 0;
  
  return stations.map((station, index) => {
    if (index > 0) {
      const prevStation = stations[index - 1];
      const distance = calculateDistance(
        prevStation.latitude, 
        prevStation.longitude,
        station.latitude,
        station.longitude
      );
      cumulativeDistance += distance;
    }
    
    return {
      ...station,
      distance: `${cumulativeDistance.toFixed(1)}km`
    };
  });
};
