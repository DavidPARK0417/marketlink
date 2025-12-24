# SEO 메타데이터 구조화 가이드

## 📚 목차

1. [개요](#개요)
2. [구조 설명](#구조-설명)
3. [사용 방법](#사용-방법)
4. [실제 적용 예시](#실제-적용-예시)
5. [주의사항](#주의사항)

---

## 개요

이 가이드에서는 Next.js의 `generateMetadata` 함수를 사용하여 SEO를 위한 동적 메타데이터를 구조화하는 방법을 설명합니다.

### 왜 구조화가 필요한가요?

- **재사용성**: 같은 로직을 여러 페이지에서 재사용
- **유지보수성**: 메타데이터 로직을 한 곳에서 관리
- **일관성**: 모든 페이지에서 동일한 형식의 메타데이터 생성
- **성능**: Next.js가 자동으로 캐싱하여 중복 요청 방지

---

## 구조 설명

### 폴더 구조

```
lib/
  └── metadata/
      ├── index.ts          # 공통 메타데이터 유틸리티
      ├── product.ts        # 상품 관련 메타데이터
      ├── order.ts          # 주문 관련 메타데이터
      └── inquiry.ts        # 문의 관련 메타데이터 (향후 추가)
```

### 각 파일의 역할

#### 1. `lib/metadata/index.ts` - 공통 유틸리티

모든 페이지에서 사용할 수 있는 기본 메타데이터 생성 함수들을 제공합니다.

**주요 함수:**
- `createMetadata()`: 기본 메타데이터 생성
- `createProductMetadata()`: 상품 페이지용 메타데이터
- `createOrderMetadata()`: 주문 페이지용 메타데이터

#### 2. `lib/metadata/product.ts` - 상품 메타데이터

상품 관련 페이지에서 사용하는 메타데이터 생성 함수입니다.

**주요 함수:**
- `generateProductMetadata()`: 상품 ID로 메타데이터 생성

#### 3. `lib/metadata/order.ts` - 주문 메타데이터

주문 관련 페이지에서 사용하는 메타데이터 생성 함수입니다.

**주요 함수:**
- `generateOrderMetadata()`: 주문 ID로 메타데이터 생성

---

## 사용 방법

### 기본 패턴

모든 동적 라우트 페이지는 다음 패턴을 따릅니다:

```typescript
import type { Metadata } from "next";
import { generateProductMetadata } from "@/lib/metadata/product";

// 1. 메타데이터 생성 함수
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const metadata = await generateProductMetadata(id);
  
  // 데이터가 없을 경우 기본값 반환
  return metadata || {
    title: "상품 없음 - FarmToBiz",
    description: "상품 정보를 찾을 수 없습니다.",
  };
}

// 2. 페이지 컴포넌트
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 같은 API를 호출해도 Next.js가 캐싱하여 성능 저하 없음
  const product = await getProductById(id);
  
  return <div>{/* 페이지 내용 */}</div>;
}
```

### 중요한 포인트

1. **자동 캐싱**: `generateMetadata`와 페이지 컴포넌트에서 같은 API를 호출해도 Next.js가 자동으로 캐싱하여 중복 요청을 방지합니다.

2. **에러 처리**: 데이터가 없거나 에러가 발생할 경우 기본 메타데이터를 반환합니다.

3. **개인정보 보호**: 주문 정보 같은 개인정보는 `noIndex`를 설정하여 검색 엔진에 노출하지 않습니다.

---

## 실제 적용 예시

### 예시 1: 상품 수정 페이지

**파일**: `app/wholesaler/products/[id]/edit/page.tsx`

```typescript
import type { Metadata } from "next";
import { generateProductMetadata } from "@/lib/metadata/product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const metadata = await generateProductMetadata(id);
  
  return metadata || {
    title: "상품 수정 - FarmToBiz",
    description: "상품 정보를 수정할 수 없습니다.",
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  // ... 나머지 코드
}
```

### 예시 2: 주문 상세 페이지

**파일**: `app/wholesaler/orders/[id]/page.tsx`

```typescript
import type { Metadata } from "next";
import { generateOrderMetadata } from "@/lib/metadata/order";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const metadata = await generateOrderMetadata(id);
  
  return metadata || {
    title: "주문 정보 - FarmToBiz",
    description: "주문 정보를 불러올 수 없습니다.",
    robots: "noindex, nofollow", // 개인정보 보호
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  // ... 나머지 코드
}
```

---

## 주의사항

### 1. Next.js 15의 params 처리

Next.js 15에서는 `params`가 Promise로 전달됩니다:

```typescript
// ✅ 올바른 방법
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params; // await 필수!
  // ...
}

// ❌ 잘못된 방법 (Next.js 14 이하 방식)
export async function generateMetadata({
  params,
}: {
  params: { id: string }; // Promise가 아님
}): Promise<Metadata> {
  const { id } = params; // 타입 에러 발생
  // ...
}
```

### 2. 개인정보 보호

주문 정보, 사용자 정보 같은 개인정보는 검색 엔진에 노출하지 않아야 합니다:

```typescript
return createMetadata(title, description, {
  noIndex: true, // 검색 엔진 인덱싱 방지
});
```

### 3. 에러 처리

데이터가 없거나 에러가 발생할 경우 기본 메타데이터를 반환합니다:

```typescript
const metadata = await generateProductMetadata(id);
return metadata || {
  title: "기본 제목 - FarmToBiz",
  description: "기본 설명",
};
```

### 4. 이미지 URL 처리

이미지가 없을 경우를 대비하여 기본 이미지를 설정합니다:

```typescript
const imageUrl = product.images?.[0] || product.image_url || undefined;
```

---

## 새로운 페이지에 적용하기

새로운 동적 라우트 페이지를 만들 때:

1. **메타데이터 함수 생성** (`lib/metadata/` 폴더에 추가)
2. **페이지에 적용** (`generateMetadata` 함수 추가)
3. **테스트** (브라우저 개발자 도구에서 메타 태그 확인)

### 예시: 문의 상세 페이지

1. `lib/metadata/inquiry.ts` 파일 생성:

```typescript
import { getInquiryById } from "@/lib/supabase/queries/inquiries";
import { createMetadata } from "./index";

export async function generateInquiryMetadata(
  inquiryId: string,
): Promise<Metadata | null> {
  const inquiry = await getInquiryById(inquiryId);
  if (!inquiry) return null;
  
  return createMetadata(
    `문의 ${inquiry.id}`,
    inquiry.content || "문의 내용",
    {
      noIndex: true, // 개인정보 보호
    },
  );
}
```

2. 페이지에 적용:

```typescript
import { generateInquiryMetadata } from "@/lib/metadata/inquiry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const metadata = await generateInquiryMetadata(id);
  
  return metadata || {
    title: "문의 정보 - FarmToBiz",
    description: "문의 정보를 불러올 수 없습니다.",
  };
}
```

---

## 체크리스트

새로운 페이지에 메타데이터를 추가할 때 확인할 사항:

- [ ] `generateMetadata` 함수를 추가했는가?
- [ ] `params`를 `await`로 처리했는가? (Next.js 15)
- [ ] 데이터가 없을 경우 기본 메타데이터를 반환하는가?
- [ ] 개인정보가 포함된 경우 `noIndex`를 설정했는가?
- [ ] 이미지 URL이 없을 경우를 처리했는가?
- [ ] 에러 처리를 했는가?

---

## 참고 자료

- [Next.js Metadata 문서](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph 프로토콜](https://ogp.me/)
- [Twitter Card 문서](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

