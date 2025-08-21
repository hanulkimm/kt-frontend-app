'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiRefreshCw, FiAlertTriangle, FiSearch } from 'react-icons/fi';

export default function RouteError({ error, reset }) {
  useEffect(() => {
    console.error('Route detail error:', error);
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
          버스 정보를 불러올 수 없습니다
        </h1>

        {/* 설명 */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          버스 도착 정보를 가져오는 중 문제가 발생했습니다.<br />
          네트워크 연결을 확인하거나 잠시 후 다시 시도해보세요.
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
            href="/search"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiSearch className="w-5 h-5 mr-2" />
            다른 노선 찾기
          </Link>
          
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
            문제가 계속 발생하면<br />
            네트워크 연결 상태를 확인해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
