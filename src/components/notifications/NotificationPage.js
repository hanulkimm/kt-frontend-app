'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { FiArrowLeft, FiSettings } from 'react-icons/fi';
import NotificationSettings from './NotificationSettings';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');

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
  }, [router]);

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
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToSearch}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <FiSettings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">알림 설정</h1>
                <p className="text-sm text-gray-600">버스 도착 알림 설정을 관리하세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {userId && <NotificationSettings userId={userId} />}
      </main>
    </div>
  );
};

export default NotificationPage;
