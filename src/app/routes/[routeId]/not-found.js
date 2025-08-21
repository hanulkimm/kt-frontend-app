'use client';

import Link from 'next/link';
import { FiHome, FiSearch, FiMapPin } from 'react-icons/fi';

export default function RouteNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 아이콘 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
            <FiMapPin className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          버스 노선을 찾을 수 없습니다
        </h1>

        {/* 설명 */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          요청하신 버스 노선 정보를 찾을 수 없습니다.<br />
          노선이 변경되었거나 운행이 중단되었을 수 있습니다.
        </p>

        {/* 버튼들 */}
        <div className="space-y-3">
          <Link 
            href="/search"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FiSearch className="w-5 h-5 mr-2" />
            다른 노선 검색하기
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
            정확한 노선번호나 정류장명으로<br />
            다시 검색해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
