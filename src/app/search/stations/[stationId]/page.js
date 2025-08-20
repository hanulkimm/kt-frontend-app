'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { FiArrowLeft, FiMapPin, FiRefreshCw, FiClock, FiHeart, FiStar, FiMessageSquare, FiPlus } from 'react-icons/fi';
import BusArrivalItem from '../../../../components/bus/BusArrivalItem';
import { getBusArrivalInfo } from '../../../../services/busArrival';
import { addStationBookmark, removeStationBookmark, checkBookmarkStatus } from '../../../../services/bookmarks';
import { getReviewsByTarget, createReview } from '../../../../services/reviews';
import { searchStations } from '../../../../services/search';
import toast from 'react-hot-toast';

function StationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationId = params.stationId;
  const stationNameFromUrl = searchParams.get('name');
  
  const [busArrivals, setBusArrivals] = useState([]);
  const [stationInfo, setStationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(null);
  
  // 리뷰 관련 상태
  const [activeTab, setActiveTab] = useState('arrival'); // 'arrival' 또는 'reviews'
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    content: '',
    routeNumber: ''
  });

  useEffect(() => {
    if (stationId) {
      loadStationInfo();
      loadBusArrivalInfo();
      checkBookmark();
      // 리뷰 개수도 초기 로드 시 함께 가져오기
      loadReviews();
    }
  }, [stationId]);

  // 탭 변경 시 리뷰 로드
  useEffect(() => {
    if (activeTab === 'reviews' && stationId) {
      loadReviews();
    }
  }, [activeTab, stationId]);

  // 자동 업데이트 토글 효과
  useEffect(() => {
    if (autoUpdate && stationId) {
      const interval = setInterval(() => {
        loadBusArrivalInfo(true);
      }, 30000);
      setUpdateInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }
    }
  }, [autoUpdate, stationId]);

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

    // 정류장 정보 로드
  const loadStationInfo = async () => {
    try {
      // URL에서 전달된 정류장 이름이 있으면 우선 사용
      if (stationNameFromUrl) {
        const decodedStationName = decodeURIComponent(stationNameFromUrl);
        console.log('URL에서 정류장 이름 받음:', decodedStationName);
        setStationInfo({
          stationId: stationId,
          stationName: decodedStationName,
          stationNumber: stationId
        });
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        // 로그인하지 않은 경우 기본 정보만 설정
        setStationInfo({
          stationId: stationId,
          stationName: `정류장 ${stationId}`,
          stationNumber: stationId
        });
        return;
      }

      // 정류장 ID로 검색하여 정류장 이름 가져오기 (백업)
      const response = await searchStations(stationId, userId);
      console.log('정류장 검색 응답:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        // 정류장 ID와 정확히 일치하는 정류장 찾기
        const exactMatch = response.data.find(station => 
          station.id === stationId || station.stationId === stationId
        );
        
        const station = exactMatch || response.data[0]; // 정확한 매칭 또는 첫 번째 결과
        console.log('정류장 정보 조회 성공:', station);
        
        setStationInfo({
          stationId: stationId,
          stationName: station.name || station.stationName || station.stnNm || `정류장 ${stationId}`,
          stationNumber: stationId
        });
      } else {
        // 검색 결과가 없는 경우 기본 정보 설정
        setStationInfo({
          stationId: stationId,
          stationName: `정류장 ${stationId}`,
          stationNumber: stationId
        });
      }
    } catch (error) {
      console.error('정류장 정보 로드 실패:', error);
      // 에러 발생 시 기본 정보 설정
      setStationInfo({
        stationId: stationId,
        stationName: `정류장 ${stationId}`,
        stationNumber: stationId
      });
    }
  };

  const loadBusArrivalInfo = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await getBusArrivalInfo(stationId);
      
      if (response.success) {
        setBusArrivals(response.data || []);
        setLastUpdated(new Date());
        

        
        if (isRefresh && !autoUpdate) {
          toast.success('버스 도착 정보가 업데이트되었습니다.');
        }
      } else {
        toast.error(response.message);
        setBusArrivals([]);
      }
    } catch (error) {
      console.error('버스 도착 정보 로드 실패:', error);
      toast.error(error.message || '버스 도착 정보를 불러오는데 실패했습니다.');
      setBusArrivals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 리뷰 로드
  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await getReviewsByTarget(stationId, 'station');
      
      if (response.success) {
        const reviews = response.data || [];
        // station_name 필드가 없는 경우 현재 정류장 정보로 보완
        const processedReviews = reviews.map(review => ({
          ...review,
          stationName: review.stationName || review.station_name || stationInfo?.stationName || stationInfo?.name || `정류장 ${stationId}`
        }));
        setReviews(processedReviews);
      } else {
        console.error('리뷰 로드 실패:', response.message);
        setReviews([]);
      }
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // 리뷰 작성
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const reviewData = {
        userId: parseInt(userId),
        targetKind: 'station',
        targetId: stationId,
        stationName: stationInfo?.stationName || stationInfo?.name || `정류장 ${stationId}`,
        rating: reviewForm.rating,
        content: reviewForm.content,
        routeNumber: reviewForm.routeNumber || null
      };

      const response = await createReview(reviewData);
      
      if (response.success) {
        toast.success('리뷰가 등록되었습니다.');
        setReviewForm({ rating: 5, content: '', routeNumber: '' });
        setShowReviewForm(false);
        loadReviews(); // 리뷰 목록 새로고침
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('리뷰 작성 실패:', error);
      toast.error(error.message || '리뷰 작성에 실패했습니다.');
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await checkBookmarkStatus(stationId);
      if (response.success) {
        setIsBookmarked(response.data.isBookmarked);
      }
    } catch (error) {
      console.error('즐겨찾기 상태 확인 실패:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    try {
      if (isBookmarked) {
        const response = await removeStationBookmark(stationId);
        if (response.success) {
          setIsBookmarked(false);
          toast.success('즐겨찾기에서 제거되었습니다.');
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await addStationBookmark(stationId, stationInfo);
        if (response.success) {
          setIsBookmarked(true);
          toast.success('즐겨찾기에 추가되었습니다.');
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error('즐겨찾기 처리 실패:', error);
      toast.error(error.message || '즐겨찾기 처리에 실패했습니다.');
    }
  };

  const handleRouteClick = (busRoute) => {
    console.log('노선 선택:', busRoute);
    toast.success(`${busRoute.routeName}번 노선이 선택되었습니다.`);
    // 향후 노선 상세 페이지로 이동하는 로직 추가
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdated) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}초 전`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)}분 전`;
    } else {
      return lastUpdated.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (!stationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">잘못된 정류장 정보입니다.</p>
          <button
            onClick={() => router.push('/search')}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
          >
            검색으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {stationInfo?.stationName || '정류장 정보'}
                </h1>
                <p className="text-sm text-gray-600">
                  정류장 번호: {stationInfo?.stationNumber || stationId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isBookmarked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
                title={isBookmarked ? '즐겨찾기 제거' : '즐겨찾기 추가'}
              >
                <FiHeart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={() => loadBusArrivalInfo(true)}
                disabled={refreshing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  refreshing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">새로고침</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('arrival')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'arrival'
                    ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiClock className="w-4 h-4" />
                <span className="font-medium">실시간 도착정보</span>
                <span className="text-sm">({busArrivals.length})</span>
              </button>
              
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiMessageSquare className="w-4 h-4" />
                <span className="font-medium">리뷰 및 평가</span>
                <span className="text-sm">({reviews.length})</span>
              </button>
            </div>
            
            {/* 자동 업데이트 토글 (도착정보 탭에서만 표시) */}
            {activeTab === 'arrival' && (
              <button
                onClick={() => setAutoUpdate(!autoUpdate)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  autoUpdate 
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={autoUpdate ? '자동 업데이트 비활성화' : '30초마다 자동 업데이트 활성화'}
              >
                <div className={`w-2 h-2 rounded-full ${autoUpdate ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <span>30초마다 업데이트</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'arrival' ? (
          // 실시간 도착정보 탭
          <>
            {loading ? (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">버스 도착 정보를 불러오는 중...</p>
                </div>
                
                {/* 로딩 스켈레톤 */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : busArrivals.length === 0 ? (
              <div className="text-center py-16">
                <FiClock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">운행 중인 버스가 없습니다</h3>
                <p className="text-gray-600 mb-6">
                  현재 이 정류장에 도착 예정인 버스가 없습니다.<br/>
                  잠시 후 다시 확인해보세요.
                </p>
                <button
                  onClick={() => loadBusArrivalInfo(true)}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                >
                  다시 확인하기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {busArrivals.map((busRoute) => (
                  <BusArrivalItem
                    key={busRoute.routeId}
                    busRoute={busRoute}
                    stationId={stationId}
                    stationName={stationInfo?.stationName || stationInfo?.name || `정류장 ${stationId}`}
                    onRouteClick={handleRouteClick}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // 리뷰 및 평가 탭
          <div className="space-y-6">
            {/* 리뷰 작성 폼 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">리뷰 작성</h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="text-sm font-medium">리뷰 작성</span>
                </button>
              </div>
              
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* 평점 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">평점</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                        >
                          <FiStar className={`w-6 h-6 ${star <= reviewForm.rating ? 'text-yellow-400 fill-current' : ''}`} />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({reviewForm.rating}.0)</span>
                    </div>
                  </div>
                  
                  {/* 리뷰 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">리뷰 내용</label>
                                         <textarea
                       value={reviewForm.content}
                       onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                       rows={4}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                       placeholder="이 정류장이나 노선에 대한 경험을 공유해주세요..."
                       required
                     />
                  </div>
                  
                  {/* 노선 번호 (선택) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">노선 번호 (선택)</label>
                                         <input
                       type="text"
                       value={reviewForm.routeNumber}
                       onChange={(e) => setReviewForm(prev => ({ ...prev, routeNumber: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                       placeholder="예: 9700, 146, 421"
                     />
                  </div>
                  
                  {/* 버튼 */}
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 font-medium"
                    >
                      리뷰 등록
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* 사용자 리뷰 목록 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 리뷰 ({reviews.length}개)</h3>
              
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">아직 리뷰가 없습니다</h4>
                  <p className="text-gray-600">첫 번째 리뷰를 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-medium">
                            {review.userEmail ? review.userEmail.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {review.userEmail ? review.userEmail.split('@')[0] : '사용자'}
                            </div>
                            {review.routeNumber && (
                              <div className="text-sm text-emerald-600 font-medium">
                                {review.routeNumber}번
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-500">({review.rating}.0)</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.content}</p>
                      
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StationDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <StationDetailContent />
    </Suspense>
  );
}
