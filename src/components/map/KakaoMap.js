'use client';

import { useEffect, useRef, useState } from 'react';

const KakaoMap = ({ stations = [], center, onStationClick, className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 카카오맵 API 로드
  useEffect(() => {
    const loadKakaoMap = () => {
      console.log('🔍 카카오맵 API 키 확인:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
      
      if (window.kakao && window.kakao.maps) {
        console.log('✅ 카카오맵 이미 로드됨');
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      // 공공데이터포탈 API와 동일한 방식으로 fallback 값 제공
      const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 'd28aaa647ae5db8071669c2bd956f714';
      
      console.log('🔑 KakaoMap - 사용할 API 키:', apiKey);
      
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      console.log('📡 KakaoMap - 카카오맵 스크립트 URL:', script.src);
      
      script.onload = () => {
        console.log('✅ KakaoMap - 카카오맵 스크립트 로드 완료');
        
        // kakao.maps.load() 호출로 지도 초기화
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            console.log('✅ KakaoMap - 카카오맵 초기화 완료');
            setIsMapLoaded(true);
          });
        } else {
          console.error('❌ KakaoMap - window.kakao.maps가 정의되지 않음');
        }
      };

      script.onerror = (error) => {
        console.error('❌ KakaoMap - 카카오맵 API 로드 실패');
        console.error('❌ 에러 상세 정보:', {
          message: error?.message || '알 수 없는 에러',
          type: error?.type || 'script_error',
          target: error?.target || 'script_element'
        });
      };

      document.head.appendChild(script);
    };

    loadKakaoMap();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const defaultCenter = center || (stations.length > 0 
      ? { lat: stations[0].latitude, lng: stations[0].longitude }
      : { lat: 37.5001, lng: 127.02625 }); // 기본값: 강남역

    const mapOption = {
      center: new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng),
      level: stations.length > 1 ? 6 : 4, // 여러 정류장이 있으면 더 넓게, 단일 정류장도 약간 넓게
    };

    const map = new window.kakao.maps.Map(mapRef.current, mapOption);
    mapInstanceRef.current = map;

    // 지도 타입 컨트롤 추가
    const mapTypeControl = new window.kakao.maps.MapTypeControl();
    map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

    // 줌 컨트롤 추가
    const zoomControl = new window.kakao.maps.ZoomControl();
    map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

  }, [isMapLoaded, center]);

  // 마커 업데이트
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !stations.length) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.kakao.maps.LatLngBounds();
    const newMarkers = [];

    stations.forEach((station, index) => {
      const position = new window.kakao.maps.LatLng(station.latitude, station.longitude);
      
      // 마커 이미지 설정 (중앙차로는 빨간색, 일반차로는 파란색) - 더 크고 선명하게
      const imageSrc = station.centerYn === 'Y' 
        ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
        : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
      
      const imageSize = new window.kakao.maps.Size(42, 48); // 적당한 크기로 조정
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: station.name
      });

      marker.setMap(mapInstanceRef.current);
      newMarkers.push(marker);

      // 인포윈도우 생성 - 더 보기 좋게 개선
      const infowindowContent = `
        <div style="padding:12px; min-width:180px; font-size:13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="font-weight:600; margin-bottom:6px; color:#1f2937; font-size:14px;">${station.name}</div>
          <div style="color:#6b7280; line-height:1.4;">
            <div style="margin-bottom:2px;">🚏 정류장번호: <span style="color:#3b82f6; font-weight:500;">${station.number}</span></div>
            <div style="margin-bottom:2px;">📍 ${station.distance}</div>
            <div>🏘️ ${station.regionName}</div>
          </div>
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: infowindowContent
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우들 닫기
        newMarkers.forEach((_, i) => {
          if (i !== index) {
            // 각 마커의 인포윈도우를 닫는 로직은 복잡하므로, 간단히 새로 생성
          }
        });
        
        infowindow.open(mapInstanceRef.current, marker);
        
        if (onStationClick) {
          onStationClick(station);
        }
      });

      // 마커 호버 이벤트
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        infowindow.open(mapInstanceRef.current, marker);
      });

      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        infowindow.close();
      });

      bounds.extend(position);
    });

    markersRef.current = newMarkers;

    // 모든 마커가 보이도록 지도 범위 조정
    if (stations.length > 1) {
      mapInstanceRef.current.setBounds(bounds);
    } else if (stations.length === 1) {
      mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(stations[0].latitude, stations[0].longitude));
      mapInstanceRef.current.setLevel(3);
    }

  }, [isMapLoaded, stations, onStationClick]);

  if (!isMapLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg"></div>
      
      {/* 지도 범례 - 더 눈에 잘 보이게 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-sm">
        <div className="font-medium text-gray-700 mb-2">마커 구분</div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
          <span className="text-gray-600">중앙차로</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
          <span className="text-gray-600">일반차로</span>
        </div>
      </div>

      {/* 정류장 개수 표시 - 더 보기 좋게 */}
      {stations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">📍</span>
            <span className="text-gray-700 font-medium">총 {stations.length}개 정류장</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
