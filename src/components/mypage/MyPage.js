'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { getBookmarkedStations, getBookmarkedRoutes, removeStationBookmark, removeRouteBookmark } from '../../services/bookmarks';
import { getMyReviews, updateReview, deleteReview } from '../../services/reviews';
import toast from 'react-hot-toast';

const MyPage = () => {
  const router = useRouter();
  const [bookmarkedStations, setBookmarkedStations] = useState([]);
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);

  // 한글 디코딩 유틸리티 함수
  const decodeKoreanText = (text) => {
    if (!text || typeof text !== 'string') return text;
    try {
      if (text.includes('%')) {
        return decodeURIComponent(text);
      }
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value;
    } catch (error) {
      console.warn('텍스트 디코딩 실패:', text, error);
      return text;
    }
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      const existingUserId = localStorage.getItem('userId');
      const existingUserEmail = localStorage.getItem('userEmail');
      
      if (!existingUserId) {
        console.log('로그인되지 않은 사용자 - 로그인 페이지로 리다이렉트');
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return false;
      }
      
      setUserEmail(existingUserEmail || '');
      return true;
    };

    if (checkAuthStatus()) {
      loadBookmarkedStations();
      loadBookmarkedRoutes();
      loadMyReviews();
    }
  }, [router]);

  const loadBookmarkedStations = async () => {
    try {
      setBookmarksLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setBookmarkedStations([]);
        setBookmarksLoading(false);
        return;
      }

      const response = await getBookmarkedStations(userId);
      if (response.success) {
        const bookmarks = response.data || [];
        const processedBookmarks = bookmarks.map(bookmark => ({
          ...bookmark,
          stationName: decodeKoreanText(bookmark.stationName),
          name: decodeKoreanText(bookmark.name)
        }));
        
        setBookmarkedStations(processedBookmarks);
      } else {
        setBookmarkedStations([]);
        toast.error('정류장 즐겨찾기를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 정류장 로드 오류:', error);
      setBookmarkedStations([]);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const loadBookmarkedRoutes = async () => {
    try {
      setRoutesLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setBookmarkedRoutes([]);
        setRoutesLoading(false);
        return;
      }

      const response = await getBookmarkedRoutes(userId);
      if (response.success) {
        const routes = response.data || [];
        const processedRoutes = routes.map(route => ({
          ...route,
          routeName: decodeKoreanText(route.routeName),
          routeNumber: decodeKoreanText(route.routeNumber),
          stationName: decodeKoreanText(route.stationName)
        }));
        
        setBookmarkedRoutes(processedRoutes);
      } else {
        setBookmarkedRoutes([]);
        toast.error('노선 즐겨찾기를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 노선 로드 오류:', error);
      setBookmarkedRoutes([]);
    } finally {
      setRoutesLoading(false);
    }
  };

  const loadMyReviews = async () => {
    try {
      setReviewsLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setMyReviews([]);
        setReviewsLoading(false);
        return;
      }

      const response = await getMyReviews(userId);
      if (response.success) {
        const reviews = response.data || [];
        const processedReviews = reviews.map(review => ({
          ...review,
          content: decodeKoreanText(review.content),
          stationName: decodeKoreanText(review.stationName)
        }));
        
        setMyReviews(processedReviews);
      } else {
        setMyReviews([]);
        toast.error('내 리뷰를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('내 리뷰 로드 오류:', error);
      setMyReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    toast.success('로그아웃되었습니다.');
    
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  const handleBackToSearch = () => {
    router.push('/search');
  };

  const handleStationClick = (station) => {
    const stationId = station.stationId || station.targetId || station.id;
    const stationName = station.stationName || station.name || '정류장';
    const encodedStationName = encodeURIComponent(stationName);
    window.location.href = `/search/stations/${stationId}?name=${encodedStationName}`;
  };

  const handleRouteClick = (route) => {
    // 노선 상세 페이지로 이동하는 로직
    const stationId = route.stationId;
    const stationName = route.stationName || '정류장';
    const encodedStationName = encodeURIComponent(stationName);
    window.location.href = `/search/stations/${stationId}?name=${encodedStationName}`;
  };

  const handleRemoveStationBookmark = async (station, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    try {
      const stationId = station.stationId || station.targetId || station.id;
      const response = await removeStationBookmark(stationId);
      
      if (response.success) {
        toast.success('정류장 즐겨찾기가 해제되었습니다.');
        // 목록에서 제거
        setBookmarkedStations(prev => 
          prev.filter(item => 
            (item.stationId || item.targetId || item.id) !== stationId
          )
        );
      } else {
        toast.error(response.message || '즐겨찾기 해제에 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 해제 오류:', error);
      toast.error('즐겨찾기 해제에 실패했습니다.');
    }
  };

  const handleRemoveRouteBookmark = async (route, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    try {
      const routeId = route.routeId;
      const stationId = route.stationId;
      const response = await removeRouteBookmark(routeId, stationId);
      
      if (response.success) {
        toast.success('노선 즐겨찾기가 해제되었습니다.');
        // 목록에서 제거
        setBookmarkedRoutes(prev => 
          prev.filter(item => 
            !(item.routeId === routeId && item.stationId === stationId)
          )
        );
      } else {
        toast.error(response.message || '즐겨찾기 해제에 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 해제 오류:', error);
      toast.error('즐겨찾기 해제에 실패했습니다.');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditContent(review.content || '');
    setEditRating(review.rating || 5);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditContent('');
    setEditRating(5);
  };

  const handleSaveReview = async () => {
    if (!editingReview || !editContent.trim()) {
      toast.error('리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const response = await updateReview(editingReview.id, {
        content: editContent.trim(),
        rating: editRating,
        userId: userId
      });

      if (response.success) {
        toast.success('리뷰가 수정되었습니다.');
        // 목록 업데이트
        setMyReviews(prev => 
          prev.map(review => 
            review.id === editingReview.id 
              ? { ...review, content: editContent.trim(), rating: editRating }
              : review
          )
        );
        handleCancelEdit();
      } else {
        toast.error(response.message || '리뷰 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 수정 오류:', error);
      toast.error('리뷰 수정에 실패했습니다.');
    }
  };

  const handleDeleteReview = async (reviewId, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const response = await deleteReview(reviewId, userId);

      if (response.success) {
        toast.success('리뷰가 삭제되었습니다.');
        // 목록에서 제거
        setMyReviews(prev => prev.filter(review => review.id !== reviewId));
      } else {
        toast.error(response.message || '리뷰 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      toast.error('리뷰 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '날짜 정보 없음';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSearch}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
                <p className="text-sm text-gray-600">내 정보 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors duration-200"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 사용자 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userEmail ? userEmail.split('@')[0] : '사용자'}님
              </h2>
              <p className="text-gray-600">{userEmail}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>즐겨찾기 정류장: {bookmarkedStations.length}개</span>
                <span>즐겨찾기 노선: {bookmarkedRoutes.length}개</span>
                <span>내 리뷰: {myReviews.length}개</span>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors duration-200 ${
                activeTab === 'bookmarks'
                  ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              즐겨찾기 목록
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors duration-200 ${
                activeTab === 'reviews'
                  ? 'text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              내가 쓴 리뷰
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6">
            {activeTab === 'bookmarks' ? (
              <div className="space-y-6">
                {/* 즐겨찾기 정류장과 노선을 같은 선상에 표시 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 즐겨찾기 정류장 */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">❤️</span>
                      <h3 className="text-lg font-semibold text-gray-900">즐겨찾기 정류장</h3>
                      <span className="text-sm text-gray-500">{bookmarkedStations.length}개</span>
                      {bookmarksLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                      )}
                    </div>
                    
                    {bookmarksLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                                  <div className="h-4 bg-gray-300 rounded w-12"></div>
                                </div>
                                <div className="h-3 bg-gray-300 rounded w-16"></div>
                              </div>
                              <div className="h-4 bg-gray-300 rounded w-8"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : bookmarkedStations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <span className="text-4xl mb-3 block">❤️</span>
                        <p>즐겨찾기한 정류장이 없습니다.</p>
                        <p className="text-sm mt-1">정류장 상세 페이지에서 즐겨찾기를 추가해보세요.</p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                        {bookmarkedStations.map((station) => (
                          <div 
                            key={station.stationId || station.targetId || station.id} 
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                            onClick={() => handleStationClick(station)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-base">
                                  {decodeKoreanText(station.stationName || station.name || '정류장명 없음')}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  정류장 {station.stationId || station.targetId || station.number || 'ID 없음'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleRemoveStationBookmark(station, e)}
                                className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                                title="즐겨찾기 해제"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                              </button>
                              <div className="text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 즐겨찾기 노선 */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🚌</span>
                      <h3 className="text-lg font-semibold text-gray-900">즐겨찾기 노선</h3>
                      <span className="text-sm text-gray-500">{bookmarkedRoutes.length}개</span>
                      {routesLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                      )}
                    </div>
                    
                    {routesLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                                </div>
                                <div className="h-3 bg-gray-300 rounded w-24"></div>
                              </div>
                              <div className="h-4 bg-gray-300 rounded w-8"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : bookmarkedRoutes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <span className="text-4xl mb-3 block">🚌</span>
                        <p>즐겨찾기한 노선이 없습니다.</p>
                        <p className="text-sm mt-1">노선 상세 페이지에서 즐겨찾기를 추가해보세요.</p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                        {bookmarkedRoutes.map((route) => (
                          <div 
                            key={`${route.routeId}-${route.stationId}`} 
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                            onClick={() => handleRouteClick(route)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`px-2 py-1 rounded text-xs font-medium text-white ${
                                route.routeTypeCd === '1' ? 'bg-red-500' : 'bg-blue-500'
                              }`}>
                                {route.routeNumber || route.routeId || '번호 없음'}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-base">
                                  {decodeKoreanText(route.routeName || route.routeNumber || '노선명 없음')}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {decodeKoreanText(route.stationName || '정류장')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-500">
                                {route.routeTypeCd === '1' ? '직행좌석' : '일반'}
                              </div>
                              <button
                                onClick={(e) => handleRemoveRouteBookmark(route, e)}
                                className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                                title="즐겨찾기 해제"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                              </button>
                              <div className="text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✍️</span>
                  <h3 className="text-lg font-semibold text-gray-900">내가 쓴 리뷰</h3>
                  <span className="text-sm text-gray-500">{myReviews.length}개</span>
                  {reviewsLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                  )}
                </div>
                
                {reviewsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                          </div>
                          <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myReviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <span className="text-4xl mb-3 block">✍️</span>
                    <p>작성한 리뷰가 없습니다.</p>
                    <p className="text-sm mt-1">정류장에서 리뷰를 작성해보세요.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {myReviews.map((review) => (
                      <div 
                        key={review.id} 
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => handleStationClick({ 
                          stationId: review.stationId, 
                          stationName: review.stationName 
                        })}
                      >
                        {editingReview?.id === review.id ? (
                          // 수정 모드
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">
                                {decodeKoreanText(review.stationName || '정류장명 없음')}
                              </h4>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditRating(star);
                                    }}
                                    className={`text-2xl ${star <= editRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              rows={3}
                              placeholder="리뷰 내용을 입력하세요"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt || review.updatedAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveReview();
                                  }}
                                  className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition-colors duration-200"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors duration-200"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // 일반 모드
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {decodeKoreanText(review.stationName || '정류장명 없음')}
                              </h4>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating || 0)}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2 line-clamp-2">
                              {decodeKoreanText(review.content || '리뷰 내용 없음')}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt || review.updatedAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-600">정류장 보기 →</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditReview(review);
                                    }}
                                    className="p-1 text-blue-400 hover:text-blue-600 transition-colors duration-200"
                                    title="리뷰 수정"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteReview(review.id, e)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                                    title="리뷰 삭제"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyPage;
