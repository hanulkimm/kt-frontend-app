import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { stationId } = await request.json();
    
    if (!stationId) {
      return NextResponse.json({
        success: false,
        message: '정류장 ID가 필요합니다.',
        data: null
      }, { status: 400 });
    }

    // 하드코딩된 API 키 사용 (기존 API와 동일)
    const serviceKey = 'TIJZI4VdnuRb3fq+lw9TBOJrvKOwvKeOeA5H2hm3nUGEn/m2b/a3WgNv7cv0g87bJ7eL0mZcjTlze2UGYD9GzQ==';
    
    console.log('정류장 버스 목록 API 키 확인:', {
      NODE_ENV: process.env.NODE_ENV,
      serviceKeyExists: !!serviceKey,
      serviceKeyLength: serviceKey?.length,
      stationId
    });
    
    if (!serviceKey) {
      console.error('API 키가 설정되지 않았습니다.');
      return NextResponse.json({
        success: false,
        message: 'API 키가 설정되지 않았습니다.',
        data: null
      }, { status: 500 });
    }

    // getBusArrivalListv2 API 사용 (정류장의 모든 노선)
    const apiUrl = `https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalListv2`;
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      stationId: stationId,
      format: 'json'
    });

    console.log('공공데이터 정류장 버스 목록 API 호출:', `${apiUrl}?${params.toString()}`);

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    });

    console.log('정류장 버스 목록 API 응답 상태:', response.status, response.statusText);
    console.log('정류장 버스 목록 API 응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('공공데이터 정류장 버스 목록 API HTTP 오류:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('오류 응답 내용:', errorText.substring(0, 500));
      
      return NextResponse.json({
        success: false,
        message: `공공데이터 정류장 버스 목록 API 호출 실패: ${response.status}`,
        data: null,
        error: process.env.NODE_ENV === 'development' ? errorText.substring(0, 200) : undefined
      }, { status: response.status });
    }

    // 응답 내용을 먼저 텍스트로 확인
    const responseText = await response.text();
    console.log('정류장 버스 목록 API 응답 내용 (처음 500자):', responseText.substring(0, 500));

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('공공데이터 정류장 버스 목록 API 응답 파싱 성공:', JSON.stringify(data, null, 2));
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
      const busArrivalList = data.response?.msgBody?.busArrivalList || [];
      
      if (busArrivalList.length > 0) {
        // BusArrivalItem 컴포넌트와 호환되도록 데이터 구조 변환
        const transformedData = busArrivalList.map(bus => ({
          routeId: bus.routeId,
          routeName: bus.routeName,
          routeDestName: bus.routeDestName,
          routeTypeCd: bus.routeTypeCd,
          flag: bus.flag,
          // 첫 번째 버스 정보 (현재 버스)
          bus1: {
            plateNo: bus.plateNo1,
            predictTime: bus.predictTime1,
            crowded: bus.crowded1,
            lowPlate: bus.lowPlate1,
            remainSeatCnt: bus.remainSeatCnt1,
            stationName: bus.locationNo1 ? `${bus.locationNo1}번째 전` : '',
            locationNo: bus.locationNo1
          },
          // 두 번째 버스 정보 (다음 버스)
          bus2: {
            plateNo: bus.plateNo2,
            predictTime: bus.predictTime2,
            crowded: bus.crowded2,
            lowPlate: bus.lowPlate2,
            remainSeatCnt: bus.remainSeatCnt2,
            stationName: bus.locationNo2 ? `${bus.locationNo2}번째 전` : '',
            locationNo: bus.locationNo2
          }
        }));

        return NextResponse.json({
          success: true,
          data: transformedData,
          message: `${transformedData.length}개의 버스 노선 정보를 성공적으로 조회했습니다.`,
          queryTime: data.response?.msgHeader?.queryTime
        });
      } else {
        return NextResponse.json({
          success: false,
          message: '이 정류장에 운행 중인 버스가 없습니다.',
          data: []
        }, { status: 404 });
      }
    } else {
      const errorMessage = data.response?.msgHeader?.resultMessage || '정류장 버스 목록을 가져올 수 없습니다.';
      console.error('공공데이터 정류장 버스 목록 API 결과 오류:', data.response?.msgHeader);
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        data: null,
        resultCode: data.response?.msgHeader?.resultCode
      }, { status: 400 });
    }
  } catch (error) {
    console.error('정류장 버스 목록 API 서버 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
