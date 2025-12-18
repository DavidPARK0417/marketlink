/**
 * @file components/admin/JsonViewer.tsx
 * @description JSON 데이터 포맷팅 및 표시 컴포넌트
 *
 * JSONB 데이터를 가독성 있게 포맷팅하여 표시하는 컴포넌트입니다.
 * 들여쓰기와 색상 구분을 통해 JSON 구조를 명확하게 보여줍니다.
 *
 * @dependencies
 * - @/lib/utils (cn)
 */

"use client";

import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: Record<string, unknown> | unknown[];
  className?: string;
}

/**
 * JSON을 포맷팅된 문자열로 변환
 */
function formatJson(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return String(data);
  }
}

/**
 * JSON 문자열을 HTML로 변환 (기본 포맷팅)
 */
function formatJsonToHtml(jsonString: string): string {
  // 기본적인 JSON 구문 강조 (간단한 버전)
  return jsonString
    .replace(/(".*?"):/g, '<span class="text-[#10B981] dark:text-green-400 font-semibold">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="text-green-600 dark:text-green-400">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="text-orange-600 dark:text-orange-400">$1</span>');
}

export default function JsonViewer({ data, className }: JsonViewerProps) {
  const jsonString = formatJson(data);

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto",
        className,
      )}
    >
      <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
        <code dangerouslySetInnerHTML={{ __html: formatJsonToHtml(jsonString) }} />
      </pre>
    </div>
  );
}

