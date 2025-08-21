import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { routeId } = await request.json();
    
    if (!routeId) {
      return NextResponse.json({
        success: false,
        message: '노선 ID가 필요합니다.',
        data: null
      }, { status: 400 });
    }

    console.log('노선 경유 정류소 목록 API 호출:', { routeId });

    // 하드코딩된 API 키 사용 (기존 API와 동일)
    const serviceKey = 'TIJZI4VdnuRb3fq+lw9TBOJrvKOwvKeOeA5H2hm3nUGEn/m2b/a3WgNv7cv0g87bJ7eL0mZcjTlze2UGYD9GzQ==';
    
    console.log('노선 경유 정류소 API 키 확인:', {
      NODE_ENV: process.env.NODE_ENV,
      serviceKeyExists: !!serviceKey,
      serviceKeyLength: serviceKey?.length,
      routeId
    });
    
    if (!serviceKey) {
      console.error('API 키가 설정되지 않았습니다.');
      return NextResponse.json({
        success: false,
        message: 'API 키가 설정되지 않았습니다.',
        data: null
      }, { status: 500 });
    }

    // getBusRouteStationListv2 API 사용 (노선의 경유 정류소 목록)
    const apiUrl = `https://apis.data.go.kr/6410000/busrouteservice/v2/getBusRouteStationListv2`;
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      routeId: routeId,
      format: 'json'
    });

    console.log('공공데이터 노선 경유 정류소 API 호출:', `${apiUrl}?${params.toString()}`);

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    });

    console.log('노선 경유 정류소 API 응답 상태:', response.status, response.statusText);
    console.log('노선 경유 정류소 API 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('공공데이터 노선 경유 정류소 API HTTP 오류:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('오류 응답 내용:', errorText.substring(0, 500));
      
      return NextResponse.json({
        success: false,
        message: `공공데이터 노선 경유 정류소 API 호출 실패: ${response.status}`,
        data: null,
        error: process.env.NODE_ENV === 'development' ? errorText.substring(0, 200) : undefined
      }, { status: response.status });
    }

    // 응답 내용을 먼저 텍스트로 확인
    const responseText = await response.text();
    console.log('노선 경유 정류소 API 응답 내용 (처음 500자):', responseText.substring(0, 500));

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('공공데이터 노선 경유 정류소 API 응답 파싱 성공');
      
      // API 응답 구조 확인
      console.log('📊 노선 경유 정류소 API 응답 구조:', {
        hasResponse: !!data.response,
        hasMsgHeader: !!data.response?.msgHeader,
        hasMsgBody: !!data.response?.msgBody,
        resultCode: data.response?.msgHeader?.resultCode,
        resultMessage: data.response?.msgHeader?.resultMessage,
        stationListLength: data.response?.msgBody?.busRouteStationList?.length
      });
      
      // 각 정류소별로 상세 정보 로그 출력 (처음 5개만)
      if (data.response?.msgBody?.busRouteStationList) {
        data.response.msgBody.busRouteStationList.slice(0, 5).forEach((station, index) => {
          console.log(`🚏 원본 정류소 ${index + 1} (${station.stationName}):`, {
            stationId: station.stationId,
            stationName: station.stationName,
            stationSeq: station.stationSeq,
            x: station.x,
            y: station.y,
            centerYn: station.centerYn,
            regionName: station.regionName
          });
        });
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError.message);
      console.error('응답이 JSON이 아닙니다. HTML 또는 다른 형식일 수 있습니다.');
      
      return NextResponse.json({
        success: false,
        message: 'API 응답 형식이 올바르지 않습니다. API 키나 요청 URL을 확인해주세요.',
        data: null,
        error: process.env.NODE_ENV === 'development' ? {
          responsePreview: responseText.substring(0, 200),
          contentType: response.headers.get('content-type')
        } : undefined
      }, { status: 500 });
    }
    
    // 공공데이터 API 응답 구조에 맞게 파싱
    if (data.response?.msgHeader?.resultCode === 0) {
      const busRouteStationList = data.response?.msgBody?.busRouteStationList || [];
      
      if (busRouteStationList.length > 0) {
        // 프론트엔드에서 사용하기 쉽도록 데이터 구조 변환
        const transformedData = busRouteStationList.map(station => ({
          stationId: station.stationId.toString(),
          stationName: station.stationName,
          stationSeq: station.stationSeq,
          latitude: station.y,
          longitude: station.x,
          centerYn: station.centerYn,
          regionName: station.regionName,
          adminName: station.adminName,
          mobileNo: station.mobileNo?.trim(),
          turnYn: station.turnYn,
          turnSeq: station.turnSeq,
          districtCd: station.districtCd
        }));

        // 변환된 데이터도 로그로 출력 (처음 5개만)
        console.log('🔄 변환된 정류소 데이터 (처음 5개):');
        transformedData.slice(0, 5).forEach((station, index) => {
          console.log(`🚏 변환된 정류소 ${index + 1} (${station.stationName}):`, {
            stationId: station.stationId,
            stationName: station.stationName,
            stationSeq: station.stationSeq,
            latitude: station.latitude,
            longitude: station.longitude,
            centerYn: station.centerYn
          });
        });

        return NextResponse.json({
          success: true,
          data: transformedData,
          message: `${transformedData.length}개의 경유 정류소 정보를 성공적으로 조회했습니다.`,
          queryTime: data.response?.msgHeader?.queryTime
        });
      } else {
        // 경유 정류소가 없어도 성공으로 처리하고 빈 배열 반환
        console.log('노선에 경유 정류소가 없거나 조회되지 않음');
        return NextResponse.json({
          success: true,
          data: [],
          message: '이 노선의 경유 정류소 정보가 없습니다.',
          queryTime: data.response?.msgHeader?.queryTime
        });
      }
    } else {
      const resultCode = data.response?.msgHeader?.resultCode;
      const errorMessage = data.response?.msgHeader?.resultMessage || '노선 경유 정류소 목록을 가져올 수 없습니다.';
      
      console.error('공공데이터 노선 경유 정류소 API 결과 오류:', {
        resultCode,
        resultMessage: errorMessage,
        fullHeader: data.response?.msgHeader
      });
      
      // resultCode에 따른 처리
      if (resultCode === 99 || errorMessage.includes('해당하는 데이터가 없습니다') || errorMessage.includes('데이터가 없습니다')) {
        // 데이터 없음 - 성공으로 처리
        console.log('API에서 경유 정류소 데이터 없음을 반환함 - 정상 처리');
        return NextResponse.json({
          success: true,
          data: [],
          message: '이 노선의 경유 정류소 정보가 없습니다.',
          queryTime: data.response?.msgHeader?.queryTime
        });
      } else {
        // 실제 오류
        return NextResponse.json({
          success: false,
          message: errorMessage,
          data: null,
          resultCode: resultCode
        }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('노선 경유 정류소 API 서버 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
