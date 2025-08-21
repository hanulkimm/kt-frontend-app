import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Axios 인스턴스 생성
const busArrivalAPI = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 공통 에러 처리
busArrivalAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Bus Arrival API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 정류장의 모든 버스 노선 목록 조회 (정류장 상세 페이지용)
 * @param {string} stationId - 정류장 ID
 * @returns {Promise} API 응답
 */
export const getBusArrivalList = async (stationId) => {
  try {
    const response = await fetch('/api/bus/arrival/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stationId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('정류장 버스 목록 조회 오류:', error);
    throw {
      success: false,
      message: error.message || '정류장의 버스 목록을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

/**
 * 특정 노선의 버스 도착 정보 조회 (알림용)
 * @param {string} stationId - 정류장 ID
 * @returns {Promise} API 응답
 */
export const getBusArrivalInfo = async (stationId) => {
  try {
    const response = await busArrivalAPI.get('/bus/arrival', {
      params: { stationId }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '버스 도착 정보를 불러오는데 실패했습니다.',
      data: null
    };
  }
};

/**
 * 혼잡도 텍스트 변환
 * @param {number} crowded - 혼잡도 코드 (0: 여유, 1: 보통, 2: 혼잡)
 * @returns {object} 혼잡도 정보
 */
export const getCrowdedInfo = (crowded) => {
  switch (crowded) {
    case 0:
      return { text: '여유', color: 'text-green-600', bgColor: 'bg-green-100' };
    case 1:
      return { text: '보통', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    case 2:
      return { text: '혼잡', color: 'text-red-600', bgColor: 'bg-red-100' };
    default:
      return { text: '정보없음', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
};

/**
 * 버스 타입 정보 변환
 * @param {number} routeTypeCd - 노선 타입 코드
 * @returns {object} 버스 타입 정보
 */
export const getBusTypeInfo = (routeTypeCd) => {
  switch (routeTypeCd) {
    case 11:
      return { text: '일반', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    case 12:
      return { text: '좌석', color: 'text-green-600', bgColor: 'bg-green-500' };
    case 13:
      return { text: '마을', color: 'text-green-600', bgColor: 'bg-green-600' };
    case 14:
      return { text: '광역', color: 'text-red-600', bgColor: 'bg-red-500' };
    case 15:
      return { text: '급행', color: 'text-red-600', bgColor: 'bg-red-600' };
    case 16:
      return { text: '직행', color: 'text-red-600', bgColor: 'bg-red-700' };
    default:
      return { text: '기타', color: 'text-gray-600', bgColor: 'bg-gray-500' };
  }
};

/**
 * 저상버스 여부 확인
 * @param {number} lowPlate - 저상버스 코드 (0: 일반, 1: 저상, 2: 굴절)
 * @returns {object} 저상버스 정보
 */
export const getLowPlateInfo = (lowPlate) => {
  switch (lowPlate) {
    case 0:
      return { text: '일반', isLow: false };
    case 1:
      return { text: '저상', isLow: true };
    case 2:
      return { text: '굴절', isLow: true };
    default:
      return { text: '정보없음', isLow: false };
  }
};

/**
 * 운행 상태 정보 변환
 * @param {number} stateCd - 운행 상태 코드 (0: 운행, 1: 회차지, 2: 차고지)
 * @returns {object} 운행 상태 정보
 */
export const getStateInfo = (stateCd) => {
  switch (stateCd) {
    case 0:
      return { text: '운행중', color: 'text-green-600' };
    case 1:
      return { text: '회차지', color: 'text-yellow-600' };
    case 2:
      return { text: '차고지', color: 'text-gray-600' };
    default:
      return { text: '정보없음', color: 'text-gray-600' };
  }
};

/**
 * 도착 시간을 분:초 형태로 변환
 * @param {number} seconds - 초 단위 시간
 * @returns {string} 분:초 형태 문자열
 */
export const formatArrivalTime = (seconds) => {
  if (!seconds || seconds <= 0) return '곧 도착';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}초`;
  } else if (minutes < 60) {
    return `${minutes}분`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  }
};
