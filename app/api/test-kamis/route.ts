/**
 * @file app/api/test-kamis/route.ts
 * @description KAMIS API 테스트용 임시 Route
 * 
 * KAMIS API 응답 구조를 확인하기 위한 테스트 엔드포인트입니다.
 * 테스트 완료 후 삭제 예정입니다.
 */

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 테스트 파라미터 (기본값 설정)
  const certId = process.env.KAMIS_CERT_ID || "6836";
  const certKey = process.env.KAMIS_CERT_KEY || "0efbb7e6-0d61-4f8e-b617-a7bd50853d70";
  
  // 쿼리 파라미터로 오버라이드 가능
  const pCertId = searchParams.get("p_cert_id") || certId;
  const pCertKey = searchParams.get("p_cert_key") || certKey;
  
  // 날짜 설정 (최근 1주일)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  
  const pStartDay = searchParams.get("p_startday") || 
    weekAgo.toISOString().split('T')[0]; // YYYY-MM-DD
  const pEndDay = searchParams.get("p_endday") || 
    today.toISOString().split('T')[0];
  
  // 테스트용 파라미터 (사과 예시)
  const pItemCategoryCode = searchParams.get("p_itemcategorycode") || "200"; // 과일류
  const pItemCode = searchParams.get("p_itemcode") || "212"; // 사과
  const pKindCode = searchParams.get("p_kindcode") || "00"; // 전체
  const pProductRankCode = searchParams.get("p_productrankcode") || "04"; // 전체 등급
  const pCountryCode = searchParams.get("p_countrycode") || "1101"; // 서울
  const pReturnType = searchParams.get("p_returntype") || "json"; // JSON 응답
  
  // KAMIS API URL 구성
  const baseUrl = "http://www.kamis.or.kr/service/price/xml.do";
  const params = new URLSearchParams({
    action: "periodWholesaleProductList",
    p_cert_key: pCertKey,
    p_cert_id: pCertId,
    p_startday: pStartDay,
    p_endday: pEndDay,
    p_itemcategorycode: pItemCategoryCode,
    p_itemcode: pItemCode,
    p_kindcode: pKindCode,
    p_productrankcode: pProductRankCode,
    p_countrycode: pCountryCode,
    p_convert_kg_yn: "Y",
    p_returntype: pReturnType,
  });
  
  const apiUrl = `${baseUrl}?${params.toString()}`;
  
  console.group("🧪 [test-kamis] KAMIS API 테스트");
  console.log("요청 URL:", apiUrl.replace(pCertKey, "***"));
  console.log("파라미터:", {
    p_startday: pStartDay,
    p_endday: pEndDay,
    p_itemcategorycode: pItemCategoryCode,
    p_itemcode: pItemCode,
    p_countrycode: pCountryCode,
  });
  
  try {
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: pReturnType === "json" ? "application/json" : "application/xml",
      },
    });
    
    const duration = Date.now() - startTime;
    console.log("응답 상태:", response.status, response.statusText);
    console.log("소요 시간:", `${duration}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API 오류 응답:", errorText);
      console.groupEnd();
      
      return NextResponse.json({
        success: false,
        error: `API 호출 실패: ${response.status} ${response.statusText}`,
        errorBody: errorText,
        requestUrl: apiUrl.replace(pCertKey, "***"),
      }, { status: response.status });
    }
    
    // 응답 데이터 파싱
    let data: any;
    const contentType = response.headers.get("content-type") || "";
    
    if (pReturnType === "json" || contentType.includes("json")) {
      data = await response.json();
    } else {
      const xmlText = await response.text();
      data = {
        raw: xmlText,
        note: "XML 응답입니다. JSON으로 변환이 필요할 수 있습니다.",
      };
    }
    
    console.log("✅ 응답 데이터 구조:", {
      타입: typeof data,
      키목록: typeof data === "object" ? Object.keys(data) : "N/A",
      샘플데이터: JSON.stringify(data).substring(0, 500),
    });
    console.groupEnd();
    
    return NextResponse.json({
      success: true,
      requestUrl: apiUrl.replace(pCertKey, "***"),
      responseStatus: response.status,
      contentType: contentType,
      data: data,
      metadata: {
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        params: {
          p_startday: pStartDay,
          p_endday: pEndDay,
          p_itemcategorycode: pItemCategoryCode,
          p_itemcode: pItemCode,
          p_countrycode: pCountryCode,
        },
      },
    });
    
  } catch (error) {
    console.error("❌ 테스트 실패:", error);
    console.groupEnd();
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      requestUrl: apiUrl.replace(pCertKey, "***"),
    }, { status: 500 });
  }
}

