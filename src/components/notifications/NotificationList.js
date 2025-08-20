'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiClock, FiMapPin, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notifications';
import toast from 'react-hot-toast';

const NotificationList = ({ userId, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async (pageNum = 0, append = false) => {
    try {
      setLoading(true);
      const response = await getNotifications(userId, pageNum, 20);
      
      if (response.success) {
        const newNotifications = response.data?.content || [];
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setHasMore(!response.data?.last);
        setPage(pageNum);
      } else {
        console.error('알림 로드 실패:', response.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
      // 404 오류인 경우 알림 기능이 아직 구현되지 않았을 수 있음
      if (error.message && error.message.includes('404')) {
        console.log('알림 기능이 아직 백엔드에서 구현되지 않았을 수 있습니다.');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, true);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markNotificationAsRead(notificationId, userId);
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        // 읽지 않은 개수 업데이트
        if (onUnreadCountChange) {
          const currentUnreadCount = notifications.filter(n => !n.isRead).length;
          onUnreadCountChange(Math.max(0, currentUnreadCount - 1));
        }
      } else {
        toast.error(response.message || '알림 읽음 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      toast.error('알림 읽음 처리에 실패했습니다.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead(userId);
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        
        // 읽지 않은 개수를 0으로 업데이트
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
        
        toast.success('모든 알림을 읽음 처리했습니다.');
      } else {
        toast.error(response.message || '모든 알림 읽음 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      toast.error('모든 알림 읽음 처리에 실패했습니다.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return '방금 전';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <FiBell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">알림이 없습니다</h3>
        <p className="text-gray-600 mb-4">즐겨찾기한 노선의 버스 도착 알림이 여기에 표시됩니다.</p>
        <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
          <p className="mb-2">💡 <strong>알림을 받으려면:</strong></p>
          <ol className="text-left space-y-1">
            <li>1. 정류장에서 원하는 노선을 즐겨찾기에 추가</li>
            <li>2. 알림 설정에서 원하는 시간(3~15분 전) 선택</li>
            <li>3. 버스 도착 5분마다 자동으로 알림이 생성됩니다</li>
          </ol>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* 모두 읽음 버튼 */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <FiCheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">모두 읽음 ({unreadCount})</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
            notification.isRead
              ? 'bg-white border-gray-200'
              : 'bg-blue-50 border-blue-200 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-full ${
                  notification.isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'
                }`}>
                  <FiBell className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  {notification.routeNumber}번 ({notification.routeName}) 버스 도착 알림
                </h4>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <FiMapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{notification.stationName}</span>
                <span className="text-xs text-gray-400">정류장</span>
              </div>
              
              <p className="text-gray-800 mb-3">{notification.message}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  <span>{formatTime(notification.createdAt)}</span>
                </div>
                {notification.estimatedArrivalTime && (
                  <div className="flex items-center gap-1">
                    <span>도착 예정:</span>
                    <span className="font-medium text-emerald-600">
                      {new Date(notification.estimatedArrivalTime).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {!notification.isRead && (
              <button
                onClick={() => handleMarkAsRead(notification.id)}
                className="ml-4 p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="읽음 처리"
              >
                <FiCheck className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
      </div>
      
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {loading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
