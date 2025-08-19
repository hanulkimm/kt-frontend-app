'use client';

import { useEffect, useRef, useState } from 'react';
import FallbackMiniMap from './FallbackMiniMap';

const StationMiniMap = ({ station, className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // 카카오맵 API 로드
  useEffect(() => {
    const loadKakaoMap = () => {
      // 이미 로드된 경우
      if (window.kakao && window.kakao.maps) {
        setIsMapLoaded(true);
        return;
      }

      // 이미 스크립트가 로드 중이면 대기
      if (window.kakaoMapLoading) {
        const checkLoaded = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            setIsMapLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
        
        // 10초 후 타임아웃
        setTimeout(() => {
          clearInterval(checkLoaded);
          if (!window.kakao || !window.kakao.maps) {
            console.error('카카오맵 로딩 타임아웃');
            setMapError(true);
          }
        }, 10000);
        return;
      }

      // 이미 스크립트 태그가 존재하는지 확인
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (existingScript) {
        // 기존 스크립트가 있으면 로드 완료를 기다림
        const waitForLoad = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            setIsMapLoaded(true);
            clearInterval(waitForLoad);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(waitForLoad);
          if (!window.kakao || !window.kakao.maps) {
            setMapError(true);
          }
        }, 10000);
        return;
      }

      window.kakaoMapLoading = true;
      
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=597443c784bdb5f5124b2b9dee040922&autoload=false`;
        
        script.onload = () => {
          console.log('카카오맵 스크립트 로드 완료');
          try {
            window.kakao.maps.load(() => {
              console.log('카카오맵 초기화 완료');
              setIsMapLoaded(true);
              window.kakaoMapLoading = false;
            });
          } catch (error) {
            console.error('카카오맵 초기화 실패:', error);
            setMapError(true);
            window.kakaoMapLoading = false;
          }
        };

        script.onerror = (error) => {
          console.error('카카오맵 스크립트 로드 실패:', error);
          setMapError(true);
          window.kakaoMapLoading = false;
        };

        document.head.appendChild(script);
        
        // 타임아웃 설정 (15초)
        setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            console.error('카카오맵 로드 타임아웃');
            setMapError(true);
            window.kakaoMapLoading = false;
          }
        }, 15000);
        
      } catch (error) {
        console.error('스크립트 추가 실패:', error);
        setMapError(true);
        window.kakaoMapLoading = false;
      }
    };

    // 약간의 지연 후 로드 시작 (DOM이 완전히 준비된 후)
    const timer = setTimeout(loadKakaoMap, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !station) return;

    try {
      const mapOption = {
        center: new window.kakao.maps.LatLng(station.latitude, station.longitude),
        level: 4, // 미니맵이므로 적당한 확대 레벨
        draggable: false, // 드래그 비활성화
        zoomable: false, // 줌 비활성화
        disableDoubleClick: true, // 더블클릭 줌 비활성화
        disableDoubleClickZoom: true
      };

      const map = new window.kakao.maps.Map(mapRef.current, mapOption);
      mapInstanceRef.current = map;

      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(station.latitude, station.longitude);
      
      // 마커 이미지 설정 (중앙차로는 빨간색, 일반차로는 파란색)
      const imageSrc = station.centerYn === 'Y' 
        ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
        : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
      
      const imageSize = new window.kakao.maps.Size(24, 35);
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        image: markerImage
      });

      marker.setMap(map);
      markerRef.current = marker;

      // 지도 컨트롤 제거
      map.setZoomable(false);
      map.setDraggable(false);

    } catch (error) {
      console.error('미니맵 생성 오류:', error);
      setMapError(true);
    }
  }, [isMapLoaded, station]);

  if (mapError) {
    // 카카오맵 로드 실패 시 대체 지도 사용
    return <FallbackMiniMap station={station} className={className} />;
  }

  if (!isMapLoaded) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-emerald-200 border-t-emerald-500 rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-emerald-600 font-medium">{station.name}</p>
          <p className="text-xs text-emerald-500">지도 로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden"></div>
      
      {/* 정류장 정보 오버레이 */}
      <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        <div className="truncate">{station.name}</div>
      </div>
      
      {/* 차로 구분 표시 */}
      <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-xs font-medium ${
        station.centerYn === 'Y' 
          ? 'bg-red-500 text-white' 
          : 'bg-blue-500 text-white'
      }`}>
        {station.centerYn === 'Y' ? '중앙' : '일반'}
      </div>
    </div>
  );
};

export default StationMiniMap;
