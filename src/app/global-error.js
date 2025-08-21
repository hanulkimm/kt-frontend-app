'use client';

import { useEffect } from 'react';
import { FiHome, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // 전역 에러 로깅
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
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
              시스템 오류가 발생했습니다
            </h1>

            {/* 설명 */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              예상치 못한 오류가 발생했습니다.<br />
              페이지를 새로고침하거나 잠시 후 다시 접속해보세요.
            </p>

            {/* 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <FiRefreshCw className="w-5 h-5 mr-2" />
                다시 시도하기
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                <FiHome className="w-5 h-5 mr-2" />
                홈으로 돌아가기
              </button>
            </div>

            {/* 추가 도움말 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                문제가 지속적으로 발생하면<br />
                브라우저 캐시를 삭제하거나 다른 브라우저를 사용해보세요.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
