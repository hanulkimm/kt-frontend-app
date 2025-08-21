'use client';

import { FiLoader, FiMapPin } from 'react-icons/fi';

export default function RouteLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 로딩 스피너 */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 relative">
            <FiMapPin className="w-8 h-8 text-blue-600" />
            <FiLoader className="w-12 h-12 text-blue-400 animate-spin absolute" />
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          버스 정보를 불러오는 중입니다
        </h2>
        
        <p className="text-gray-600">
          실시간 도착 정보를 가져오고 있습니다...
        </p>
      </div>
    </div>
  );
}
