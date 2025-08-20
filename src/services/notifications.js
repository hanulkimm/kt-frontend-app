// 알림 관련 API 서비스
const API_BASE_URL = 'http://localhost:8080';

// 알림 목록 조회
export const getNotifications = async (userId, page = 0, size = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications?userId=${userId}&page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('알림 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '알림을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    throw {
      success: false,
      message: error.message || '알림 읽음 처리에 실패했습니다.',
      data: null
    };
  }
};

// 알림 설정 조회
export const getNotificationSettings = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/settings?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('알림 설정 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '알림 설정을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

// 알림 설정 업데이트
export const updateNotificationSettings = async (userId, settings) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
      body: JSON.stringify({
        userId: userId,
        ...settings
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('알림 설정 업데이트 실패:', error);
    throw {
      success: false,
      message: error.message || '알림 설정 업데이트에 실패했습니다.',
      data: null
    };
  }
};

// 읽지 않은 알림 조회
export const getUnreadNotifications = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('읽지 않은 알림 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '읽지 않은 알림을 불러오는데 실패했습니다.',
      data: null
    };
  }
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('모든 알림 읽음 처리 실패:', error);
    throw {
      success: false,
      message: error.message || '모든 알림 읽음 처리에 실패했습니다.',
      data: null
    };
  }
};

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unread/count?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('읽지 않은 알림 개수 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '읽지 않은 알림 개수를 불러오는데 실패했습니다.',
      data: null
    };
  }
};
