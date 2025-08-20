'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiX } from 'react-icons/fi';
import { getSearchHistory, deleteSearchHistory } from '../../services/search';
import toast from 'react-hot-toast';

const SearchHistory = ({ onHistoryClick }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 시간 포맷팅 함수
  const formatTime = (searchedAt) => {
    try {
      const date = new Date(searchedAt);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`;
      return `${Math.floor(diffMins / 1440)}일 전`;
    } catch (error) {
      return '시간 정보 없음';
    }
  };
  
  // 임시 테스트 데이터 (백엔드 API가 작동하지 않을 때 사용)
  const testData = [
    { id: 1, keyword: '강남역', searchedAt: new Date().toISOString() },
    { id: 2, keyword: '홍대입구', searchedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: 3, keyword: '신촌역', searchedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() }
  ];

  useEffect(() => {
    console.log('🔄 SearchHistory 컴포넌트 마운트됨');
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('❌ userId가 없어 검색 기록을 불러올 수 없습니다.');
        setHistory([]);
        setLoading(false);
        return;
      }

      console.log('🔍 검색 기록 로드 시작 - userId:', userId);
      
      const response = await getSearchHistory(userId, 5);
      console.log('📄 getSearchHistory 응답:', response);
      
      if (response.success) {
        const historyData = response.data || [];
        console.log('✅ 검색 기록 로드 성공:', historyData);
        setHistory(historyData);
        
        if (historyData.length > 0) {
          console.log('📊 검색 기록 개수:', historyData.length);
          console.log('📊 첫 번째 기록:', historyData[0]);
        } else {
          console.log('📊 검색 기록이 없습니다.');
        }
      } else {
        console.error('❌ 검색 기록 로드 실패:', response.message);
        // 백엔드 API 실패 시 테스트 데이터 사용
        console.log('🔄 테스트 데이터 사용');
        setHistory(testData);
        toast.error(response.message);
      }
    } catch (error) {
      console.error('🔥 검색 기록 로드 오류:', error);
      // 에러 발생 시에도 테스트 데이터 사용
      console.log('🔄 에러로 인해 테스트 데이터 사용');
      setHistory(testData);
      toast.error(error.message || '검색 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (historyId, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('userId가 없어 검색 기록을 삭제할 수 없습니다.');
        toast.error('로그인이 필요합니다.');
        return;
      }

      const response = await deleteSearchHistory(historyId, userId);
      if (response.success) {
        setHistory(prev => prev.filter(item => item.id !== historyId));
        toast.success('검색 기록이 삭제되었습니다.');
      } else {
        console.error('검색 기록 삭제 실패:', response.message);
        toast.error(response.message);
      }
    } catch (error) {
      console.error('검색 기록 삭제 오류:', error);
      toast.error(error.message || '검색 기록 삭제에 실패했습니다.');
    }
  };

  const handleHistoryClick = (query) => {
    if (onHistoryClick) {
      onHistoryClick(query);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
                     <div className="flex items-center gap-2 mb-4">
               <FiClock className="w-5 h-5 text-emerald-500" />
               <h3 className="text-lg font-semibold text-gray-900">최근 검색어</h3>
               <span className="text-sm text-gray-500">4개</span>
             </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 rounded text-center"></div>
                  <div className="w-20 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <FiClock className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900">최근 검색어</h3>
        <span className="text-sm text-gray-500">{history.length}개</span>
      </div>
      
      
      
             {!history || history.length === 0 ? (
         <div className="text-center py-8 text-gray-500">
           <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
           <p>최근 검색 기록이 없습니다.</p>
           <p className="text-xs mt-1">검색을 해보세요!</p>
         </div>
       ) : (
                 <div className="space-y-2">
           {Array.isArray(history) && history.map((item, index) => {
             console.log('🔍 렌더링 중인 아이템:', item, 'index:', index);
             return (
               <div
                 key={item?.id || index}
                 onClick={() => handleHistoryClick(item?.keyword || '')}
                 className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
               >
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-emerald-500 text-white rounded text-center text-sm font-medium flex items-center justify-center">
                     {index + 1}
                   </div>
                                    <span className="text-gray-900 font-medium">{item?.keyword || '검색어 없음'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-500">{item?.searchedAt ? formatTime(item.searchedAt) : '시간 없음'}</span>
                   <button
                     onClick={(e) => handleDeleteHistory(item?.id || 0, e)}
                     className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                     title="삭제"
                   >
                     <FiX className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             );
           })}
         </div>
      )}
    </div>
  );
};

export default SearchHistory;
