import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    
    if (!stationId) {
      return NextResponse.json({
        success: false,
        message: '정류장 ID가 필요합니다.',
        data: null
      }, { status: 400 });
    }

    const serviceKey = process.env.NEXT_PUBLIC_DATA_API_KEY || 'TIJZI4VdnuRb3fq+lw9TBOJrvKOwvKeOeA5H2hm3nUGEn/m2b/a3WgNv7cv0g87bJ7eL0mZcjTlze2UGYD9GzQ==';
    const apiUrl = `https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalListv2`;
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      stationId: stationId,
      format: 'json'
    });

    console.log('버스 도착 정보 API 호출:', `${apiUrl}?${params.toString()}`);

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    });

    console.log('응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      console.error('버스 도착 정보 API HTTP 오류:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('오류 응답 내용:', errorText.substring(0, 500));
      
      return NextResponse.json({
        success: false,
        message: `버스 도착 정보 API 호출 실패: ${response.status}`,
        data: null,
        error: process.env.NODE_ENV === 'development' ? errorText.substring(0, 200) : undefined
      }, { status: response.status });
    }

    // 응답 내용을 먼저 텍스트로 확인
    const responseText = await response.text();
    console.log('응답 내용 (처음 500자):', responseText.substring(0, 500));

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('버스 도착 정보 API 응답 파싱 성공');
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError.message);
      
      return NextResponse.json({
        success: false,
        message: 'API 응답 형식이 올바르지 않습니다.',
        data: null,
        error: process.env.NODE_ENV === 'development' ? {
          responsePreview: responseText.substring(0, 200),
          contentType: response.headers.get('content-type')
        } : undefined
      }, { status: 500 });
    }
    
    // 공공데이터 API 응답 구조에 맞게 파싱
    if (data.response?.msgHeader?.resultCode === 0) {
      let busArrivals = data.response?.msgBody?.busArrivalList || [];
      
      console.log('busArrivals 타입 및 내용:', typeof busArrivals, busArrivals);
      
      // busArrivals가 배열이 아닌 경우 (단일 객체인 경우) 배열로 변환
      if (!Array.isArray(busArrivals)) {
        if (busArrivals && typeof busArrivals === 'object') {
          console.log('단일 객체를 배열로 변환합니다.');
          busArrivals = [busArrivals];
        } else {
          console.error('busArrivals가 유효하지 않습니다:', busArrivals);
          return NextResponse.json({
            success: true,
            data: [],
            message: '현재 운행 중인 버스가 없습니다.',
            totalCount: 0,
            queryTime: data.response?.msgHeader?.queryTime
          });
        }
      }
      
      // 내부 데이터 구조로 변환
      let transformedArrivals = [];
      try {
        transformedArrivals = busArrivals.map(arrival => {
          if (!arrival) {
            console.warn('빈 arrival 객체 발견, 건너뜁니다.');
            return null;
          }
          
          return {
            routeId: arrival.routeId || null,
            routeName: arrival.routeName || '알 수 없음',
            routeTypeCd: arrival.routeTypeCd || 11,
            routeDestName: arrival.routeDestName || '목적지 정보 없음',
            flag: arrival.flag || 'WAIT', // PASS, WAIT, STOP
            
            // 첫 번째 버스 정보
            bus1: {
              plateNo: arrival.plateNo1 || null,
              predictTime: arrival.predictTime1 || null,
              predictTimeSec: arrival.predictTimeSec1 || null,
              locationNo: arrival.locationNo1 || null,
              stationName: arrival.stationNm1 || null,
              remainSeatCnt: arrival.remainSeatCnt1 !== '' ? arrival.remainSeatCnt1 : null,
              crowded: arrival.crowded1 !== '' ? arrival.crowded1 : null,
              lowPlate: arrival.lowPlate1 !== '' ? arrival.lowPlate1 : null,
              stateCd: arrival.stateCd1 !== '' ? arrival.stateCd1 : null,
              vehId: arrival.vehId1 || null
            },
            
            // 두 번째 버스 정보
            bus2: {
              plateNo: arrival.plateNo2 || null,
              predictTime: arrival.predictTime2 || null,
              predictTimeSec: arrival.predictTimeSec2 || null,
              locationNo: arrival.locationNo2 || null,
              stationName: arrival.stationNm2 || null,
              remainSeatCnt: arrival.remainSeatCnt2 !== '' ? arrival.remainSeatCnt2 : null,
              crowded: arrival.crowded2 !== '' ? arrival.crowded2 : null,
              lowPlate: arrival.lowPlate2 !== '' ? arrival.lowPlate2 : null,
              stateCd: arrival.stateCd2 !== '' ? arrival.stateCd2 : null,
              vehId: arrival.vehId2 || null
            },
            
            staOrder: arrival.staOrder || null,
            stationId: arrival.stationId || stationId
          };
        }).filter(Boolean); // null 값 제거
      } catch (mapError) {
        console.error('데이터 변환 중 오류:', mapError);
        return NextResponse.json({
          success: false,
          message: '버스 도착 정보 처리 중 오류가 발생했습니다.',
          data: null,
          error: process.env.NODE_ENV === 'development' ? mapError.message : undefined
        }, { status: 500 });
      }

      // 운행 중인 버스가 있는 노선만 필터링하고 정렬
      const activeRoutes = transformedArrivals
        .filter(route => {
          // 최소한 하나의 버스 정보가 있거나 운행 상태인 노선만 포함
          return route.flag === 'PASS' || route.bus1.plateNo || route.bus1.predictTime || route.bus2.plateNo || route.bus2.predictTime;
        })
        .sort((a, b) => {
          // 도착 시간이 있는 버스를 우선으로 정렬
          const aTime = parseInt(a.bus1.predictTime) || 999;
          const bTime = parseInt(b.bus1.predictTime) || 999;
          return aTime - bTime;
        });

      return NextResponse.json({
        success: true,
        data: activeRoutes,
        message: `${activeRoutes.length}개 노선의 버스 도착 정보를 조회했습니다.`,
        totalCount: activeRoutes.length,
        queryTime: data.response?.msgHeader?.queryTime
      });
    } else {
      const errorMessage = data.response?.msgHeader?.resultMessage || '버스 도착 정보를 가져올 수 없습니다.';
      console.error('버스 도착 정보 API 결과 오류:', data.response?.msgHeader);
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        data: null
      }, { status: 400 });
    }
  } catch (error) {
    console.error('버스 도착 정보 API 서버 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
