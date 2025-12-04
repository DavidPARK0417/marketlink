/**
 * @file app/terms/page.tsx
 * @description 이용약관 페이지
 *
 * Farm to Biz 서비스 이용약관을 표시하는 페이지입니다.
 * 현재는 플레이스홀더 텍스트로 구성되어 있으며, 추후 실제 약관 내용으로 교체 예정입니다.
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 - Farm to Biz",
  description: "Farm to Biz 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        이용약관
      </h1>
      <div className="prose prose-gray max-w-none dark:prose-invert">
        <p className="text-gray-600 dark:text-gray-400">
          이용약관 내용이 여기에 표시됩니다. 추후 실제 약관 내용으로 교체 예정입니다.
        </p>
      </div>
    </div>
  );
}

