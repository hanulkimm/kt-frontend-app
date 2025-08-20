'use client';

import { useRouter } from 'next/navigation';
import { FiMapPin, FiHeart, FiBell, FiStar, FiArrowRight, FiPlay } from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const features = [
    {
      icon: <FaBus className="w-8 h-8" />,
      title: "실시간 버스 도착 정보",
      description: "정확한 실시간 버스 도착 시간과 위치를 확인하세요"
    },
    {
      icon: <FiMapPin className="w-8 h-8" />,
      title: "정류장 검색",
      description: "원하는 정류장을 쉽고 빠르게 검색하고 정보를 확인하세요"
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "즐겨찾기 관리",
      description: "자주 이용하는 정류장과 노선을 즐겨찾기로 저장하세요"
    },
    {
      icon: <FiBell className="w-8 h-8" />,
      title: "도착 알림",
      description: "즐겨찾기한 버스의 도착 알림을 받아보세요"
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: "리뷰 시스템",
      description: "정류장과 노선에 대한 리뷰를 작성하고 공유하세요"
    },
    {
      icon: <FiMapPin className="w-8 h-8" />,
      title: "지도 연동",
      description: "카카오맵과 연동된 직관적인 위치 정보를 제공합니다"
    }
  ];

  const stats = [
    { number: "10,000+", label: "등록된 정류장" },
    { number: "500+", label: "운행 노선" },
    { number: "1,000+", label: "사용자 리뷰" },
    { number: "99.9%", label: "서비스 가동률" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <FaBus className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">KT 버스 정보</h1>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 flex items-center gap-2"
            >
              <span>시작하기</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                <FaBus className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              스마트한 버스 정보
              <span className="block text-emerald-600">언제 어디서나</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              실시간 버스 도착 정보부터 개인화된 알림 서비스까지,
              <br className="hidden sm:block" />
              당신의 대중교통 이용을 더욱 편리하게 만들어드립니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white text-lg font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiPlay className="w-5 h-5" />
                <span>지금 시작하기</span>
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-md"
              >
                <span>더 알아보기</span>
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 transform -translate-y-1/2 opacity-20">
          <div className="w-20 h-20 bg-emerald-200 rounded-full"></div>
        </div>
        <div className="absolute top-1/4 right-10 transform -translate-y-1/2 opacity-20">
          <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              왜 KT 버스 정보를 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              편리하고 정확한 버스 정보 서비스로 당신의 일상을 더욱 스마트하게 만들어보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-emerald-200 group"
              >
                <div className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              간단한 3단계로 시작하세요
            </h2>
            <p className="text-xl text-gray-600">
              복잡한 설정 없이 바로 사용할 수 있습니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                회원가입 & 로그인
              </h3>
              <p className="text-gray-600">
                간단한 정보 입력으로 계정을 생성하고 로그인하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                정류장 검색 & 즐겨찾기
              </h3>
              <p className="text-gray-600">
                자주 이용하는 정류장과 노선을 검색하고 즐겨찾기에 추가하세요
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                실시간 정보 & 알림
              </h3>
              <p className="text-gray-600">
                실시간 도착 정보를 확인하고 맞춤 알림을 받아보세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            더 스마트한 대중교통 이용을 시작하세요
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            지금 가입하고 편리한 버스 정보 서비스를 경험해보세요
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FiPlay className="w-5 h-5" />
            <span>무료로 시작하기</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <FaBus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">KT 버스 정보</h3>
            </div>
            <p className="text-gray-400 mb-4">
              스마트한 버스 정보 서비스로 더 편리한 대중교통 이용을 경험하세요
            </p>
            <p className="text-sm text-gray-500">
              © 2024 KT 버스 정보. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
