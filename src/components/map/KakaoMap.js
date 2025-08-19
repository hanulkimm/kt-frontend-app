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
      if (window.kakao && window.kakao.maps) {
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      
      script.onload = () => {
        window.kakao.maps.load(() => {
          setIsMapLoaded(true);
        });
      };

      script.onerror = () => {
        console.error('카카오맵 API 로드에 실패했습니다.');
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
      level: stations.length > 1 ? 5 : 3, // 여러 정류장이 있으면 더 넓게
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
      
      // 마커 이미지 설정 (중앙차로는 빨간색, 일반차로는 파란색)
      const imageSrc = station.centerYn === 'Y' 
        ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
        : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png';
      
      const imageSize = new window.kakao.maps.Size(36, 37);
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
        title: station.name
      });

      marker.setMap(mapInstanceRef.current);
      newMarkers.push(marker);

      // 인포윈도우 생성
      const infowindowContent = `
        <div style="padding:8px; min-width:150px; font-size:12px;">
          <div style="font-weight:bold; margin-bottom:4px;">${station.name}</div>
          <div style="color:#666;">
            정류장번호: ${station.number}<br/>
            ${station.distance} | ${station.regionName}
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
      
      {/* 지도 범례 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>중앙차로</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>일반차로</span>
        </div>
      </div>

      {/* 정류장 개수 표시 */}
      {stations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm">
          총 {stations.length}개 정류장
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
