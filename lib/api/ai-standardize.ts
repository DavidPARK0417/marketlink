/**
 * @file ai-standardize.ts
 * @description AI 상품명 표준화 API 함수
 *
 * Gemini 2.5 Flash API를 사용하여 상품명을 표준화하는 서버 사이드 함수입니다.
 * 하이브리드 캐싱 방식을 사용하여 비용을 절감합니다.
 *
 * 주요 기능:
 * 1. 상품명 표준화 (Gemini API 호출)
 * 2. 하이브리드 캐싱 (products 테이블에서 유사 상품명 검색)
 * 3. Rate limit 처리
 * 4. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 *
 * @example
 * ```tsx
 * import { standardizeProductName } from '@/lib/api/ai-standardize';
 *
 * const result = await standardizeProductName('양파1kg특', 'wholesaler-id');
 * console.log(result.standardizedName); // "양파 1kg (특급)"
 * ```
 */

import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * 표준화 결과 타입
 */
export interface StandardizeResult {
  originalName: string;
  standardizedName: string;
  suggestedCategory: string;
  keywords: string[];
  confidence: number; // 0-1
}

/**
 * 상품명 표준화 함수
 *
 * 하이브리드 방식:
 * 1. 같은 도매점의 products 테이블에서 정확히 일치하는 상품명 검색
 * 2. 캐시가 있으면 재사용, 없으면 Gemini API 호출
 *
 * @param {string} productName - 표준화할 상품명
 * @param {string} [wholesalerId] - 도매점 ID (캐싱을 위해 사용)
 * @returns {Promise<StandardizeResult>} 표준화 결과
 *
 * @throws {Error} API 키가 없거나, API 호출 실패 시
 */
export async function standardizeProductName(
  productName: string,
  wholesalerId?: string,
): Promise<StandardizeResult> {
  console.group("🤖 [ai-standardize] 상품명 표준화 시작");
  console.log("productName:", productName);
  console.log("wholesalerId:", wholesalerId);

  try {
    // 1. 입력 검증
    if (!productName || !productName.trim()) {
      throw new Error("상품명을 입력해주세요.");
    }

    const trimmedName = productName.trim();

    // 2. 하이브리드 캐싱: 같은 도매점의 products 테이블에서 검색
    if (wholesalerId) {
      console.log("📦 [ai-standardize] 캐시 검색 시작...");
      const supabase = createClerkSupabaseClient();

      const { data: cachedProduct, error: cacheError } = await supabase
        .from("products")
        .select("standardized_name, ai_suggested_category, ai_keywords")
        .eq("wholesaler_id", wholesalerId)
        .eq("name", trimmedName)
        .not("standardized_name", "is", null)
        .maybeSingle();

      if (cacheError) {
        console.warn("⚠️ [ai-standardize] 캐시 검색 오류:", cacheError);
      } else if (cachedProduct?.standardized_name) {
        console.log("✅ [ai-standardize] 캐시 히트!");
        console.log("cachedProduct:", cachedProduct);

        return {
          originalName: trimmedName,
          standardizedName: cachedProduct.standardized_name,
          suggestedCategory: cachedProduct.ai_suggested_category || "기타",
          keywords: cachedProduct.ai_keywords || [],
          confidence: 0.95, // 캐시된 데이터는 높은 신뢰도
        };
      } else {
        console.log("❌ [ai-standardize] 캐시 미스, Gemini API 호출 필요");
      }
    }

    // 3. Gemini API 호출
    console.log("🚀 [ai-standardize] Gemini API 호출 시작...");

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const prompt = `
다음 상품명을 분석하여 표준화된 형태로 변환해주세요:

입력: "${trimmedName}"

다음 형식으로 JSON 응답을 주세요 (JSON만 응답하고 다른 텍스트는 포함하지 마세요):
{
  "standardizedName": "표준화된 상품명",
  "suggestedCategory": "추천 카테고리",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "confidence": 0.95
}

규칙:
- 단위는 띄어쓰기로 구분 (예: 1kg → 1kg 또는 1 kg)
- 등급은 괄호로 표시 (예: 특 → (특급), 상 → (상급))
- 불필요한 기호 제거
- 카테고리는 다음 중 하나로 분류: 채소류, 과일류, 곡물류, 수산물, 축산물, 가공식품, 기타
- 키워드는 3-5개 추출 (검색에 유용한 단어들)
- confidence는 표준화 신뢰도 (0.8 이상 권장)
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json", // JSON 응답 강제
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      }),
    });

    // 4. Rate limit 처리 (429 에러)
    if (response.status === 429) {
      console.error("❌ [ai-standardize] Rate limit 초과 (429)");
      throw new Error("API 호출 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [ai-standardize] Gemini API 에러:", {
        status: response.status,
        errorData,
      });
      throw new Error(
        `Gemini API 호출 실패: ${response.status} ${errorData.error?.message || ""}`,
      );
    }

    const data = await response.json();

    // 5. Gemini 응답 구조에서 텍스트 추출
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error("❌ [ai-standardize] Gemini 응답 없음:", data);
      throw new Error("Gemini로부터 응답을 받지 못했습니다.");
    }

    // 6. JSON 파싱
    let result;
    try {
      result = JSON.parse(textContent);
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트에서 JSON 추출 시도
      console.warn("⚠️ [ai-standardize] JSON 파싱 실패, 재시도...");
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON 형식의 응답을 파싱할 수 없습니다.");
      }
    }

    // 7. 결과 반환
    const standardizeResult: StandardizeResult = {
      originalName: trimmedName,
      standardizedName: result.standardizedName || trimmedName,
      suggestedCategory: result.suggestedCategory || "기타",
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
      confidence: typeof result.confidence === "number" ? result.confidence : 0.5,
    };

    console.log("✅ [ai-standardize] 표준화 완료:", standardizeResult);
    console.groupEnd();

    return standardizeResult;
  } catch (error) {
    console.error("❌ [ai-standardize] 상품명 표준화 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 여러 상품을 한 번에 표준화 (배치 처리) - 선택 기능
 *
 * @param {string[]} productNames - 표준화할 상품명 배열
 * @returns {Promise<StandardizeResult[]>} 표준화 결과 배열
 *
 * @throws {Error} API 키가 없거나, API 호출 실패 시
 */
export async function standardizeProductNamesBatch(
  productNames: string[],
): Promise<StandardizeResult[]> {
  console.group("🤖 [ai-standardize] 배치 표준화 시작");
  console.log("productNames:", productNames);

  try {
    if (!productNames || productNames.length === 0) {
      throw new Error("상품명 배열이 비어있습니다.");
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API 키가 설정되지 않았습니다.");
    }

    const prompt = `
다음 상품명들을 각각 분석하여 표준화된 형태로 변환해주세요:

${productNames.map((name, idx) => `${idx + 1}. ${name}`).join("\n")}

다음 형식으로 JSON 배열로 응답해주세요:
[
  {
    "originalName": "원본 상품명1",
    "standardizedName": "표준화된 상품명1",
    "suggestedCategory": "카테고리1",
    "keywords": ["키워드1", "키워드2"],
    "confidence": 0.95
  },
  ...
]

규칙:
- 단위는 띄어쓰기로 구분
- 등급은 괄호로 표시
- 카테고리: 채소류, 과일류, 곡물류, 수산물, 축산물, 가공식품, 기타
- 키워드는 3-5개 추출
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      }),
    });

    if (response.status === 429) {
      console.error("❌ [ai-standardize] Rate limit 초과 (429)");
      throw new Error("API 호출 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [ai-standardize] Gemini API 에러:", {
        status: response.status,
        errorData,
      });
      throw new Error(
        `Gemini API 호출 실패: ${response.status} ${errorData.error?.message || ""}`,
      );
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("Gemini로부터 응답을 받지 못했습니다.");
    }

    let results: StandardizeResult[];
    try {
      results = JSON.parse(textContent);
    } catch (parseError) {
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON 형식의 응답을 파싱할 수 없습니다.");
      }
    }

    console.log("✅ [ai-standardize] 배치 표준화 완료:", results.length, "개");
    console.groupEnd();

    return results;
  } catch (error) {
    console.error("❌ [ai-standardize] 배치 표준화 오류:", error);
    console.groupEnd();
    throw error;
  }
}

