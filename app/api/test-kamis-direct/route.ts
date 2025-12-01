/**
 * @file app/api/test-kamis-direct/route.ts
 * @description KAMIS API 직접 테스트 (사과, 양배추)
 * 
 * 사과와 양배추 검색 문제를 진단하기 위한 테스트 엔드포인트
 */

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testItem = searchParams.get("item") || "사과"; // "사과" 또는 "양배추"
  
  const certId = process.env.KAMIS_CERT_ID || "6836";
  const certKey = process.env.KAMIS_CERT_KEY?.trim().replace(/^["']|["']$/g, "") || "0efbb7e6-0d61-4f8e-b617-a7bd50853d70";
  
  // 날짜 범위: 최근 30일 (더 많은 데이터 확보)
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 30);
  
  const startDay = monthAgo.toISOString().split('T')[0];
  const endDay = today.toISOString().split('T')[0];
  
  // 테스트 시나리오
  const testScenarios = [];
  
  if (testItem === "사과") {
    // 시나리오 1: 품목 코드 211로 검색
    testScenarios.push({
      name: "시나리오 1: 품목 코드 211 (사과 추정)",
      params: {
        p_itemcategorycode: "200",
        p_itemcode: "211",
      }
    });
    
    // 시나리오 2: 부류 코드만으로 조회
    testScenarios.push({
      name: "시나리오 2: 부류 코드 200만 (과일류 전체)",
      params: {
        p_itemcategorycode: "200",
        // p_itemcode 없음
      }
    });
    
    // 시나리오 3: 다른 품목 코드 시도
    testScenarios.push({
      name: "시나리오 3: 품목 코드 212 (양배추 코드, 잘못된 매핑)",
      params: {
        p_itemcategorycode: "200",
        p_itemcode: "212",
      }
    });
  } else if (testItem === "양배추") {
    // 시나리오 1: 품목 코드 212로 검색
    testScenarios.push({
      name: "시나리오 1: 품목 코드 212 (양배추)",
      params: {
        p_itemcategorycode: "100",
        p_itemcode: "212",
      }
    });
    
    // 시나리오 2: 부류 코드만으로 조회
    testScenarios.push({
      name: "시나리오 2: 부류 코드 100만 (채소류 전체)",
      params: {
        p_itemcategorycode: "100",
        // p_itemcode 없음
      }
    });
  }
  
  const results = [];
  
  for (const scenario of testScenarios) {
    const queryParams = new URLSearchParams({
      action: "periodWholesaleProductList",
      p_cert_key: certKey,
      p_cert_id: certId,
      p_startday: startDay,
      p_endday: endDay,
      p_kindcode: "00",
      p_productrankcode: "04",
      p_countrycode: "1101",
      p_convert_kg_yn: "Y",
      p_returntype: "json",
      ...scenario.params,
    });
    
    const apiUrl = `http://www.kamis.or.kr/service/price/xml.do?${queryParams.toString()}`;
    
    try {
      const response = await fetch(apiUrl, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      
      if (!response.ok) {
        results.push({
          scenario: scenario.name,
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        });
        continue;
      }
      
      const data: any = await response.json();
      
      // 실제 거래 데이터 추출
      let items: any[] = [];
      if (data.condition && data.data && data.data.item) {
        if (Array.isArray(data.data.item)) {
          items = data.data.item.filter((item: any) => {
            const countyName = item.countyname || "";
            return countyName && 
                   countyName !== "평균" && 
                   countyName !== "평년" &&
                   item.itemname;
          });
        } else {
          const item = data.data.item;
          if (item.countyname && item.countyname !== "평균" && item.countyname !== "평년" && item.itemname) {
            items = [item];
          }
        }
      }
      
      // 품목명 필터링 (사과 또는 양배추)
      const keyword = testItem.toLowerCase();
      const filtered = items.filter((item: any) => {
        const itemName = (item.itemname || "").toLowerCase();
        const kindName = (item.kindname || "").toLowerCase();
        return itemName.includes(keyword) || kindName.includes(keyword);
      });
      
      results.push({
        scenario: scenario.name,
        success: true,
        totalItems: items.length,
        filteredItems: filtered.length,
        sampleItems: filtered.slice(0, 3).map((item: any) => ({
          itemname: item.itemname,
          kindname: item.kindname,
          countyname: item.countyname,
          marketname: item.marketname,
          regday: item.regday,
          price: item.price,
        })),
        requestUrl: apiUrl.replace(certKey, "***"),
      });
    } catch (error) {
      results.push({
        scenario: scenario.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  return NextResponse.json({
    testItem,
    dateRange: { startDay, endDay },
    results,
  });
}

