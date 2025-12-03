/**
 * @file types/voc.ts
 * @description 고객의 소리(VOC) 관련 타입 정의
 */

/**
 * VOC 피드백 타입
 */
export interface VOCFeedback {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  created_at: string;
  // 조인된 데이터
  profile?: {
    email: string;
    role: string;
  };
}

/**
 * VOC 피드백 생성 요청 타입
 */
export interface CreateVOCFeedbackRequest {
  title: string;
  content: string;
}

/**
 * VOC 피드백 목록 조회 필터 타입
 */
export interface VOCFeedbackFilter {
  search?: string; // 검색어 (제목/내용 검색)
  profile_id?: string; // 특정 사용자의 피드백만 조회
  start_date?: string; // 시작 날짜 (YYYY-MM-DD)
  end_date?: string; // 종료 날짜 (YYYY-MM-DD)
}

