'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

export default function Error({ error, reset }) {
  useEffect(() => {
    // 에러 로깅 (선택사항)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 아이콘 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
            <FiAlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          문제가 발생했습니다
        </h1>

        {/* 설명 */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          일시적인 오류가 발생했습니다.<br />
          잠시 후 다시 시도해보시거나 페이지를 새로고침해보세요.
        </p>

        {/* 에러 정보 (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm text-red-800 font-mono">
              {error.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
          </div>
        )}

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            다시 시도하기
          </button>
          
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <FiHome className="w-5 h-5 mr-2" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* 추가 도움말 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            문제가 계속 발생하면 잠시 후 다시 접속해보시거나<br />
            브라우저를 새로고침해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
