# Farm to Biz 디자인 시스템 명세서

**버전**: 1.0.0
**작성일**: 2024-12-04
**기술 스택**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4

---

## 📑 목차

1. [디자인 철학](#디자인-철학)
2. [색상 시스템](#색상-시스템)
3. [타이포그래피](#타이포그래피)
4. [그리드 & 레이아웃](#그리드--레이아웃)
5. [컴포넌트 스타일 가이드](#컴포넌트-스타일-가이드)
6. [인터랙션 & 애니메이션](#인터랙션--애니메이션)
7. [아이콘 시스템](#아이콘-시스템)
8. [반응형 디자인 원칙](#반응형-디자인-원칙)

---

## 디자인 철학

### Farm to Biz 도매 플랫폼의 핵심 원칙

Farm to Biz는 농수산물 도매 플랫폼으로, 농부(공급자)와 소매상(구매자)을 연결하는 신뢰 기반의 B2B 서비스입니다.

#### 주요 디자인 원칙

1. **신뢰와 투명성 (Trust & Transparency)**
   - 명확한 정보 계층구조로 사용자의 신뢰 확보
   - 실시간 데이터와 상태 표시로 투명성 제공
   - 깔끔하고 일관된 인터페이스

2. **효율성 (Efficiency)**
   - 최소한의 클릭으로 원하는 정보 접근
   - 빠른 거래 프로세스 지원
   - 대량 데이터 관리에 최적화된 UI

3. **접근성 (Accessibility)**
   - 초보자도 쉽게 이해할 수 있는 구조
   - 명확한 시각적 계층과 CTA(Call To Action)
   - 키보드 네비게이션 지원

4. **신선함과 생동감 (Fresh & Vibrant)**
   - Emerald Green 색상으로 자연과 성장의 이미지 표현
   - 밝고 깨끗한 배경색으로 신선한 느낌
   - 긍정적이고 활기찬 인터페이스

#### 설계 원칙

- **일관성**: 모든 컴포넌트와 페이지가 동일한 디자인 언어 사용
- **단순성**: 불필요한 요소 제거, 핵심 기능에 집중
- **계층성**: 정보의 중요도에 따른 시각적 우선순위 설정
- **반응성**: 다양한 기기에서 최적의 경험 제공

---

## 색상 시스템

### Primary Color: Emerald Green (#10B981)

Farm to Biz의 핵심 색상으로, 자연, 성장, 신뢰, 안전을 상징합니다.

#### Emerald Green 팔레트

```
┌─────────────────────────────────────────────────────────────┐
│ Level │  Hex     │  RGB           │  사용 용도               │
├─────────────────────────────────────────────────────────────┤
│ 50    │ #ECFDF5  │ 236, 253, 245  │ 배경 강조 (매우 밝음)   │
│ 100   │ #D1FAE5  │ 209, 250, 229  │ 배경 하이라이트         │
│ 200   │ #A7F3D0  │ 167, 243, 208  │ 배경/호버 상태          │
│ 300   │ #6EE7B7  │ 110, 231, 183  │ 보조 강조               │
│ 400   │ #34D399  │ 52, 211, 153   │ 강조 요소               │
│ 500   │ #10B981  │ 16, 185, 129   │ PRIMARY 기본색           │
│ 600   │ #059669  │ 5, 150, 105    │ Primary 호버 상태       │
│ 700   │ #047857  │ 4, 120, 87     │ Primary 액티브 상태     │
│ 800   │ #065F46  │ 6, 95, 70      │ Dark 모드 강조           │
│ 900   │ #064E3B  │ 6, 78, 59      │ Dark 모드 배경           │
└─────────────────────────────────────────────────────────────┘
```

#### Primary 색상 사용 가이드

```tsx
// Primary 버튼
<button className="bg-[#10B981] hover:bg-[#059669] active:bg-[#047857]">
  구매하기
</button>

// 또는 Tailwind 기본 색상명 사용
<button className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700">
  확인
</button>

// 배경에 사용
<div className="bg-[#ECFDF5]">
  성공 메시지
</div>

// 텍스트에 사용
<span className="text-[#047857] font-semibold">
  배송완료
</span>
```

### Secondary Color: Amber Yellow (#FBBF24)

대기/경고 상태와 보조 강조 요소에 사용됩니다.

#### Amber Yellow 팔레트

```
┌─────────────────────────────────────────────────────────────┐
│ Level │  Hex     │  RGB           │  사용 용도               │
├─────────────────────────────────────────────────────────────┤
│ 50    │ #FFFBEB  │ 255, 251, 235  │ 배경 강조               │
│ 100   │ #FEF3C7  │ 254, 243, 199  │ 배경 하이라이트         │
│ 200   │ #FDE68A  │ 253, 230, 138  │ 보조 배경               │
│ 300   │ #FCD34D  │ 252, 211, 77   │ 강조 요소               │
│ 400   │ #FBBF24  │ 251, 191, 36   │ SECONDARY 기본색         │
│ 500   │ #F59E0B  │ 245, 158, 11   │ Secondary 호버 상태     │
│ 600   │ #D97706  │ 217, 119, 6    │ Secondary 액티브 상태   │
│ 700   │ #B45309  │ 180, 83, 9     │ Dark 모드 강조           │
│ 800   │ #92400E  │ 146, 64, 14    │ Dark 모드 배경           │
│ 900   │ #78350F  │ 120, 53, 15    │ 매우 어두운 색           │
└─────────────────────────────────────────────────────────────┘
```

#### Secondary 색상 사용 가이드

```tsx
// 경고/대기 상태
<div className="bg-[#FEF3C7] border-l-4 border-[#FBBF24]">
  주문 승인 대기중입니다.
</div>

// 정보 표시
<span className="bg-[#FBBF24] text-[#78350F] px-3 py-1 rounded-full">
  특가 상품
</span>

// Secondary 버튼
<button className="bg-[#FBBF24] hover:bg-[#F59E0B]">
  더 알아보기
</button>
```

### Danger Color: Red (#EF4444)

오류, 삭제, 위험한 액션에 사용됩니다.

#### Red 팔레트

```
┌─────────────────────────────────────────────────────────────┐
│ Level │  Hex     │  RGB           │  사용 용도               │
├─────────────────────────────────────────────────────────────┤
│ 50    │ #FEF2F2  │ 254, 242, 242  │ 배경 강조               │
│ 100   │ #FEE2E2  │ 254, 226, 226  │ 배경 하이라이트         │
│ 200   │ #FECACA  │ 254, 202, 202  │ 보조 배경               │
│ 300   │ #FCA5A5  │ 252, 165, 165  │ 강조 요소               │
│ 400   │ #F87171  │ 248, 113, 113  │ 알림 배경               │
│ 500   │ #EF4444  │ 239, 68, 68    │ DANGER 기본색           │
│ 600   │ #DC2626  │ 220, 38, 38    │ Danger 호버 상태        │
│ 700   │ #B91C1C  │ 185, 28, 28    │ Danger 액티브 상태      │
│ 800   │ #991B1B  │ 153, 27, 27    │ Dark 모드 강조           │
│ 900   │ #7F1D1D  │ 127, 29, 29    │ 매우 어두운 색           │
└─────────────────────────────────────────────────────────────┘
```

#### Danger 색상 사용 가이드

```tsx
// 위험 액션 버튼
<button className="bg-[#EF4444] hover:bg-[#DC2626] text-white">
  주문 취소
</button>

// 오류 메시지
<div className="bg-[#FEE2E2] border-l-4 border-[#EF4444]">
  <p className="text-[#991B1B]">
    입력하신 가격이 범위를 벗어났습니다.
  </p>
</div>

// 오류 입력 필드
<input className="border-2 border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]" />
```

### Info Color: Blue (#3B82F6)

정보 표시, 링크, 상호작용 요소에 사용됩니다.

#### Blue 팔레트

```
┌─────────────────────────────────────────────────────────────┐
│ Level │  Hex     │  RGB           │  사용 용도               │
├─────────────────────────────────────────────────────────────┤
│ 50    │ #EFF6FF  │ 239, 246, 255  │ 배경 강조               │
│ 100   │ #DBEAFE  │ 219, 234, 254  │ 배경 하이라이트         │
│ 200   │ #BFDBFE  │ 191, 219, 254  │ 보조 배경               │
│ 300   │ #93C5FD  │ 147, 197, 253  │ 강조 요소               │
│ 400   │ #60A5FA  │ 96, 165, 250   │ 링크/알림               │
│ 500   │ #3B82F6  │ 59, 130, 246   │ INFO 기본색             │
│ 600   │ #2563EB  │ 37, 99, 235    │ Info 호버 상태          │
│ 700   │ #1D4ED8  │ 29, 78, 216    │ Info 액티브 상태        │
│ 800   │ #1E40AF  │ 30, 64, 175    │ Dark 모드 강조           │
│ 900   │ #1E3A8A  │ 30, 58, 138    │ Dark 모드 배경           │
└─────────────────────────────────────────────────────────────┘
```

#### Info 색상 사용 가이드

```tsx
// 정보 링크
<a href="/help" className="text-[#3B82F6] hover:text-[#2563EB]">
  더 알아보기
</a>

// 정보 메시지
<div className="bg-[#DBEAFE] border-l-4 border-[#3B82F6]">
  <p className="text-[#1E40AF]">
    주문이 정상적으로 접수되었습니다.
  </p>
</div>

// 정보 배지
<span className="bg-[#EFF6FF] text-[#1E40AF] px-3 py-1">
  신상품
</span>
```

### Neutral Color: Gray Scale (#111827 ~ #F9FAFB)

텍스트, 배경, 구분선, 비활성 요소에 사용됩니다.

#### Gray Scale 팔레트

```
┌──────────────────────────────────────────────────────┐
│ Level │  Hex     │  사용 용도                        │
├──────────────────────────────────────────────────────┤
│ 50    │ #F9FAFB  │ 페이지 배경/매우 밝은 배경        │
│ 100   │ #F3F4F6  │ 카드 배경/밝은 배경              │
│ 200   │ #E5E7EB  │ 구분선/탭 비활성                 │
│ 300   │ #D1D5DB  │ 입력 필드 테두리                 │
│ 400   │ #9CA3AF  │ 보조 텍스트/아이콘              │
│ 500   │ #6B7280  │ 보조 텍스트 (기본)               │
│ 600   │ #4B5563  │ 본문 텍스트                     │
│ 700   │ #374151  │ 제목/강조 텍스트                 │
│ 800   │ #1F2937  │ 어두운 텍스트                   │
│ 900   │ #111827  │ 텍스트 기본 (매우 어둔색)        │
└──────────────────────────────────────────────────────┘
```

#### Neutral 색상 사용 세부 분류

**텍스트 색상**:
```
primary:     #111827 (제목, 본문)
secondary:   #6B7280 (보조 설명)
tertiary:    #9CA3AF (캡션, 작은 텍스트)
disabled:    #D1D5DB (비활성 텍스트)
inverse:     #FFFFFF (다크 배경에서의 텍스트)
```

**배경 색상**:
```
page:        #F8F9FA (페이지 기본 배경)
card:        #FFFFFF (카드, 모달 배경)
hover:       #F3F4F6 (호버 상태 배경)
active:      #E5E7EB (활성 상태 배경)
```

**테두리 색상**:
```
light:       #E5E7EB (미묘한 테두리)
medium:      #D1D5DB (기본 테두리)
dark:        #9CA3AF (강조 테두리)
```

#### Neutral 색상 사용 가이드

```tsx
// 텍스트 색상 계층
<h1 className="text-[#111827] font-bold">
  주문 관리
</h1>
<p className="text-[#6B7280]">
  최근 7일간의 주문 현황입니다.
</p>
<span className="text-[#9CA3AF] text-xs">
  마지막 업데이트: 2024-12-04
</span>

// 배경 색상
<div className="bg-[#F8F9FA] p-6">
  <div className="bg-white rounded-lg shadow-md p-4">
    카드 컨텐츠
  </div>
</div>

// 테두리 색상
<input className="border border-[#D1D5DB] focus:border-[#10B981]" />
```

### Status Color: 상태 표시 색상

주문, 상품, 배송 상태를 시각적으로 구분합니다.

```json
{
  "pending": {
    "value": "#FBBF24",
    "background": "#FEF3C7",
    "text": "#92400E",
    "label": "대기중",
    "usage": "주문 접수 대기, 승인 대기"
  },
  "confirmed": {
    "value": "#3B82F6",
    "background": "#DBEAFE",
    "text": "#1E40AF",
    "label": "확인됨",
    "usage": "주문 확인, 거래 성사"
  },
  "shipped": {
    "value": "#8B5CF6",
    "background": "#EDE9FE",
    "text": "#5B21B6",
    "label": "배송중",
    "usage": "상품 배송중, 진행중"
  },
  "completed": {
    "value": "#10B981",
    "background": "#D1FAE5",
    "text": "#065F46",
    "label": "완료",
    "usage": "배송완료, 거래완료"
  },
  "active": {
    "value": "#10B981",
    "background": "#D1FAE5",
    "text": "#065F46",
    "label": "활성",
    "usage": "활성 상품, 활성 회원"
  },
  "inactive": {
    "value": "#6B7280",
    "background": "#F3F4F6",
    "text": "#374151",
    "label": "비활성",
    "usage": "비활성 상품, 비활성 거래"
  }
}
```

#### Status 색상 사용 가이드

```tsx
// 상태 배지 (Pending)
<span className="bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-sm font-medium">
  대기중
</span>

// 상태 행 (Confirmed)
<tr className="bg-[#DBEAFE] border-l-4 border-[#3B82F6]">
  <td>주문 #1234</td>
  <td className="text-[#1E40AF] font-semibold">확인됨</td>
</tr>

// 상태 카드 (Completed)
<div className="bg-[#D1FAE5] border-l-4 border-[#10B981] p-4">
  <span className="text-[#065F46] font-semibold">
    배송완료
  </span>
</div>
```

### 색상 접근성 가이드

모든 색상 조합이 WCAG AA 이상의 대비도를 만족합니다.

```tsx
// ✅ 추천 조합 (충분한 대비)
<button className="bg-[#10B981] text-white">
  OK
</button>

<div className="bg-[#D1FAE5] text-[#065F46]">
  OK
</div>

// ❌ 피해야 할 조합 (대비 부족)
<button className="bg-[#D1FAE5] text-[#10B981]">
  NOT OK
</button>
```

---

## 타이포그래피

### 폰트 시스템

#### Primary Font: Pretendard Variable

```css
font-family: "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
```

**특징**:
- 한글 최적화
- Variable Font 지원 (가변 굵기)
- 웹 폰트 경량화
- 다국어 지원 (한글, 영어, 일본어 등)
- CDN 제공: https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css

**Tailwind 적용**:
```tsx
// Pretendard는 기본 font-sans로 자동 적용됨
<div className="font-sans">
  자동으로 Pretendard Variable 사용
</div>
```

#### Monospace Font

코드, 숫자 데이터 표시용:
```
ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace
```

**사용 예시**:
```tsx
// 추적번호, 가격 등 정확한 수치 표현
<code className="font-mono text-sm">
  #ORDER-2024-001234
</code>

<span className="font-mono text-lg font-semibold">
  ₩1,234,567
</span>
```

### 폰트 크기 스케일

```
┌──────────────────────────────────────────────────────────────┐
│ 레벨 │ 크기      │ 픽셀  │ 행간      │ 사용 용도             │
├──────────────────────────────────────────────────────────────┤
│ xs   │ 0.75rem  │ 12px  │ 1rem(16px)│ 작은 라벨, 보조 텍스트│
│ sm   │ 0.875rem │ 14px  │ 1.25rem   │ 테이블 데이터, 라벨   │
│ base │ 1rem     │ 16px  │ 1.5rem    │ 본문 텍스트 (기본)    │
│ lg   │ 1.125rem │ 18px  │ 1.75rem   │ 강조 텍스트, 부제목   │
│ xl   │ 1.25rem  │ 20px  │ 1.75rem   │ 섹션 제목             │
│ 2xl  │ 1.5rem   │ 24px  │ 2rem      │ 페이지 제목           │
│ 3xl  │ 1.875rem │ 30px  │ 2.25rem   │ 메인 헤딩             │
│ 4xl  │ 2.25rem  │ 36px  │ 2.5rem    │ 대형 디스플레이       │
│ 5xl  │ 3rem     │ 48px  │ 1         │ 히어로 텍스트         │
└──────────────────────────────────────────────────────────────┘
```

#### 폰트 크기 사용 가이드

```tsx
// xs: 작은 라벨, 보조 텍스트
<span className="text-xs text-[#9CA3AF]">
  마지막 업데이트: 2024-12-04
</span>

// sm: 테이블 데이터, 폼 라벨
<label className="text-sm font-medium">
  상품명
</label>

// base: 본문 텍스트 (기본)
<p className="text-base">
  Farm to Biz는 신뢰할 수 있는 도매 플랫폼입니다.
</p>

// lg: 강조 텍스트, 부제목
<h3 className="text-lg font-semibold">
  주문 완료
</h3>

// xl ~ 5xl: 제목 및 디스플레이
<h1 className="text-4xl font-bold">
  주문 관리 대시보드
</h1>
```

### 폰트 굵기

```
┌──────────────────────────────────────────────────┐
│ 레벨      │ 값  │ Tailwind │ 사용 용도            │
├──────────────────────────────────────────────────┤
│ light     │ 300 │ font-light │ 보조 텍스트        │
│ normal    │ 400 │ font-normal │ 본문 (기본)       │
│ medium    │ 500 │ font-medium │ 강조, 버튼        │
│ semibold  │ 600 │ font-semibold │ 제목            │
│ bold      │ 700 │ font-bold │ 헤딩, 강한 강조    │
│ extrabold │ 800 │ font-extrabold │ 특별한 강조    │
└──────────────────────────────────────────────────┘
```

#### 폰트 굵기 사용 가이드

```tsx
// font-light (300): 보조 텍스트
<p className="font-light text-gray-500">
  선택 사항입니다.
</p>

// font-normal (400): 본문 (기본)
<p className="font-normal">
  주문 내용입니다.
</p>

// font-medium (500): 강조, 버튼
<button className="font-medium">
  주문하기
</button>

// font-semibold (600): 제목
<h3 className="font-semibold text-lg">
  배송 정보
</h3>

// font-bold (700): 헤딩, 강한 강조
<h1 className="font-bold text-3xl">
  주문 관리
</h1>

// font-extrabold (800): 특별한 강조
<span className="font-extrabold text-red-600">
  긴급!
</span>
```

### 행간 (Line Height)

```
┌───────────────────────────────────────────┐
│ 레벨   │ 값   │ Tailwind    │ 사용 용도 │
├───────────────────────────────────────────┤
│ tight  │ 1.25 │ leading-tight │ 헤딩    │
│ normal │ 1.5  │ leading-normal │ 본문  │
│ relaxed│ 1.75 │ leading-relaxed│ 긴 본문│
│ loose  │ 2    │ leading-loose │ 특별 간격│
└───────────────────────────────────────────┘
```

### 자간 (Letter Spacing)

```
┌─────────────────────────────────────────┐
│ 레벨    │ 값      │ Tailwind      │ 사용 │
├─────────────────────────────────────────┤
│ tighter │ -0.05em │ tracking-tighter│ 큰 텍스트 │
│ tight   │ -0.025em│ tracking-tight │ 헤딩 │
│ normal  │ 0       │ tracking-normal│ 본문 │
│ wide    │ 0.025em │ tracking-wide  │ 작은 텍스트 │
│ wider   │ 0.05em  │ tracking-wider │ 대문자 │
└─────────────────────────────────────────┘
```

### 텍스트 스타일 조합

자주 사용하는 텍스트 조합:

#### h1: 페이지 메인 제목

```tsx
<h1 className="text-2xl font-bold leading-tight tracking-tight">
  주문 관리
</h1>

// 반응형
<h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
  주문 관리
</h1>
```

**속성**:
- 크기: 24px (2xl)
- 굵기: Bold (700)
- 행간: Tight (1.25)
- 자간: Tight (-0.025em)

#### h2: 섹션 제목

```tsx
<h2 className="text-xl font-bold leading-tight tracking-tight">
  최근 주문
</h2>
```

**속성**:
- 크기: 20px (xl)
- 굵기: Bold (700)
- 행간: Tight (1.25)
- 자간: Tight (-0.025em)

#### h3: 서브섹션 제목

```tsx
<h3 className="text-lg font-semibold">
  배송 정보
</h3>
```

**속성**:
- 크기: 18px (lg)
- 굵기: Semibold (600)
- 행간: Normal (1.5)
- 자간: Normal (0)

#### body: 일반 본문 텍스트

```tsx
<p className="text-base">
  Farm to Biz는 농수산물 B2B 도매 플랫폼입니다.
</p>
```

**속성**:
- 크기: 16px (base)
- 굵기: Normal (400)
- 행간: Normal (1.5)
- 자간: Normal (0)

#### bodySm: 작은 본문, 폼 텍스트

```tsx
<p className="text-sm">
  선택 사항입니다.
</p>
```

**속성**:
- 크기: 14px (sm)
- 굵기: Normal (400)
- 행간: Normal (1.5)
- 자간: Normal (0)

#### caption: 보조 설명, 라벨

```tsx
<span className="text-xs tracking-wide text-gray-500">
  마지막 업데이트: 2024-12-04
</span>
```

**속성**:
- 크기: 12px (xs)
- 굵기: Normal (400)
- 행간: Tight (1.25)
- 자간: Wide (0.025em)

#### button: 버튼 텍스트

```tsx
<button className="text-base font-medium">
  주문하기
</button>
```

**속성**:
- 크기: 16px (base)
- 굵기: Medium (500)
- 행간: Tight (1.25)
- 자간: Normal (0)

#### label: 폼 라벨, 입력 필드 라벨

```tsx
<label className="text-sm font-medium">
  상품명
</label>
```

**속성**:
- 크기: 14px (sm)
- 굵기: Medium (500)
- 행간: Tight (1.25)
- 자간: Normal (0)

#### badge: 뱃지, 태그, 상태 표시

```tsx
<span className="text-xs font-semibold tracking-wider bg-green-100 text-green-800 px-2 py-1 rounded-full">
  활성
</span>
```

**속성**:
- 크기: 12px (xs)
- 굵기: Semibold (600)
- 행간: Tight (1.25)
- 자간: Wider (0.05em)

---

## 그리드 & 레이아웃

### 반응형 브레이크포인트

Farm to Biz는 Mobile First 접근 방식을 사용합니다.

```
┌──────────────────────────────────────────────────────┐
│ 디바이스     │ 범위          │ Tailwind │ 용도        │
├──────────────────────────────────────────────────────┤
│ Mobile      │ < 640px       │ (기본)   │ 스마트폰    │
│ Tablet      │ 640px~1024px  │ md:, lg: │ 태블릿      │
│ Desktop     │ > 1024px      │ lg:, xl: │ 데스크톱    │
│ Large       │ > 1280px      │ xl:      │ 넓은 화면   │
│ Extra Large │ > 1536px      │ 2xl:     │ 초대형 화면 │
└──────────────────────────────────────────────────────┘
```

#### 브레이크포인트 사용 가이드

```tsx
// Mobile First 방식
<div className="
  w-full p-4                    // 모바일: 전체 너비, 16px 패딩
  md:w-2/3 md:p-6              // 태블릿: 2/3 너비, 24px 패딩
  lg:w-1/2 lg:p-8              // 데스크톱: 1/2 너비, 32px 패딩
">

// 숨김/표시 제어
<nav className="hidden lg:block">
  {/* 데스크톱에서만 표시 */}
</nav>

<nav className="lg:hidden">
  {/* 모바일/태블릿에서만 표시 */}
</nav>

// 컬럼 수 조정
<div className="
  grid grid-cols-1          // 모바일: 1 컬럼
  md:grid-cols-2            // 태블릿: 2 컬럼
  lg:grid-cols-3            // 데스크톱: 3 컬럼
">
```

### 컨테이너 최대 너비

```
┌────────────────────────────────────────────────┐
│ 크기  │ 픽셀  │ Tailwind  │ 사용 용도         │
├────────────────────────────────────────────────┤
│ sm   │ 640px │ max-w-sm  │ 폼, 좁은 컨텐츠   │
│ md   │ 768px │ max-w-md  │ 중간 컨텐츠       │
│ lg   │ 1024px│ max-w-lg  │ 일반 컨텐츠(기본) │
│ xl   │ 1280px│ max-w-xl  │ 넓은 컨텐츠       │
│ 2xl  │ 1536px│ max-w-2xl │ 최대 너비         │
│ full │ 100%  │ max-w-full│ 전체 너비         │
└────────────────────────────────────────────────┘
```

#### 컨테이너 사용 가이드

```tsx
// 표준 페이지 컨테이너
<div className="max-w-lg mx-auto p-4">
  페이지 컨텐츠
</div>

// 대시보드 (넓은 화면)
<div className="max-w-4xl mx-auto p-8">
  대시보드 컨텐츠
</div>

// 모달 (좁은 컨텐츠)
<div className="max-w-md mx-auto bg-white rounded-lg shadow-xl">
  모달 컨텐츠
</div>
```

### 간격 시스템

모든 간격은 Tailwind의 기본 시스템을 사용합니다. **1 unit = 0.25rem = 4px**

```
┌──────────────────────────────────────────────────┐
│ Unit │ Rem    │ 픽셀 │ 사용 용도                │
├──────────────────────────────────────────────────┤
│ 0    │ 0      │ 0px  │ 간격 없음               │
│ 1    │ 0.25rem│ 4px  │ 매우 작은 간격          │
│ 2    │ 0.5rem │ 8px  │ 작은 간격, 아이콘      │
│ 3    │ 0.75rem│ 12px │ 텍스트 간격            │
│ 4    │ 1rem   │ 16px │ 기본 간격, 버튼 패딩   │
│ 5    │ 1.25rem│ 20px │ 중간 간격              │
│ 6    │ 1.5rem │ 24px │ 표준 섹션 간격         │
│ 8    │ 2rem   │ 32px │ 큰 섹션 간격           │
│ 10   │ 2.5rem │ 40px │ 매우 큰 간격           │
│ 12   │ 3rem   │ 48px │ 페이지 섹션 구분       │
│ 16   │ 4rem   │ 64px │ 메이저 섹션 구분       │
│ 20   │ 5rem   │ 80px │ 특별한 큰 간격         │
│ 24   │ 6rem   │ 96px │ 히어로 섹션 간격       │
└──────────────────────────────────────────────────┘
```

#### 간격 사용 가이드

```tsx
// Padding (패딩 - 내부 여백)
<div className="p-4">           // 모든 방향 16px
<div className="px-4 py-2">     // 좌우 16px, 위아래 8px
<div className="pt-4 pb-6">     // 위 16px, 아래 24px

// Margin (마진 - 외부 여백)
<div className="m-4">           // 모든 방향 16px
<div className="mx-auto">       // 가로 중앙정렬
<div className="mt-4 mb-6">     // 위 16px, 아래 24px

// Gap (요소 간 간격)
<div className="flex gap-4">    // 자식 요소 간 16px
<div className="grid gap-6">    // 그리드 아이템 간 24px

// Space (연속적인 간격)
<div className="space-y-4">     // 자식 요소 간 위/아래로 16px
<div className="space-x-2">     // 자식 요소 간 좌/우로 8px
```

#### 컴포넌트별 표준 간격

**버튼**:
```
- 패딩X: 12px (sm), 16px (md), 24px (lg)
- 패딩Y: 8px (sm), 10px (md), 12px (lg)
- 아이콘과 텍스트 사이: 8px (gap-2)
```

**카드**:
```
- 카드 패딩: 24px (p-6)
- 카드 내부 요소 간격: 16px (gap-4)
- 카드 간 간격: 24px (mb-6)
```

**폼**:
```
- 라벨 마진: 8px (mb-2)
- 입력 필드 패딩X: 16px (px-4)
- 입력 필드 패딩Y: 10px (py-2.5)
- 필드 간 간격: 16px (gap-4)
- 섹션 간 간격: 32px (gap-8)
```

**모달**:
```
- 모달 패딩: 24px (p-6)
- 헤더 마진: 16px (mb-4)
- 푸터 마진: 24px (mt-6)
- 컨텐츠 간 간격: 24px (gap-6)
```

**테이블**:
```
- 셀 패딩X: 16px (px-4)
- 셀 패딩Y: 12px (py-3)
- 헤더 패딩Y: 16px (py-4)
```

**내비게이션**:
```
- 사이드바 패딩: 16px (p-4)
- 네비 아이템 패딩X: 12px (px-3)
- 네비 아이템 패딩Y: 12px (py-3)
- 네비 아이템 아이콘/텍스트 간: 8px (gap-2)
```

---

## 컴포넌트 스타일 가이드

### 버튼 (Button)

#### Variants

```tsx
// Primary Button (기본)
<button className="
  bg-[#10B981] hover:bg-[#059669] active:bg-[#047857]
  text-white font-medium
  px-4 py-2.5 rounded-lg
  shadow-md hover:shadow-lg active:shadow
  transition-all duration-300
  hover:-translate-y-0.5 active:scale-98
">
  확인
</button>

// Secondary Button
<button className="
  bg-[#FBBF24] hover:bg-[#F59E0B] active:bg-[#D97706]
  text-[#78350F] font-medium
  px-4 py-2.5 rounded-lg
  shadow-md hover:shadow-lg
  transition-all duration-300
">
  더 알아보기
</button>

// Ghost Button
<button className="
  bg-transparent hover:bg-[#F3F4F6]
  text-[#111827] font-medium
  px-4 py-2.5 rounded-lg
  border border-[#E5E7EB]
  transition-colors duration-300
">
  취소
</button>

// Danger Button
<button className="
  bg-[#EF4444] hover:bg-[#DC2626]
  text-white font-medium
  px-4 py-2.5 rounded-lg
  shadow-md hover:shadow-lg
  transition-all duration-300
">
  삭제
</button>
```

#### States

```tsx
// Hover State (호버)
<button className="hover:bg-[#059669] hover:shadow-lg hover:-translate-y-0.5">

// Focus State (포커스)
<button className="focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2">

// Active State (액티브)
<button className="active:scale-98 active:shadow">

// Disabled State (비활성)
<button className="disabled:opacity-50 disabled:cursor-not-allowed" disabled>
```

#### 크기 변형

```tsx
// Small Button
<button className="px-3 py-2 text-sm rounded-lg">
  작은버튼
</button>

// Medium Button (기본)
<button className="px-4 py-2.5 text-base rounded-lg">
  기본버튼
</button>

// Large Button
<button className="px-6 py-3 text-lg rounded-lg">
  큰버튼
</button>
```

### 카드 (Card)

#### Basic Card

```tsx
<div className="
  bg-white rounded-2xl
  shadow-md hover:shadow-xl
  p-6
  transition-all duration-300 hover:-translate-y-1
">
  <h3 className="text-lg font-semibold mb-2">
    상품명
  </h3>
  <p className="text-gray-600 mb-4">
    상품 설명
  </p>
  <button className="text-[#10B981] font-medium hover:text-[#059669]">
    더 알아보기
  </button>
</div>
```

#### 3D Effect Card

```tsx
<div className="
  bg-white rounded-3xl
  shadow-[0_20px_50px_rgba(16,185,129,0.15)]
  hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)]
  p-6
  transition-all duration-300 hover:-translate-y-2
">
  프리미엄 카드 컨텐츠
</div>
```

#### Status Card (상태 표시)

```tsx
// Pending
<div className="
  bg-[#FEF3C7] border-l-4 border-[#FBBF24]
  p-4 rounded-lg
">
  <p className="text-[#92400E] font-semibold">
    주문 승인 대기중
  </p>
</div>

// Completed
<div className="
  bg-[#D1FAE5] border-l-4 border-[#10B981]
  p-4 rounded-lg
">
  <p className="text-[#065F46] font-semibold">
    배송완료
  </p>
</div>
```

### 폼 (Form)

#### 입력 필드 (Input)

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-[#111827]">
    상품명
  </label>
  <input
    type="text"
    placeholder="상품명을 입력하세요"
    className="
      w-full px-4 py-2.5
      border border-[#D1D5DB] rounded-lg
      text-[#111827] text-base
      focus:outline-none
      focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2
      placeholder:text-[#9CA3AF]
      transition-colors duration-150
      disabled:bg-[#F3F4F6] disabled:cursor-not-allowed
    "
  />
  <p className="text-xs text-[#9CA3AF]">
    상품명은 최대 100자입니다.
  </p>
</div>
```

#### Select (선택)

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-[#111827]">
    카테고리
  </label>
  <select className="
    w-full px-4 py-2.5
    border border-[#D1D5DB] rounded-lg
    text-[#111827] text-base
    focus:ring-2 focus:ring-[#10B981]
    transition-colors duration-150
  ">
    <option>선택하세요</option>
    <option>신선 과일</option>
    <option>신선 채소</option>
  </select>
</div>
```

#### Checkbox

```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="
      w-5 h-5
      rounded-md border border-[#D1D5DB]
      focus:ring-2 focus:ring-[#10B981]
      cursor-pointer
    "
  />
  <span className="text-base text-[#111827]">
    이용약관에 동의합니다
  </span>
</label>
```

#### Radio Button

```tsx
<fieldset className="space-y-3">
  <legend className="text-sm font-medium text-[#111827]">
    배송 방법
  </legend>
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      name="shipping"
      className="
        w-5 h-5
        rounded-full border border-[#D1D5DB]
        focus:ring-2 focus:ring-[#10B981]
        cursor-pointer
      "
    />
    <span className="text-base text-[#111827]">
      기본 배송
    </span>
  </label>
</fieldset>
```

#### 에러 상태

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-[#111827]">
    가격
  </label>
  <input
    type="number"
    className="
      w-full px-4 py-2.5
      border-2 border-[#EF4444]
      rounded-lg
      text-[#111827] text-base
      focus:ring-2 focus:ring-[#EF4444]
    "
  />
  <p className="text-sm text-[#EF4444]">
    가격은 0 이상이어야 합니다.
  </p>
</div>
```

### 모달 (Modal)

#### Modal Structure

```tsx
<div className="fixed inset-0 flex items-center justify-center z-50">
  {/* Backdrop */}
  <div className="
    fixed inset-0
    bg-gray-900/50 backdrop-blur-sm
    transition-opacity duration-300
  " onClick={onClose} />

  {/* Modal Content */}
  <div className="
    relative bg-white rounded-2xl
    shadow-2xl max-w-md w-full mx-4
    transition-all duration-300
  ">
    {/* Header */}
    <div className="
      border-b border-[#E5E7EB]
      px-6 py-4
    ">
      <h2 className="text-xl font-bold text-[#111827]">
        주문 확인
      </h2>
    </div>

    {/* Body */}
    <div className="px-6 py-6 space-y-4">
      <p className="text-base text-[#6B7280]">
        이 주문을 확인하시겠습니까?
      </p>
    </div>

    {/* Footer */}
    <div className="
      border-t border-[#E5E7EB]
      px-6 py-4
      flex gap-3 justify-end
    ">
      <button className="
        px-4 py-2 rounded-lg
        border border-[#D1D5DB]
        text-[#111827] font-medium
        hover:bg-[#F3F4F6]
        transition-colors duration-300
      ">
        취소
      </button>
      <button className="
        px-4 py-2 rounded-lg
        bg-[#10B981] text-white font-medium
        hover:bg-[#059669]
        transition-colors duration-300
      ">
        확인
      </button>
    </div>
  </div>
</div>
```

### 테이블 (Table)

#### Table Structure

```tsx
<div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
  <table className="w-full">
    {/* Header */}
    <thead>
      <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <th className="px-4 py-4 text-left text-sm font-semibold text-[#111827]">
          주문번호
        </th>
        <th className="px-4 py-4 text-left text-sm font-semibold text-[#111827]">
          상품
        </th>
        <th className="px-4 py-4 text-right text-sm font-semibold text-[#111827]">
          가격
        </th>
        <th className="px-4 py-4 text-center text-sm font-semibold text-[#111827]">
          상태
        </th>
      </tr>
    </thead>

    {/* Body */}
    <tbody>
      <tr className="
        border-b border-[#E5E7EB]
        hover:bg-[#F9FAFB]
        transition-colors duration-150
      ">
        <td className="px-4 py-3 text-sm text-[#111827] font-mono">
          #ORD-2024-0001
        </td>
        <td className="px-4 py-3 text-sm text-[#111827]">
          상추
        </td>
        <td className="px-4 py-3 text-sm text-right text-[#111827] font-mono">
          ₩50,000
        </td>
        <td className="px-4 py-3 text-center">
          <span className="
            bg-[#D1FAE5] text-[#065F46]
            px-3 py-1 rounded-full text-xs font-semibold
          ">
            배송완료
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 네비게이션 (Navigation)

#### 상단 헤더

```tsx
<header className="
  bg-white border-b border-[#E5E7EB]
  h-16 flex items-center px-6
  shadow-sm
">
  <div className="flex items-center justify-between w-full">
    <h1 className="text-2xl font-bold text-[#10B981]">
      Farm to Biz
    </h1>
    <nav className="hidden lg:flex gap-8">
      <a href="/products" className="
        text-base text-[#6B7280]
        hover:text-[#10B981]
        transition-colors duration-300
      ">
        상품
      </a>
      <a href="/orders" className="
        text-base text-[#6B7280]
        hover:text-[#10B981]
        transition-colors duration-300
      ">
        주문
      </a>
    </nav>
  </div>
</header>
```

#### 사이드바

```tsx
<aside className="
  w-64 bg-white border-r border-[#E5E7EB]
  h-screen overflow-y-auto p-4
">
  <nav className="space-y-2">
    <a href="/dashboard" className="
      flex items-center gap-2
      px-3 py-3 rounded-lg
      bg-[#D1FAE5] text-[#10B981] font-medium
      transition-colors duration-300
    ">
      <Home size={20} />
      대시보드
    </a>
    <a href="/products" className="
      flex items-center gap-2
      px-3 py-3 rounded-lg
      text-[#6B7280] hover:bg-[#F3F4F6]
      transition-colors duration-300
    ">
      <Package size={20} />
      상품 관리
    </a>
  </nav>
</aside>
```

---

## 인터랙션 & 애니메이션

### 호버 (Hover) 상태

#### 버튼 호버

```tsx
// Primary Button Hover
<button className="
  bg-[#10B981] hover:bg-[#059669]     // 색상 변경
  hover:shadow-lg                      // 그림자 강화
  hover:-translate-y-0.5               // 위로 이동 (4px)
  transition-all duration-300          // 부드러운 전환
">
  확인
</button>

// Ghost Button Hover
<button className="
  bg-transparent hover:bg-[#F3F4F6]   // 배경 추가
  border border-[#E5E7EB]
  transition-colors duration-300
">
  취소
</button>
```

#### 카드 호버

```tsx
<div className="
  shadow-md hover:shadow-xl    // 그림자 강화
  hover:-translate-y-1         // 위로 이동 (4px)
  transition-all duration-300  // 부드러운 전환
">
  카드 컨텐츠
</div>
```

#### 링크 호버

```tsx
<a href="/products" className="
  text-[#10B981]
  hover:text-[#059669]        // 색상 변경
  hover:underline             // 밑줄 추가
  transition-colors duration-300
">
  상품 보기
</a>
```

### 포커스 (Focus) 상태

#### Input Focus

```tsx
<input className="
  border border-[#D1D5DB]
  focus:outline-none
  focus:ring-2 focus:ring-[#10B981]    // Focus Ring
  focus:ring-offset-2                  // Ring Offset
  focus:border-transparent
  transition-all duration-150
" />
```

#### Button Focus

```tsx
<button className="
  focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2
  transition-all duration-150
">
  버튼
</button>
```

#### Focus Ring 컬러 변형

```tsx
// Danger Focus
<input className="
  focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2
" />

// Subtle Focus
<input className="
  focus:ring-1 focus:ring-[#9CA3AF]
" />
```

### 액티브 (Active) 상태

```tsx
<button className="
  active:scale-98              // 눌림 상태: 98% 크기
  active:shadow                // 그림자 감소
  active:bg-[#047857]          // 색상 더 어둡게
  transition-all duration-150
">
  버튼 클릭
</button>
```

### 트랜지션 (Transition)

#### 트랜지션 duration

```
┌─────────────────────────────────────────────┐
│ Duration │ Milliseconds │ Tailwind       │ 사용 │
├─────────────────────────────────────────────┤
│ Fast     │ 150ms       │ duration-150   │ 클릭 │
│ Normal   │ 300ms       │ duration-300   │ 호버 │
│ Slow     │ 500ms       │ duration-500   │ 모달 │
└─────────────────────────────────────────────┘
```

#### 트랜지션 timing function

```tsx
// ease-in (가속)
<div className="ease-in">

// ease-out (감속 - 권장)
<div className="ease-out duration-300">

// ease-in-out (가속 후 감속)
<div className="ease-in-out duration-300">

// ease-linear (일정한 속도)
<div className="ease-linear">
```

#### 트랜지션 property

```tsx
// 모든 속성 전환 (일반적)
<button className="transition-all duration-300 hover:bg-blue-600 hover:shadow-lg">

// 색상만 전환 (효율적)
<div className="transition-colors duration-300 hover:bg-gray-100">

// 투명도만 전환
<div className="transition-opacity duration-300">

// 그림자만 전환
<div className="transition-shadow duration-300 hover:shadow-lg">

// 변형만 전환
<div className="transition-transform duration-300 hover:scale-105">
```

### 변형 (Transform) 효과

#### Scale (확대/축소)

```tsx
// Hover Scale (호버 시 1.02배 확대)
<button className="hover:scale-102 transition-transform duration-300">

// Active Scale (클릭 시 0.98배 축소)
<button className="active:scale-98 transition-transform duration-150">

// Large Scale (큰 확대)
<button className="hover:scale-105 transition-transform duration-300">
```

#### Translate (이동)

```tsx
// Hover Up (호버 시 위로 4px)
<div className="hover:-translate-y-1 transition-transform duration-300">

// Hover Up Large (호버 시 위로 8px)
<div className="hover:-translate-y-2 transition-transform duration-300">

// Hover Down
<div className="hover:translate-y-1 transition-transform duration-300">

// Hover Side
<div className="hover:translate-x-2 transition-transform duration-300">
```

#### Rotate (회전)

```tsx
// Slight Rotate
<div className="rotate-2 hover:rotate-3 transition-transform duration-300">
```

### 배경 블러 (Backdrop Blur)

```tsx
// Modal Backdrop
<div className="
  fixed inset-0
  bg-gray-900/50 backdrop-blur-sm
  transition-opacity duration-300
" />

// Strong Blur
<div className="backdrop-blur-md">

// Light Blur
<div className="backdrop-blur-sm">
```

### 불투명도 (Opacity)

```tsx
// Disabled State
<button className="disabled:opacity-50 disabled:cursor-not-allowed">

// Overlay
<div className="bg-black/50">

// Subtle Text
<p className="opacity-75">
```

---

## 아이콘 시스템

### Lucide React 사용 가이드

Farm to Biz는 Lucide React 라이브러리를 사용합니다.

```bash
npm install lucide-react
```

#### 아이콘 임포트

```tsx
import {
  Home,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  Search,
  User,
  Settings,
  LogOut
} from 'lucide-react';
```

#### 아이콘 크기 표준

```
┌──────────────────────────────────────────────────┐
│ 크기 │ 픽셀 │ Tailwind  │ 사용 용도             │
├──────────────────────────────────────────────────┤
│ xs   │ 12px │ w-3 h-3   │ 작은 인디케이터      │
│ sm   │ 16px │ w-4 h-4   │ 버튼/폼 내 아이콘   │
│ md   │ 20px │ w-5 h-5   │ 일반 아이콘 (기본)   │
│ lg   │ 24px │ w-6 h-6   │ 네비게이션 아이콘   │
│ xl   │ 32px │ w-8 h-8   │ 큰 아이콘           │
│ 2xl  │ 48px │ w-12 h-12 │ 특별한 강조 아이콘   │
└──────────────────────────────────────────────────┘
```

#### 아이콘 사용 예시

```tsx
// 버튼 내 아이콘 (md: 20px)
<button className="flex items-center gap-2">
  <ShoppingCart size={20} />
  장바구니
</button>

// 내비게이션 아이콘 (lg: 24px)
<a href="/products" className="flex items-center gap-2 px-4 py-3">
  <Package size={24} />
  상품 관리
</a>

// 상태 표시 아이콘 (md: 20px)
<div className="flex items-center gap-2">
  <CheckCircle size={20} className="text-green-600" />
  <span>배송완료</span>
</div>

// 작은 인디케이터 (xs: 12px)
<span className="flex items-center gap-1">
  <AlertCircle size={12} />
  필수 항목
</span>
```

#### 아이콘 색상 적용

```tsx
// Primary 색상
<Home size={24} className="text-[#10B981]" />

// White
<Menu size={24} className="text-white" />

// Status 색상
<CheckCircle size={20} className="text-[#10B981]" />
<AlertCircle size={20} className="text-[#FBBF24]" />
<XCircle size={20} className="text-[#EF4444]" />

// Gray
<Settings size={24} className="text-[#6B7280]" />
```

#### 자주 사용하는 아이콘 목록

| 아이콘 | 사용처 | 크기 |
|--------|--------|------|
| `Home` | 대시보드 메뉴 | lg |
| `Package` | 상품/주문 관리 | lg |
| `ShoppingCart` | 장바구니 버튼 | md/lg |
| `Truck` | 배송 상태 | md |
| `CheckCircle` | 완료 상태 | md |
| `AlertCircle` | 경고/에러 | md |
| `Search` | 검색 입력 | md |
| `Menu` | 모바일 메뉴 | lg |
| `X` | 닫기 버튼 | md |
| `User` | 사용자 프로필 | lg |
| `Settings` | 설정 메뉴 | lg |
| `LogOut` | 로그아웃 | md |
| `ChevronRight` | 화살표/진행 | sm |
| `Filter` | 필터링 | md |
| `Download` | 다운로드 | md |
| `Upload` | 업로드 | md |

---

## 반응형 디자인 원칙

### Mobile First 접근

Farm to Biz는 **Mobile First** 디자인 철학을 따릅니다. 즉, 모바일 레이아웃을 먼저 설계하고, 더 큰 화면에 맞게 확장합니다.

#### 작성 순서

```tsx
// ❌ 잘못된 방법 (Desktop First)
<div className="
  lg:grid-cols-3
  md:grid-cols-2
  grid-cols-1
">

// ✅ 올바른 방법 (Mobile First)
<div className="
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
">
```

### 반응형 레이아웃 패턴

#### 스택 레이아웃 (Stack Layout)

```tsx
// 모바일: 세로 스택, 태블릿: 2열, 데스크톱: 3열
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>상품 카드 1</div>
  <div>상품 카드 2</div>
  <div>상품 카드 3</div>
</div>
```

#### Flex 레이아웃

```tsx
// 모바일: 세로, 데스크톱: 가로
<div className="flex flex-col lg:flex-row gap-4">
  <div className="w-full lg:w-1/4">사이드바</div>
  <div className="w-full lg:flex-1">메인 컨텐츠</div>
</div>
```

#### 숨김/표시

```tsx
// 모바일에서 숨김, 데스크톱에서 표시
<nav className="hidden lg:block">
  데스크톱 네비게이션
</nav>

// 데스크톱에서 숨김, 모바일에서 표시
<button className="lg:hidden">
  모바일 메뉴
</button>
```

### 반응형 타이포그래피

```tsx
// 화면 크기에 따라 폰트 크기 변경
<h1 className="
  text-xl              // 모바일: 20px
  sm:text-2xl          // 태블릿: 24px
  lg:text-3xl          // 데스크톱: 30px
  font-bold leading-tight
">
  주문 관리
</h1>

// 본문 텍스트
<p className="
  text-sm              // 모바일: 14px
  lg:text-base         // 데스크톱: 16px
">
  주문 내용입니다.
</p>
```

### 반응형 간격

```tsx
// 패딩
<div className="
  p-4                  // 모바일: 16px
  lg:p-8               // 데스크톱: 32px
">

// 마진
<div className="
  mt-4 mb-6           // 모바일
  lg:mt-8 lg:mb-12    // 데스크톱
">

// Gap
<div className="
  grid gap-4          // 모바일: 16px
  lg:gap-8            // 데스크톱: 32px
">
```

### 반응형 너비

```tsx
// 전체 너비에서 최대 너비로
<div className="
  w-full              // 모바일: 100%
  max-w-lg            // 최대 너비: 1024px
  mx-auto             // 가로 중앙정렬
">

// 사이드바 + 메인 레이아웃
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="w-full lg:w-64">
    사이드바
  </aside>
  <main className="w-full lg:flex-1">
    메인 컨텐츠
  </main>
</div>
```

### 반응형 이미지

```tsx
// 반응형 이미지
<img
  src="/product.jpg"
  alt="상품"
  className="
    w-full h-auto
    rounded-lg
  "
/>

// 반응형 배경 이미지
<div className="
  bg-cover bg-center
  h-64 lg:h-96
" style={{
  backgroundImage: 'url(/hero.jpg)'
}}>
</div>
```

### 모바일 환경 최적화

```tsx
// 모바일 터치 영역 (최소 44x44px)
<button className="p-2.5 min-h-[44px] min-w-[44px]">
  버튼
</button>

// 모바일 폰트 크기 최소값
<p className="text-sm lg:text-base">
  최소 14px 이상
</p>

// 모바일에서 전체 너비 사용
<input className="
  w-full
  px-4 py-2.5
" />
```

### 특정 브레이크포인트 예시

#### Dashboard Layout

```tsx
// 데스크톱: 3열, 태블릿: 2열, 모바일: 1열
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <DashboardCard />
  <DashboardCard />
  <DashboardCard />
</div>
```

#### Product Table

```tsx
// 모바일에서는 카드 형식, 데스크톱에서는 테이블
<div className="lg:hidden">
  {/* 모바일 카드 레이아웃 */}
</div>

<div className="hidden lg:block overflow-x-auto">
  {/* 데스크톱 테이블 레이아웃 */}
</div>
```

#### Form Layout

```tsx
// 모바일: 1열, 데스크톱: 2열
<form className="space-y-4">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <input placeholder="이름" />
    <input placeholder="이메일" />
  </div>
</form>
```

---

## 요약 및 체크리스트

### 색상 시스템 체크리스트

- [ ] Primary Color (#10B981)는 모든 CTA 버튼에 사용
- [ ] Secondary Color (#FBBF24)는 경고/대기 상태에만 사용
- [ ] Danger Color (#EF4444)는 삭제/오류에만 사용
- [ ] Status 색상이 일관되게 사용됨
- [ ] 충분한 색상 대비 유지 (WCAG AA 이상)

### 타이포그래피 체크리스트

- [ ] Pretendard Variable 폰트 적용
- [ ] 제목은 font-bold, 본문은 font-normal 사용
- [ ] 폰트 크기 계층이 일관됨
- [ ] 행간이 가독성을 고려해 설정됨

### 레이아웃 체크리스트

- [ ] Mobile First 접근 방식 적용
- [ ] 모든 브레이크포인트 테스트 완료
- [ ] 모바일, 태블릿, 데스크톱에서 레이아웃 확인
- [ ] 컨테이너 최대 너비 준수

### 컴포넌트 체크리스트

- [ ] 모든 버튼의 hover/focus/active 상태 구현
- [ ] 폼 입력의 포커스 링 적용
- [ ] 카드의 호버 효과 구현
- [ ] 모달의 백드롭 블러 적용

### 인터랙션 체크리스트

- [ ] 트랜지션 duration-300 사용
- [ ] 호버 상태에 그림자 및 변형 효과 적용
- [ ] 포커스 상태가 명확하게 표시됨
- [ ] 애니메이션이 부자연스럽지 않음

### 반응형 체크리스트

- [ ] 모바일 (< 640px) 테스트
- [ ] 태블릿 (640px ~ 1024px) 테스트
- [ ] 데스크톱 (> 1024px) 테스트
- [ ] 터치 영역 최소 44x44px 확보
- [ ] 텍스트 크기 최소 14px 이상

---

## 참고 자료

### 관련 파일

- **색상 토큰**: `01-design-tokens/colors.json`
- **타이포그래피 토큰**: `01-design-tokens/typography.json`
- **간격 토큰**: `01-design-tokens/spacing.json`
- **그림자 & 효과**: `01-design-tokens/shadows.json`
- **컴포넌트 명세**: `02-components/*/spec.md`
- **컴포넌트 코드**: `02-components/*/code.tsx`

### 외부 링크

- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [Lucide React 아이콘](https://lucide.dev/)
- [Pretendard Variable 폰트](https://github.com/orioncactus/pretendard)

---

**작성자**: Claude Code
**버전**: 1.0.0
**최종 수정**: 2024-12-04

농수산물 B2B 도매 플랫폼 Farm to Biz의 완벽한 디자인 시스템을 구축하기 위해 이 명세서를 항상 참고하시기 바랍니다.
