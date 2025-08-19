import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { keyword, userId } = await request.json();
    
    if (!keyword) {
      return NextResponse.json({
        success: false,
        message: '검색어를 입력해주세요.',
        data: null
      }, { status: 400 });
    }

    // 하드코딩된 API 키 사용 (디코딩된 버전으로 시도)
    const serviceKey = 'TIJZI4VdnuRb3fq+lw9TBOJrvKOwvKeOeA5H2hm3nUGEn/m2b/a3WgNv7cv0g87bJ7eL0mZcjTlze2UGYD9GzQ==';
    
    console.log('API 키 확인:', {
      NODE_ENV: process.env.NODE_ENV,
      serviceKeyExists: !!serviceKey,
      serviceKeyLength: serviceKey?.length
    });
    
    if (!serviceKey) {
      console.error('API 키가 설정되지 않았습니다.');
      return NextResponse.json({
        success: false,
        message: 'API 키가 설정되지 않았습니다.',
        data: null
      }, { status: 500 });
    }

    const apiUrl = `https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationListv2`;
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      keyword: keyword,
      format: 'json'
    });

    console.log('공공데이터 API 호출:', `${apiUrl}?${params.toString()}`);

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    });

    console.log('응답 상태:', response.status, response.statusText);
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('공공데이터 API HTTP 오류:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('오류 응답 내용:', errorText.substring(0, 500));
      
      return NextResponse.json({
        success: false,
        message: `공공데이터 API 호출 실패: ${response.status}`,
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
      console.log('공공데이터 API 응답 파싱 성공:', data);
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
      const stations = data.response?.msgBody?.busStationList || [];
      
      // 내부 데이터 구조로 변환
      const transformedStations = stations.map(station => ({
        id: station.stationId.toString(),
        name: station.stationName,
        number: station.mobileNo?.trim() || station.stationId.toString(),
        distance: station.centerYn === 'Y' ? '중앙차로' : '일반차로',
        latitude: station.y,
        longitude: station.x,
        regionName: station.regionName,
        centerYn: station.centerYn
      }));

      return NextResponse.json({
        success: true,
        data: transformedStations,
        message: `${transformedStations.length}개의 정류장을 찾았습니다.`,
        totalCount: transformedStations.length
      });
    } else {
      const errorMessage = data.response?.msgHeader?.resultMessage || '검색 결과를 가져올 수 없습니다.';
      console.error('공공데이터 API 결과 오류:', data.response?.msgHeader);
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        data: null
      }, { status: 400 });
    }
  } catch (error) {
    console.error('정류장 검색 API 서버 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
