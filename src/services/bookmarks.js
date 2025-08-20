import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Axios 인스턴스 생성
const bookmarkAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - userId를 localStorage에서 가져와서 헤더에 추가
bookmarkAPI.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 공통 에러 처리
bookmarkAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Bookmark API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 즐겨찾기 정류장 목록 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const getBookmarkedStations = async (userId) => {
  try {
    const response = await bookmarkAPI.get('/bookmarks/stations', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '즐겨찾기 목록을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

/**
 * 정류장 즐겨찾기 추가
 * @param {string} stationId - 정류장 ID
 * @param {object} stationData - 정류장 정보
 * @returns {Promise} API 응답
 */
export const addStationBookmark = async (stationId, stationData) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await bookmarkAPI.post('/bookmarks/stations', {
      stationId,
      userId,
      ...stationData
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '즐겨찾기 추가에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 정류장 즐겨찾기 삭제
 * @param {string} stationId - 정류장 ID
 * @returns {Promise} API 응답
 */
export const removeStationBookmark = async (stationId) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await bookmarkAPI.delete(`/bookmarks/stations/${stationId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '즐겨찾기 삭제에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 정류장 즐겨찾기 상태 확인
 * @param {string} stationId - 정류장 ID
 * @returns {Promise} API 응답
 */
export const checkBookmarkStatus = async (stationId) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await bookmarkAPI.get(`/bookmarks/stations/${stationId}/status`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '즐겨찾기 상태 확인에 실패했습니다.',
      data: { isBookmarked: false }
    };
  }
};

/**
 * 노선 즐겨찾기 추가
 * @param {string} routeId - 노선 ID
 * @param {object} routeData - 노선 정보
 * @returns {Promise} API 응답
 */
export const addRouteBookmark = async (routeId, routeData) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await bookmarkAPI.post('/bookmarks/routes', {
      routeId,
      userId,
      routeName: routeData.routeName,
      routeDestName: routeData.routeDestName,
      routeTypeCd: routeData.routeTypeCd
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '노선 즐겨찾기 추가에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 노선 즐겨찾기 삭제
 * @param {string} routeId - 노선 ID
 * @returns {Promise} API 응답
 */
export const removeRouteBookmark = async (routeId) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await bookmarkAPI.delete(`/bookmarks/routes/${routeId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '노선 즐겨찾기 삭제에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 노선 즐겨찾기 상태 확인
 * @param {string} routeId - 노선 ID
 * @returns {Promise} API 응답
 */
export const checkRouteBookmarkStatus = async (routeId) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await bookmarkAPI.get(`/bookmarks/routes/${routeId}/status`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '노선 즐겨찾기 상태 확인에 실패했습니다.',
      data: { isBookmarked: false }
    };
  }
};
