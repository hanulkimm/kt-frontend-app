// 리뷰 관련 API 서비스
const API_BASE_URL = 'http://localhost:8080';

// 특정 대상의 리뷰 조회
export const getReviewsByTarget = async (targetId, targetKind = 'station') => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews?targetId=${targetId}&targetKind=${targetKind}`, {
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
    console.error('리뷰 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '리뷰를 불러오는데 실패했습니다.',
      data: null
    };
  }
};

// 사용자의 리뷰 조회
export const getReviewsByUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews?userId=${userId}`, {
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
    console.error('사용자 리뷰 조회 실패:', error);
    throw {
      success: false,
      message: error.message || '사용자 리뷰를 불러오는데 실패했습니다.',
      data: null
    };
  }
};

// 리뷰 작성
export const createReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    throw {
      success: false,
      message: error.message || '리뷰 작성에 실패했습니다.',
      data: null
    };
  }
};

// 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'Accept-Charset': 'utf-8'
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 호출 실패`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw {
      success: false,
      message: error.message || '리뷰 수정에 실패했습니다.',
      data: null
    };
  }
};

// 리뷰 삭제
export const deleteReview = async (reviewId, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}?userId=${userId}`, {
      method: 'DELETE',
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
    console.error('리뷰 삭제 실패:', error);
    throw {
      success: false,
      message: error.message || '리뷰 삭제에 실패했습니다.',
      data: null
    };
  }
};
