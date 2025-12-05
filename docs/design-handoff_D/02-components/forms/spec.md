# 폼 컴포넌트 명세서

**버전**: 1.0.0
**작성일**: 2024-12-04
**마지막 수정**: 2024-12-04
**상태**: 최종

---

## 목차

1. [개요](#개요)
2. [컴포넌트](#컴포넌트)
3. [공통 스타일](#공통-스타일)
4. [Input (텍스트 입력)](#input-텍스트-입력)
5. [Select (선택)](#select-선택)
6. [Textarea (텍스트 영역)](#textarea-텍스트-영역)
7. [Checkbox (체크박스)](#checkbox-체크박스)
8. [Radio Button (라디오 버튼)](#radio-button-라디오-버튼)
9. [Label (라벨)](#label-라벨)
10. [Props Interface](#props-interface)
11. [사용 예시](#사용-예시)

---

## 개요

Farm to Biz 폼 컴포넌트는 사용자 입력을 받기 위한 기본 UI 요소들입니다. 모든 폼 요소는 일관된 스타일과 동작을 유지하며, 접근성 표준을 준수합니다.

### 특징

- **일관된 디자인**: 모든 폼 요소가 동일한 디자인 언어 사용
- **명확한 상태 표시**: Default, Focus, Error, Disabled 상태 구분
- **포커스 링**: 모든 요소에 green focus ring 적용 (ring-2 ring-[#10B981])
- **에러 처리**: 에러 상태에 빨간 테두리와 에러 메시지 표시
- **반응형**: 모바일부터 데스크톱까지 최적화된 크기
- **접근성**: WCAG AA 기준 준수

---

## 컴포넌트

### 구성 컴포넌트 목록

| 컴포넌트 | 용도 | 예시 |
|---------|------|------|
| Input | 텍스트, 숫자, 이메일 입력 | 상품명, 가격, 이메일 |
| Select | 드롭다운 선택 | 카테고리, 상태 선택 |
| Textarea | 여러 줄 텍스트 입력 | 설명, 메모 |
| Checkbox | 다중 선택 | 동의, 기능 활성화 |
| Radio | 단일 선택 | 배송 방법, 결제 수단 |
| Label | 입력 필드 라벨 | 필드 설명, 필수 표시 |

---

## 공통 스타일

### 배경색

| 상태 | 색상 | 16진수 |
|------|------|--------|
| Default | 흰색 | #FFFFFF |
| Disabled | 밝은 회색 | #F3F4F6 |

### 테두리

| 상태 | 색상 | 16진수 | 스타일 |
|------|------|--------|--------|
| Default | 회색 | #D1D5DB | border-1 |
| Focus | 초록색 | #10B981 | border-1 |
| Error | 빨간색 | #EF4444 | border-2 |
| Disabled | 연한 회색 | #D1D5DB | border-1 |

### 포커스 링 (Focus Ring)

모든 폼 요소는 포커스 상태에서 다음 스타일 적용:

```
ring-2           // 2px 링 두께
ring-[#10B981]   // 초록색 (#10B981)
ring-offset-0    // 옵션: 바깥 여백 (0~2px)
```

### 간격

| 항목 | 값 | Tailwind |
|------|-----|----------|
| 입력 패딩 (X) | 16px | px-4 |
| 입력 패딩 (Y) | 10px | py-2.5 |
| 라벨 마진 하단 | 8px | mb-2 |
| 필드 간격 | 16px | gap-4 |
| 섹션 간격 | 32px | gap-8 |

### 글꼴

| 항목 | 크기 | 굵기 | Tailwind |
|------|------|------|----------|
| Label | 14px | Medium (500) | text-sm font-medium |
| Input | 16px | Normal (400) | text-base font-normal |
| Helper Text | 12px | Normal (400) | text-xs text-gray-500 |
| Error Message | 12px | Normal (400) | text-xs text-red-500 |

### 모양 (Border Radius)

| 요소 | 반지름 | Tailwind |
|------|--------|----------|
| Input, Select, Textarea | 8px | rounded-lg |
| Checkbox, Radio | 4px (checkbox), 원형 (radio) | rounded-md (checkbox), rounded-full (radio) |

---

## Input (텍스트 입력)

### 설명

다양한 종류의 텍스트 입력 필드 (텍스트, 숫자, 이메일, 비밀번호 등)

### 크기 변형

#### 크기: Small

```
- 높이: 32px (py-1.5)
- 패딩: px-3
- 폰트: text-sm (14px)
- 사용처: 컴팩트한 폼
```

#### 크기: Medium (기본)

```
- 높이: 40px (py-2.5)
- 패딩: px-4
- 폰트: text-base (16px)
- 사용처: 표준 폼
```

#### 크기: Large

```
- 높이: 48px (py-3)
- 패딩: px-4
- 폰트: text-lg (18px)
- 사용처: 모바일, 강조 폼
```

### 상태

#### Default State

```
배경: #FFFFFF (bg-white)
테두리: #D1D5DB (border border-gray-300)
텍스트: #111827 (text-gray-900)
플레이스홀더: #9CA3AF (placeholder:text-gray-400)
```

Tailwind:
```tsx
className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 placeholder:text-gray-400"
```

#### Focus State

```
배경: #FFFFFF (bg-white)
테두리: #D1D5DB (border border-gray-300) - 변화 없음
포커스 링: ring-2 ring-[#10B981] (초록색)
아웃라인: outline-none
```

Tailwind:
```tsx
className="... focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0"
```

#### Error State

```
배경: #FFFFFF (bg-white)
테두리: #EF4444 (border-2 border-red-500)
텍스트: #111827 (text-gray-900)
포커스 링: ring-2 ring-[#EF4444] (빨간색)
에러 메시지: #EF4444 (text-red-500) text-xs
```

Tailwind:
```tsx
className="... border-2 border-red-500 focus:ring-2 focus:ring-[#EF4444]"
```

#### Disabled State

```
배경: #F3F4F6 (bg-gray-100)
테두리: #D1D5DB (border border-gray-300)
텍스트: #D1D5DB (text-gray-300)
커서: not-allowed
```

Tailwind:
```tsx
className="... disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
```

### 시각적 표현

```
┌─────────────────────────────────────────┐
│ Default State                           │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 상품명을 입력하세요          [X]  │ │  ← 입력 필드
│ └─────────────────────────────────────┘ │
│ 상품명은 최대 100자입니다.             │  ← Helper Text
├─────────────────────────────────────────┤
│ Focus State                             │
├─────────────────────────────────────────┤
│ ╔═════════════════════════════════════╗ │
│ ║ 상품명을 입력하세요                 ║ │  ← 초록색 포커스 링
│ ╚═════════════════════════════════════╝ │
├─────────────────────────────────────────┤
│ Error State                             │
├─────────────────────────────────────────┤
│ ╔═════════════════════════════════════╗ │
│ ║ 입력한 내용이                       ║ │  ← 빨간색 테두리 (border-2)
│ ╚═════════════════════════════════════╝ │
│ 입력값이 유효하지 않습니다.           │  ← 빨간색 에러 메시지
├─────────────────────────────────────────┤
│ Disabled State                          │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 입력 불가능 [회색 배경]            │ │  ← 회색 처리
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Select (선택)

### 설명

드롭다운 목록에서 단일 항목을 선택하는 필드

### 상태

#### Default State

```
배경: #FFFFFF (bg-white)
테두리: #D1D5DB (border border-gray-300)
텍스트: #111827 (text-gray-900)
화살표: #6B7280 (회색)
```

Tailwind:
```tsx
className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 bg-white appearance-none cursor-pointer"
```

#### Focus State

```
테두리: #D1D5DB (변화 없음)
포커스 링: ring-2 ring-[#10B981] (초록색)
배경: #FFFFFF (bg-white)
```

Tailwind:
```tsx
className="... focus:outline-none focus:ring-2 focus:ring-[#10B981]"
```

#### Error State

```
테두리: #EF4444 (border-2 border-red-500)
포커스 링: ring-2 ring-[#EF4444] (빨간색)
```

Tailwind:
```tsx
className="... border-2 border-red-500 focus:ring-2 focus:ring-[#EF4444]"
```

#### Disabled State

```
배경: #F3F4F6 (bg-gray-100)
텍스트: #D1D5DB (text-gray-300)
커서: not-allowed
```

Tailwind:
```tsx
className="... disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
```

### 시각적 표현

```
┌─────────────────────────────────────┐
│ 카테고리 (라벨)                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 선택하세요                   ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Focus State:                        │
│ ╔═════════════════════════════════╗ │
│ ║ 신선 과일                    ▼ ║ │
│ ╚═════════════════════════════════╝ │
└─────────────────────────────────────┘
```

---

## Textarea (텍스트 영역)

### 설명

여러 줄의 텍스트를 입력하는 필드

### 크기

#### 크기: Small

```
높이: 80px (h-20)
```

#### 크기: Medium (기본)

```
높이: 120px (h-30)
```

#### 크기: Large

```
높이: 160px (h-40)
```

### 상태

#### Default State

```
배경: #FFFFFF (bg-white)
테두리: #D1D5DB (border border-gray-300)
텍스트: #111827 (text-gray-900)
플레이스홀더: #9CA3AF (placeholder:text-gray-400)
resize: vertical (세로 크기 조정만 가능)
```

Tailwind:
```tsx
className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 placeholder:text-gray-400 resize-vertical"
```

#### Focus State

```
포커스 링: ring-2 ring-[#10B981] (초록색)
```

Tailwind:
```tsx
className="... focus:outline-none focus:ring-2 focus:ring-[#10B981]"
```

#### Error State

```
테두리: #EF4444 (border-2 border-red-500)
포커스 링: ring-2 ring-[#EF4444] (빨간색)
```

Tailwind:
```tsx
className="... border-2 border-red-500 focus:ring-2 focus:ring-[#EF4444]"
```

#### Disabled State

```
배경: #F3F4F6 (bg-gray-100)
텍스트: #D1D5DB (text-gray-300)
커서: not-allowed
```

Tailwind:
```tsx
className="... disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
```

### 시각적 표현

```
┌─────────────────────────────────────┐
│ 설명 (라벨)                         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 상품에 대한 상세 설명을         │ │
│ │ 입력해주세요...                 │ │
│ │                                 │ │
│ │                                 │ │
│ │                          [resize]│ │
│ └─────────────────────────────────┘ │
│ 최대 500자까지 입력 가능합니다.     │
└─────────────────────────────────────┘
```

---

## Checkbox (체크박스)

### 설명

다중 선택이 가능한 체크 박스 요소

### 크기

| 크기 | 너비/높이 | Tailwind |
|------|-----------|----------|
| Small | 16px | w-4 h-4 |
| Medium (기본) | 20px | w-5 h-5 |
| Large | 24px | w-6 h-6 |

### 상태

#### Unchecked (미선택)

```
배경: #FFFFFF (bg-white)
테두리: #D1D5DB (border border-gray-300)
테두리 두께: 1px
```

Tailwind:
```tsx
className="w-5 h-5 border border-gray-300 rounded-md"
```

#### Checked (선택됨)

```
배경: #10B981 (bg-emerald-500)
테두리: #10B981 (border border-emerald-500)
체크 아이콘: 흰색 (#FFFFFF)
```

Tailwind:
```tsx
className="w-5 h-5 bg-emerald-500 border border-emerald-500 rounded-md"
```

#### Focus State (미선택)

```
포커스 링: ring-2 ring-[#10B981]
```

Tailwind:
```tsx
className="... focus:ring-2 focus:ring-[#10B981]"
```

#### Disabled State

```
배경: #F3F4F6 (bg-gray-100)
테두리: #D1D5DB (border-gray-300)
텍스트: #9CA3AF (text-gray-400)
커서: not-allowed
```

Tailwind:
```tsx
className="... disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed"
```

### 레이아웃

```
┌─────────────────────────────────────┐
│ ☑ 이용약관에 동의합니다             │  ← Checked
│                                     │
│ ☐ 뉴스레터 구독                     │  ← Unchecked
│                                     │
│ ☐ 마케팅 이메일 수신 동의 (비활성) │  ← Disabled
└─────────────────────────────────────┘
```

---

## Radio Button (라디오 버튼)

### 설명

동일 그룹 내에서 단 하나만 선택 가능한 라디오 버튼

### 크기

| 크기 | 너비/높이 | Tailwind |
|------|-----------|----------|
| Small | 16px | w-4 h-4 |
| Medium (기본) | 20px | w-5 h-5 |
| Large | 24px | w-6 h-6 |

### 상태

#### Unchecked (미선택)

```
배경: #FFFFFF (bg-white)
테두리: #D1D5DB (border border-gray-300)
테두리 두께: 1px
```

Tailwind:
```tsx
className="w-5 h-5 border border-gray-300 rounded-full"
```

#### Checked (선택됨)

```
배경: #FFFFFF (bg-white)
테두리: #10B981 (border-2 border-emerald-500)
내부 원: #10B981 (bg-emerald-500) - 약 8px 지름
```

Tailwind:
```tsx
className="w-5 h-5 border-2 border-emerald-500 rounded-full"
```

#### Focus State

```
포커스 링: ring-2 ring-[#10B981]
```

Tailwind:
```tsx
className="... focus:ring-2 focus:ring-[#10B981]"
```

#### Disabled State

```
배경: #F3F4F6 (bg-gray-100)
테두리: #D1D5DB (border-gray-300)
텍스트: #9CA3AF (text-gray-400)
커서: not-allowed
```

Tailwind:
```tsx
className="... disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed"
```

### 레이아웃

```
배송 방법
┌─────────────────────────────────────┐
│ ◯ 기본 배송 (무료) - 3~5일 소요     │  ← Unchecked
│                                     │
│ ◉ 우선 배송 (5,000원) - 1~2일 소요 │  ← Checked
│                                     │
│ ◯ 당일 배송 (10,000원)              │  ← Unchecked
│                                     │
│ ◯ 불가능 배송 방식                 │  ← Disabled
└─────────────────────────────────────┘
```

---

## Label (라벨)

### 설명

입력 필드에 대한 설명이나 제목을 제공하는 라벨

### 스타일

#### 기본 라벨

```
폰트 크기: 14px (text-sm)
폰트 굵기: Medium (font-medium = 500)
색상: #111827 (text-gray-900)
마진 하단: 8px (mb-2)
```

Tailwind:
```tsx
className="text-sm font-medium text-gray-900 mb-2"
```

#### 필수 표시 있는 라벨

```
라벨 텍스트 뒤에 빨간색 별표 (*)
색상: #EF4444 (text-red-500)
```

HTML 예시:
```tsx
<label className="text-sm font-medium text-gray-900 mb-2">
  상품명
  <span className="text-red-500"> *</span>
</label>
```

#### 비활성 라벨

```
색상: #9CA3AF (text-gray-400)
```

Tailwind:
```tsx
className="text-sm font-medium text-gray-400"
```

### 시각적 표현

```
기본:
상품명

필수 입력:
상품명 *

선택 입력:
상품명 (선택사항)

비활성:
상품명
```

---

## Props Interface

### Input Component

```typescript
interface InputProps {
  // 기본 속성
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'time';
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  // 스타일
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';

  // 상태
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;

  // 라벨
  label?: string;
  required?: boolean;
  helperText?: string;

  // 기타
  id?: string;
  name?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  className?: string;
}
```

### Select Component

```typescript
interface SelectProps {
  // 기본 속성
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;

  // 옵션
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;

  // 스타일
  size?: 'sm' | 'md' | 'lg';

  // 상태
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;

  // 라벨
  label?: string;
  required?: boolean;
  helperText?: string;

  // 기타
  id?: string;
  name?: string;
  className?: string;
}
```

### Textarea Component

```typescript
interface TextareaProps {
  // 기본 속성
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;

  // 스타일
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
  cols?: number;

  // 상태
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  resizable?: boolean;

  // 라벨
  label?: string;
  required?: boolean;
  helperText?: string;
  characterLimit?: number;

  // 기타
  id?: string;
  name?: string;
  maxLength?: number;
  minLength?: number;
  className?: string;
}
```

### Checkbox Component

```typescript
interface CheckboxProps {
  // 기본 속성
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  // 스타일
  size?: 'sm' | 'md' | 'lg';

  // 상태
  disabled?: boolean;
  indeterminate?: boolean;

  // 라벨
  label?: string;
  description?: string;
  required?: boolean;

  // 기타
  id?: string;
  name?: string;
  value?: string;
  className?: string;
}
```

### Radio Component

```typescript
interface RadioProps {
  // 기본 속성
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;

  // 스타일
  size?: 'sm' | 'md' | 'lg';

  // 상태
  disabled?: boolean;

  // 라벨
  label?: string;
  description?: string;
  required?: boolean;

  // 기타
  id?: string;
  name?: string;
  value: string;
  className?: string;
}

interface RadioGroupProps {
  // 그룹 속성
  name: string;
  value?: string;
  onChange?: (value: string) => void;

  // 스타일
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';

  // 상태
  disabled?: boolean;

  // 라벨
  label?: string;
  required?: boolean;
  helperText?: string;

  // 옵션
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;

  className?: string;
}
```

### Label Component

```typescript
interface LabelProps {
  // 콘텐츠
  children: React.ReactNode;

  // 속성
  htmlFor?: string;

  // 상태
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;

  className?: string;
}
```

---

## 사용 예시

### Input 기본 사용

```tsx
<div className="space-y-2">
  <Label htmlFor="productName" required>
    상품명
  </Label>
  <Input
    id="productName"
    type="text"
    placeholder="상품명을 입력하세요"
    size="md"
    helperText="상품명은 최대 100자입니다."
  />
</div>
```

### Select 사용

```tsx
<div className="space-y-2">
  <Label htmlFor="category" required>
    카테고리
  </Label>
  <Select
    id="category"
    options={[
      { value: '', label: '선택하세요' },
      { value: 'fruit', label: '신선 과일' },
      { value: 'vegetable', label: '신선 채소' },
      { value: 'grain', label: '곡류' },
    ]}
    helperText="상품의 카테고리를 선택해주세요."
  />
</div>
```

### Textarea 사용

```tsx
<div className="space-y-2">
  <Label htmlFor="description">
    상품 설명
  </Label>
  <Textarea
    id="description"
    placeholder="상품에 대한 상세 설명을 입력해주세요"
    size="md"
    helperText="최대 500자까지 입력 가능합니다."
    characterLimit={500}
  />
</div>
```

### Checkbox 사용

```tsx
<div className="space-y-3">
  <Checkbox
    id="agree"
    label="이용약관에 동의합니다"
    required
  />
  <Checkbox
    id="newsletter"
    label="뉴스레터 구독"
  />
</div>
```

### Radio 사용

```tsx
<RadioGroup
  name="shipping"
  label="배송 방법"
  required
  options={[
    {
      value: 'standard',
      label: '기본 배송 (무료)',
      description: '3~5일 소요'
    },
    {
      value: 'express',
      label: '우선 배송 (5,000원)',
      description: '1~2일 소요'
    },
    {
      value: 'same-day',
      label: '당일 배송 (10,000원)',
      description: '오늘 배송 (12시까지 주문시)'
    },
  ]}
  helperText="배송 방법을 선택해주세요."
/>
```

### Error 상태 예시

```tsx
<div className="space-y-2">
  <Label htmlFor="price" required>
    가격
  </Label>
  <Input
    id="price"
    type="number"
    placeholder="가격을 입력하세요"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    error={price < 0}
    errorMessage="가격은 0 이상이어야 합니다."
  />
</div>
```

### 폼 전체 예시

```tsx
<form className="space-y-6">
  {/* 상품명 */}
  <div className="space-y-2">
    <Label htmlFor="name" required>
      상품명
    </Label>
    <Input
      id="name"
      type="text"
      placeholder="상품명을 입력하세요"
      size="md"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      error={errors.name}
      errorMessage={errors.name ? "상품명은 필수입니다." : ""}
    />
  </div>

  {/* 카테고리 */}
  <div className="space-y-2">
    <Label htmlFor="category" required>
      카테고리
    </Label>
    <Select
      id="category"
      value={formData.category}
      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      options={categories}
      error={errors.category}
      errorMessage={errors.category ? "카테고리를 선택해주세요." : ""}
    />
  </div>

  {/* 설명 */}
  <div className="space-y-2">
    <Label htmlFor="description">
      설명
    </Label>
    <Textarea
      id="description"
      placeholder="상품 설명을 입력해주세요"
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      helperText="최대 500자"
      characterLimit={500}
    />
  </div>

  {/* 배송 방법 */}
  <div className="space-y-3">
    <Label required>배송 방법</Label>
    <RadioGroup
      name="shipping"
      value={formData.shipping}
      onChange={(value) => setFormData({ ...formData, shipping: value })}
      options={[
        { value: 'standard', label: '기본 배송' },
        { value: 'express', label: '우선 배송' },
      ]}
    />
  </div>

  {/* 약관 동의 */}
  <div className="space-y-3">
    <Checkbox
      id="agree"
      label="이용약관에 동의합니다"
      required
      checked={formData.agree}
      onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
      error={errors.agree}
    />
  </div>

  {/* 버튼 */}
  <div className="flex gap-3 pt-6">
    <button className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200">
      취소
    </button>
    <button className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600">
      등록
    </button>
  </div>
</form>
```

---

## 색상 참조표

### 주요 색상

| 용도 | 색상명 | 16진수 | Tailwind |
|------|--------|--------|----------|
| Primary (포커스) | 초록색 | #10B981 | emerald-500 |
| Primary Hover | 진한 초록색 | #059669 | emerald-600 |
| Border | 회색 | #D1D5DB | gray-300 |
| Background | 흰색 | #FFFFFF | white |
| Disabled BG | 밝은 회색 | #F3F4F6 | gray-100 |
| Text | 검정 | #111827 | gray-900 |
| Text Secondary | 회색 | #6B7280 | gray-600 |
| Text Tertiary | 연한 회색 | #9CA3AF | gray-400 |
| Error | 빨간색 | #EF4444 | red-500 |

---

## 접근성 지침

1. **라벨 연결**: 모든 입력 필드는 `<label htmlFor>` 속성으로 연결
2. **포커스 표시**: 모든 요소는 포커스 시 명확한 포커스 링 표시
3. **에러 메시지**: ARIA 속성으로 에러 메시지 연결 (`aria-describedby`)
4. **필수 표시**: 필수 필드는 라벨에 별표(*) 표시
5. **색상 대비**: WCAG AA 기준 (최소 4.5:1) 충족
6. **키보드 네비게이션**: Tab 키로 모든 요소 접근 가능

---

**작성자**: Claude Code
**버전**: 1.0.0
**최종 수정**: 2024-12-04
