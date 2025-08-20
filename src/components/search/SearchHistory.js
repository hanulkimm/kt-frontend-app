'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiX } from 'react-icons/fi';
import { getSearchHistory, deleteSearchHistory } from '../../services/search';
import toast from 'react-hot-toast';

const SearchHistory = ({ onHistoryClick }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('userId가 없어 검색 기록을 불러올 수 없습니다.');
        setHistory([]);
        return;
      }

      const response = await getSearchHistory(userId, 5);
      if (response.success) {
        setHistory(response.data || []);
        console.log('검색 기록 데이터:', response.data);
      } else {
        console.error('검색 기록 로드 실패:', response.message);
        setHistory([]);
        toast.error(response.message);
      }
    } catch (error) {
      console.error('검색 기록 로드 오류:', error);
      setHistory([]);
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
      
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>최근 검색 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleHistoryClick(item.query)}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded text-center text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </div>
                <span className="text-gray-900 font-medium">{item.query}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{item.timestamp}</span>
                <button
                  onClick={(e) => handleDeleteHistory(item.id, e)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title="삭제"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
