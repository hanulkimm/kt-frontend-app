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
  console.log('⭐ 즐겨찾기 정류장 조회 시작 - userId:', userId);
  
  try {
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('❌ 유효하지 않은 userId:', userId, 'parsed:', userIdNum);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    const url = `http://localhost:8080/bookmarks/stations?userId=${userIdNum}`;
    console.log('📡 요청 URL:', url);
    
    // 백엔드 API 직접 호출 - API 명세에 맞춰 수정
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📄 응답 데이터:', result);
    console.log('📄 응답 데이터 상세:', {
      success: result.success,
      message: result.message,
      dataLength: result.data?.length,
      firstItem: result.data?.[0],
      allData: result.data
    });
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: API 호출 실패`);
    }
    
    console.log('✅ 즐겨찾기 정류장 조회 성공:', result.data?.length || 0, '개');
    return result;
  } catch (error) {
    console.error('🔥 즐겨찾기 목록 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '즐겨찾기 목록을 불러오는데 실패했습니다.',
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
  console.log('⭐ 정류장 즐겨찾기 추가 시작 - stationId:', stationId, 'stationData:', stationData);
  
  try {
    const userId = localStorage.getItem('userId');
    
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('❌ 유효하지 않은 userId:', userId);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    // stationName 추출 (다양한 가능한 필드명 확인)
    const stationName = stationData?.stationName || 
                       stationData?.name || 
                       stationData?.busStationName || 
                       `정류장 ${stationId}`;
    
    const requestBody = {
      userId: userIdNum,
      stationId: stationId,
      stationName: stationName
    };
    
    console.log('📡 요청 데이터:', requestBody);
    
    // 백엔드 API 직접 호출 - 새로운 스키마에 맞춰 수정
    const response = await fetch('http://localhost:8080/bookmarks/stations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📄 응답 데이터:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: API 호출 실패`);
    }
    
    console.log('✅ 정류장 즐겨찾기 추가 성공');
    return result;
  } catch (error) {
    console.error('🔥 즐겨찾기 추가 실패:', error);
    throw {
      success: false,
      message: error.message || '즐겨찾기 추가에 실패했습니다.',
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
    
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('유효하지 않은 userId:', userId);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    // 백엔드 API 직접 호출 - API 명세에 맞춰 수정
    const response = await fetch(`http://localhost:8080/bookmarks/stations/${stationId}?userId=${userIdNum}`, {
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
    console.error('즐겨찾기 삭제 실패:', error);
    throw {
      success: false,
      message: error.message || '즐겨찾기 삭제에 실패했습니다.',
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
    
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('유효하지 않은 userId:', userId);
      return {
        success: true,
        data: { isBookmarked: false },
        message: '사용자 ID가 유효하지 않습니다.'
      };
    }
    
    // 백엔드 API 직접 호출 (즐겨찾기 목록에서 해당 stationId 존재 여부 확인) - API 명세에 맞춰 수정
    const response = await fetch(`http://localhost:8080/bookmarks/stations?userId=${userIdNum}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API 호출 실패');
    }
    
    // 즐겨찾기 목록에서 해당 stationId가 있는지 확인 (새 스키마에서는 stationId 필드 사용)
    const isBookmarked = result.data?.some(bookmark => 
      bookmark.stationId === stationId || bookmark.targetId === stationId
    ) || false;
    
    return {
      success: true,
      data: { isBookmarked },
      message: '즐겨찾기 상태 확인 완료'
    };
  } catch (error) {
    console.error('즐겨찾기 상태 확인 실패:', error);
    return {
      success: true, // 에러가 발생해도 페이지가 정상 작동하도록
      data: { isBookmarked: false },
      message: '즐겨찾기 상태 확인에 실패했습니다.'
    };
  }
};

/**
 * 노선 즐겨찾기 추가
 * @param {object} bookmarkData - 즐겨찾기 데이터 (routeId, routeName, routeNumber, stationId, stationName, staOrder 포함)
 * @returns {Promise} API 응답
 */
export const addRouteBookmark = async (bookmarkData) => {
  console.log('⭐ 노선 즐겨찾기 추가 시작 - bookmarkData:', bookmarkData);
  
  try {
    const userId = localStorage.getItem('userId');
    
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('❌ 유효하지 않은 userId:', userId);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    // 필수 데이터 추출
    const {
      routeId,
      routeName,
      routeNumber,
      stationId,
      stationName,
      staOrder
    } = bookmarkData;
    
    const requestBody = {
      userId: userIdNum,
      routeId: routeId,
      routeName: routeName,
      routeNumber: routeNumber,
      stationId: stationId,
      stationName: stationName,
      staOrder: staOrder
    };
    
    console.log('📡 요청 데이터:', requestBody);
    
    // 백엔드 API 직접 호출 - 새로운 스키마에 맞춰 수정
    const response = await fetch('http://localhost:8080/bookmarks/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📄 응답 데이터:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: API 호출 실패`);
    }
    
    console.log('✅ 노선 즐겨찾기 추가 성공');
    return result;
  } catch (error) {
    console.error('🔥 노선 즐겨찾기 추가 실패:', error);
    throw {
      success: false,
      message: error.message || '노선 즐겨찾기 추가에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 노선 즐겨찾기 삭제
 * @param {string} routeId - 노선 ID
 * @param {string} stationId - 정류장 ID (새로운 스키마에서 필요)
 * @returns {Promise} API 응답
 */
export const removeRouteBookmark = async (routeId, stationId) => {
  console.log('⭐ 노선 즐겨찾기 삭제 시작 - routeId:', routeId, 'stationId:', stationId);
  
  try {
    const userId = localStorage.getItem('userId');
    
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('❌ 유효하지 않은 userId:', userId);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    // 새로운 컨트롤러 경로에 맞춰 수정: /routes/{routeId}/stations/{stationId}
    const url = `http://localhost:8080/bookmarks/routes/${routeId}/stations/${stationId}?userId=${userIdNum}`;
    console.log('📡 요청 URL:', url);
    
    // 백엔드 API 직접 호출 - 새로운 컨트롤러에 맞춰 수정
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📄 응답 데이터:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: API 호출 실패`);
    }
    
    console.log('✅ 노선 즐겨찾기 삭제 성공');
    return result;
  } catch (error) {
    console.error('🔥 노선 즐겨찾기 삭제 실패:', error);
    throw {
      success: false,
      message: error.message || '노선 즐겨찾기 삭제에 실패했습니다.',
      data: null
    };
  }
};

/**
 * 노선 즐겨찾기 목록 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise} API 응답
 */
export const getBookmarkedRoutes = async (userId) => {
  console.log('⭐ 즐겨찾기 노선 조회 시작 - userId:', userId);
  
  try {
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('❌ 유효하지 않은 userId:', userId, 'parsed:', userIdNum);
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    const url = `http://localhost:8080/bookmarks/routes?userId=${userIdNum}`;
    console.log('📡 요청 URL:', url);
    
    // 백엔드 API 직접 호출 - 새로운 스키마에 맞춰 수정
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📄 응답 데이터:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: API 호출 실패`);
    }
    
    console.log('✅ 즐겨찾기 노선 조회 성공:', result.data?.length || 0, '개');
    return result;
  } catch (error) {
    console.error('🔥 즐겨찾기 노선 목록 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '즐겨찾기 노선 목록을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

/**
 * 노선 즐겨찾기 상태 확인
 * @param {string} routeId - 노선 ID
 * @param {string} stationId - 정류장 ID
 * @returns {Promise} API 응답
 */
export const checkRouteBookmarkStatus = async (routeId, stationId) => {
  try {
    const userId = localStorage.getItem('userId');
    
    // userId 유효성 검사
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || !userId) {
      console.error('유효하지 않은 userId:', userId);
      return {
        success: true,
        data: { isBookmarked: false },
        message: '사용자 ID가 유효하지 않습니다.'
      };
    }
    
    // 백엔드 API 직접 호출 - 노선 즐겨찾기 목록에서 해당 routeId 존재 여부 확인
    const response = await fetch(`http://localhost:8080/bookmarks/routes?userId=${userIdNum}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API 호출 실패');
    }
    
    // 즐겨찾기 목록에서 해당 routeId와 stationId가 모두 일치하는지 확인
    const isBookmarked = result.data?.some(bookmark => 
      (bookmark.routeId === routeId || bookmark.targetId === routeId) &&
      (bookmark.stationId === stationId)
    ) || false;
    
    return {
      success: true,
      data: { isBookmarked },
      message: '노선 즐겨찾기 상태 확인 완료'
    };
  } catch (error) {
    console.error('노선 즐겨찾기 상태 확인 실패:', error);
    return {
      success: true, // 에러가 발생해도 페이지가 정상 작동하도록
      data: { isBookmarked: false },
      message: '노선 즐겨찾기 상태 확인에 실패했습니다.'
    };
  }
};
