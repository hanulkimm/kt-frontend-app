'use client';

import { useState, useEffect } from 'react';
import { FiHeart, FiMapPin } from 'react-icons/fi';
import { addStationBookmark, removeStationBookmark, checkBookmarkStatus } from '../../services/bookmarks';
import toast from 'react-hot-toast';

const SearchResultItem = ({ station, showBookmarkButton = true }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (showBookmarkButton) {
      checkBookmark();
    }
  }, [station.id, showBookmarkButton]);

  const checkBookmark = async () => {
    try {
      const response = await checkBookmarkStatus(station.id);
      if (response.success) {
        setIsBookmarked(response.data.isBookmarked);
      }
    } catch (error) {
      console.error('즐겨찾기 상태 확인 실패:', error);
      // 에러가 발생해도 UI는 정상적으로 표시
    }
  };

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    if (bookmarkLoading) return;

    try {
      setBookmarkLoading(true);
      
      if (isBookmarked) {
        const response = await removeStationBookmark(station.id);
        if (response.success) {
          setIsBookmarked(false);
          toast.success('즐겨찾기에서 제거되었습니다.');
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await addStationBookmark(station.id, {
          name: station.name,
          number: station.number,
          latitude: station.latitude,
          longitude: station.longitude
        });
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
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleStationClick = () => {
    // 향후 정류장 상세 페이지로 이동하는 로직 추가
    console.log('정류장 선택:', station);
    toast.success(`${station.name} 정류장이 선택되었습니다.`);
  };

  return (
    <div
      onClick={handleStationClick}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-lg font-semibold text-gray-900">{station.name}</h4>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium">
            {station.number}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FiMapPin className="w-4 h-4" />
            <span>{station.distance}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>위도: {station.latitude}</span>
            <span>경도: {station.longitude}</span>
          </div>
        </div>
      </div>

      {showBookmarkButton && (
        <button
          onClick={handleBookmarkToggle}
          disabled={bookmarkLoading}
          className={`p-2 rounded-full transition-all duration-200 ${
            bookmarkLoading 
              ? 'cursor-not-allowed opacity-50' 
              : 'hover:bg-gray-100'
          }`}
          title={isBookmarked ? '즐겨찾기 제거' : '즐겨찾기 추가'}
        >
          <FiHeart 
            className={`w-6 h-6 transition-colors duration-200 ${
              isBookmarked 
                ? 'text-red-500 fill-current' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          />
        </button>
      )}
    </div>
  );
};

export default SearchResultItem;
