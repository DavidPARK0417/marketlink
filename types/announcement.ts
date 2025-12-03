/**
 * @file types/announcement.ts
 * @description 공지사항 관련 타입 정의
 */

/**
 * 공지사항 타입
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * 공지사항 생성 요청 타입
 */
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
}

/**
 * 공지사항 업데이트 요청 타입
 */
export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
}

/**
 * 공지사항 목록 조회 필터 타입
 */
export interface AnnouncementFilter {
  search?: string; // 검색어 (제목/내용 검색)
}

