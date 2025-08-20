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
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('유효하지 않은 userId:', userId);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    // 백엔드 API 직접 호출 - API 명세에 맞춰 수정
    const response = await fetch(`http://localhost:8080/search/history?userId=${userIdNum}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API 호출 실패');
    }
    
    return result;
  } catch (error) {
    console.error('검색 기록 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '검색 기록을 불러오는데 실패했습니다.',
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
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('유효하지 않은 userId:', userId);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    // 백엔드 API 직접 호출 - API 명세에 맞춰 수정
    const response = await fetch(`http://localhost:8080/search/history/${historyId}?userId=${userIdNum}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API 호출 실패');
    }
    
    return result;
  } catch (error) {
    console.error('검색 기록 삭제 실패:', error);
    throw {
      success: false,
      message: error.message || '검색 기록 삭제에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 공공데이터 API를 통한 정류장 검색
 * @param {string} query - 검색어
 * @param {string} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const searchStations = async (query, userId) => {
  try {
    // 클라이언트 사이드에서는 환경변수를 직접 사용할 수 없으므로 API 라우트를 통해 호출
    const response = await fetch('/api/search/stations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: query,
        userId: userId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || '검색 결과를 가져올 수 없습니다.');
    }
  } catch (error) {
    console.error('정류장 검색 API 오류:', error);
    
    throw {
      success: false,
      message: error.message || '정류장 검색에 실패했습니다. 네트워크 연결을 확인해주세요.',
      data: null
    };
  }
};

/**
 * 검색 기록 추가 (향후 구현 예정)
 * @param {string} query - 검색어
 * @param {string} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const addSearchHistory = async (keyword, userId) => {
  try {
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('유효하지 않은 userId:', userId);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    // 백엔드 API 직접 호출 - API 명세에 맞춰 수정
    const response = await fetch('http://localhost:8080/search/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userIdNum, // 검증된 숫자
        keyword: keyword
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API 호출 실패');
    }
    
    return result;
  } catch (error) {
    console.error('검색 기록 저장 실패:', error);
    throw {
      success: false,
      message: error.message || '검색 기록 저장에 실패했습니다.',
      data: null
    };
  }
};
