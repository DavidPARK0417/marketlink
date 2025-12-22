/**
 * @file lib/utils/highlight.ts
 * @description 검색어 하이라이트 유틸리티 함수
 *
 * 검색어를 텍스트에서 찾아 <mark> 태그로 감싸는 함수입니다.
 * 대소문자를 구분하지 않고 부분 일치를 지원합니다.
 */

import React from "react";

/**
 * 검색어를 하이라이트 처리합니다.
 *
 * @param text 원본 텍스트
 * @param query 검색어
 * @returns 하이라이트 처리된 JSX 요소
 *
 * @example
 * highlightText("사과", "사") // <><mark>사</mark>과</>
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) {
    return text;
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return text;
  }

  // 대소문자 무시 정규식 생성
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // 정규식이 part와 일치하는지 확인 (대소문자 무시)
        const isMatch = regex.test(part);
        // 정규식의 lastIndex를 리셋 (test()는 상태를 변경함)
        regex.lastIndex = 0;

        return isMatch ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
}

/**
 * 정규식 특수 문자를 이스케이프합니다.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
