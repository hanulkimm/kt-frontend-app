'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { FiArrowLeft, FiBell, FiSettings } from 'react-icons/fi';
import NotificationList from './NotificationList';
import NotificationSettings from './NotificationSettings';
import { getUnreadNotificationCount } from '../../services/notifications';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 로그인 상태 확인
    const storedUserId = localStorage.getItem('userId');
    const storedUserEmail = localStorage.getItem('userEmail');
    
    if (!storedUserId) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setUserId(parseInt(storedUserId));
    setUserEmail(storedUserEmail || '');
    
    // 읽지 않은 알림 개수 로드
    loadUnreadCount(parseInt(storedUserId));
  }, [router]);

  const loadUnreadCount = async (uid) => {
    try {
      const response = await getUnreadNotificationCount(uid);
      if (response.success) {
        setUnreadCount(response.data || 0);
      }
    } catch (error) {
      console.error('읽지 않은 알림 개수 로드 실패:', error);
      // 404 오류인 경우 알림 기능이 아직 구현되지 않았을 수 있음
      if (error.message && error.message.includes('404')) {
        console.log('알림 기능이 아직 백엔드에서 구현되지 않았을 수 있습니다.');
      }
      setUnreadCount(0);
    }
  };

  const handleBackToSearch = () => {
    router.push('/search');
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
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
                onClick={handleBackToSearch}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">알림</h1>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'notifications'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiBell className="w-4 h-4" />
              <span className="font-medium">알림 목록</span>
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiSettings className="w-4 h-4" />
              <span className="font-medium">알림 설정</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'notifications' ? (
          <NotificationList 
            userId={userId}
            onUnreadCountChange={setUnreadCount}
          />
        ) : (
          <NotificationSettings userId={userId} />
        )}
      </main>
    </div>
  );
};

export default NotificationPage;
