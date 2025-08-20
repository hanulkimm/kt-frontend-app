'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 로그인 API 호출:', formData);
      
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();
      console.log('📊 로그인 응답:', result);

      if (response.ok && result.success && result.data?.userId) {
        // 로그인 성공
        const userId = String(result.data.userId);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', result.data.email);
        
        console.log('✅ 로그인 성공:', {
          userId: userId,
          email: result.data.email
        });
        
        toast.success('로그인되었습니다!');
        
        // /search 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/search');
        }, 1000);
        
      } else {
        // 로그인 실패
        console.error('❌ 로그인 실패:', result);
        toast.error(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('🔥 로그인 요청 오류:', error);
      toast.error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    setFormData({
      email: 'test1@example.com',
      password: 'password'
    });
    toast.info('테스트 계정 정보가 입력되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Toaster position="top-center" />
      
      <div className="max-w-md w-full mx-4">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🚌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BusMate</h1>
          <p className="text-gray-600">계정에 로그인하거나 새 계정을 만드세요</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex">
            <div className="flex-1 bg-emerald-50 border-b-2 border-emerald-500">
              <div className="px-6 py-4 text-center">
                <span className="font-medium text-emerald-700">로그인</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-50">
              <div className="px-6 py-4 text-center">
                <span className="font-medium text-gray-500">회원가입</span>
              </div>
            </div>
          </div>

          {/* 로그인 폼 */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 로그인 안내 */}
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">로그인</p>
                <p>기존 계정으로 BusMate에 로그인하세요</p>
              </div>

              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="이메일을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                  required
                />
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                  required
                />
              </div>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </div>
                ) : (
                  '로그인'
                )}
              </button>

              {/* 테스트 계정 버튼 */}
              <button
                type="button"
                onClick={handleTestLogin}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                테스트 계정 사용
              </button>
            </form>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          계정을 생성하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </div>
      </div>
    </div>
  );
}
