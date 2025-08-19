import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Axios 인스턴스 생성
const searchAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - userId를 localStorage에서 가져와서 헤더에 추가
searchAPI.interceptors.request.use(
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
searchAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 검색 기록 조회
 * @param {string} userId - 사용자 ID
 * @param {number} limit - 조회할 기록 수 (기본값: 5)
 * @returns {Promise} API 응답
 */
export const getSearchHistory = async (userId, limit = 5) => {
  try {
    const response = await searchAPI.get(`/search/history`, {
      params: { userId, limit }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '검색 기록을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

/**
 * 검색 기록 삭제
 * @param {string} historyId - 삭제할 기록 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const deleteSearchHistory = async (historyId, userId) => {
  try {
    const response = await searchAPI.delete(`/search/history/${historyId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '검색 기록 삭제에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 정류장 검색 (향후 구현 예정)
 * @param {string} query - 검색어
 * @param {string} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const searchStations = async (query, userId) => {
  // 현재는 더미 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [
          {
            id: '23001',
            name: '강남역',
            number: '23001',
            distance: '120m',
            latitude: 37.498095,
            longitude: 127.027610
          },
          {
            id: '23045',
            name: '역삼역.한국지식재산센터',
            number: '23045',
            distance: '350m',
            latitude: 37.500773,
            longitude: 127.035567
          },
          {
            id: '12345',
            name: '대학역(중)',
            number: '12345',
            distance: '500m',
            latitude: 37.502345,
            longitude: 127.040123
          }
        ],
        message: '검색이 완료되었습니다.'
      });
    }, 500);
  });
};

/**
 * 검색 기록 추가 (향후 구현 예정)
 * @param {string} query - 검색어
 * @param {string} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const addSearchHistory = async (query, userId) => {
  try {
    const response = await searchAPI.post('/search/history', {
      query,
      userId
    });
    return response.data;
  } catch (error) {
    throw {
      success: false,
      message: error.response?.data?.message || '검색 기록 저장에 실패했습니다.',
      data: null
    };
  }
};
