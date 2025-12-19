# 디자인 시스템 참고 가이드 (Design System Reference)

**작성일**: 2024-12-04  
**프로젝트**: FarmToBiz  
**디자인 시스템**: Farm to Biz

---

## 🎨 색상 시스템 (Color System)

### Primary 색상

```css
--primary: #10b981; /* Emerald Green */
```

**사용 방법**:

- Tailwind 클래스: `bg-[#10B981]`, `text-[#10B981]`, `border-[#10B981]`
- CSS 변수: `var(--primary)`
- Emerald 계열: `bg-emerald-500`, `text-emerald-600`, `bg-emerald-100` 등

### 색상 팔레트

#### Green 계열 (Primary)

- `#10B981` - Primary Green (메인 색상)
- `#059669` - Dark Green (호버 상태)
- `#34D399` - Light Green (배경/강조)
- `bg-emerald-50` - 매우 연한 배경
- `bg-emerald-100` - 연한 배경
- `bg-emerald-500` - 기본 색상
- `bg-emerald-600` - 진한 색상
- `bg-emerald-700` - 매우 진한 색상

#### Gray 계열 (Neutral)

- `text-gray-600` - 보조 텍스트
- `text-gray-700` - 일반 텍스트
- `text-gray-900` - 강조 텍스트
- `bg-gray-50` - 연한 배경
- `bg-gray-100` - 배경
- `border-gray-200` - 테두리

### 색상 사용 가이드

#### 버튼

```tsx
// Primary 버튼
<Button className="bg-[#10B981] hover:bg-[#059669] text-white">
  확인
</Button>

// Secondary 버튼
<Button className="bg-emerald-50 text-[#10B981] hover:bg-emerald-100">
  취소
</Button>
```

#### 배지 (Badge)

```tsx
// 활성 상태
<span className="bg-emerald-100 text-emerald-700 border border-emerald-200">
  활성
</span>

// 비활성 상태
<span className="bg-gray-100 text-gray-600 border border-gray-200">
  비활성
</span>
```

#### 아이콘

```tsx
// Primary 아이콘
<Icon className="w-6 h-6 text-[#10B981]" />

// Secondary 아이콘
<Icon className="w-6 h-6 text-emerald-600" />
```

---

## 🔤 타이포그래피 (Typography)

### 폰트

**기본 폰트**: Pretendard Variable

```css
--font-sans: "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui,
  Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
```

**CDN**:

```html
@import
url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css");
```

### 폰트 크기 및 스타일

#### 제목 (Headings)

```tsx
// H1
<h1 className="text-4xl font-bold text-gray-900">제목</h1>

// H2
<h2 className="text-3xl font-bold text-gray-900">부제목</h2>

// H3
<h3 className="text-2xl font-semibold text-gray-900">소제목</h3>
```

#### 본문 (Body)

```tsx
// 큰 본문
<p className="text-lg text-gray-700">본문 텍스트</p>

// 일반 본문
<p className="text-base text-gray-700">일반 텍스트</p>

// 작은 본문
<p className="text-sm text-gray-600">작은 텍스트</p>
```

#### 강조 텍스트

```tsx
// 굵게
<span className="font-bold text-gray-900">강조</span>

// 세미볼드
<span className="font-semibold text-gray-800">중간 강조</span>
```

---

## 🎯 컴포넌트 스타일 가이드

### 버튼 (Button)

#### 기본 스타일

- **Border Radius**: `rounded-xl` (12px)
- **Primary 색상**: `bg-[#10B981]`
- **호버 색상**: `hover:bg-[#059669]`
- **호버 효과**: `hover:-translate-y-0.5`, `hover:shadow-lg`
- **액티브 효과**: `active:scale-98`
- **트랜지션**: `transition-all duration-300`

```tsx
<Button className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-98">
  버튼
</Button>
```

### 카드 (Card)

#### 기본 스타일

- **Border Radius**: `rounded-2xl` (16px) 또는 `rounded-3xl` (24px)
- **그림자**: `shadow-md`, `hover:shadow-xl`
- **호버 효과**: `hover:-translate-y-1`
- **트랜지션**: `transition-all duration-300`

```tsx
<Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
  카드 내용
</Card>
```

### 입력 필드 (Input)

#### 기본 스타일

- **Border Radius**: `rounded-xl` (12px)
- **포커스 링**: `focus:ring-[#10B981]`
- **트랜지션**: `transition-colors duration-150`

```tsx
<Input className="rounded-xl focus:ring-[#10B981] transition-colors duration-150" />
```

### 모달 (Modal/Dialog)

#### 기본 스타일

- **Border Radius**: `rounded-2xl` (16px)
- **백드롭**: `backdrop-blur-sm`

```tsx
<DialogContent className="rounded-2xl">모달 내용</DialogContent>
```

---

## 📐 Spacing 시스템

### 표준 Spacing 값

```tsx
// 컴포넌트 내부 패딩
<div className="p-4 md:p-6">내용</div>

// 섹션 간격
<section className="py-8 md:py-12">섹션</section>

// 요소 간격 (세로)
<div className="flex flex-col gap-4">요소들</div>

// 요소 간격 (가로)
<div className="flex gap-4">요소들</div>
```

### Spacing 규칙

1. **외곽 여백**: 최상단 래퍼의 `padding` 사용
2. **형제 요소 간격**: 부모의 `gap` 사용
3. **반응형**: 모바일에서 작게, 데스크톱에서 크게

---

## 🎭 애니메이션 및 효과

### 트랜지션

```tsx
// 기본 트랜지션
<div className="transition-all duration-300">요소</div>

// 색상 트랜지션
<div className="transition-colors duration-150">요소</div>

// 변환 트랜지션
<div className="transition-transform duration-200">요소</div>
```

### 호버 효과

```tsx
// 버튼 호버
<button className="hover:-translate-y-0.5 hover:shadow-lg">버튼</button>

// 카드 호버
<div className="hover:-translate-y-1 hover:shadow-xl">카드</div>

// 아이콘 호버
<Icon className="group-hover:scale-110 transition-transform" />
```

---

## 🚫 사용 금지 사항

### 색상

- ❌ `bg-blue-*`, `text-blue-*`, `border-blue-*` (Blue 계열 클래스)
- ❌ 하드코딩된 Blue 색상 코드 (`#137fec` 등)

### 폰트

- ❌ Geist 폰트 사용
- ❌ 시스템 기본 폰트만 사용 (Pretendard 없이)

### 스타일링

- ❌ 인라인 `style` 속성 사용 (Tailwind 클래스 사용)
- ❌ `margin`을 통한 형제 요소 간격 조정 (`gap` 사용)

---

## ✅ 체크리스트

새로운 컴포넌트를 만들 때 확인할 사항:

- [ ] Primary 색상으로 `#10B981` 사용
- [ ] Pretendard Variable 폰트 적용 확인
- [ ] Blue 계열 클래스 사용하지 않음
- [ ] 적절한 Border Radius 적용 (`rounded-xl`, `rounded-2xl`)
- [ ] 호버 효과 및 트랜지션 추가
- [ ] 반응형 디자인 적용
- [ ] Spacing-First 정책 준수 (padding + gap)

---

## 📚 참고 자료

- **디자인 시스템 명세서**: `docs/design-handoff_D/00-guides/DESIGN_SYSTEM.md`
- **개발자 가이드**: `docs/design-handoff_D/00-guides/DEVELOPER_GUIDE.md`
- **디자인 토큰**: `docs/design-handoff_D/01-design-tokens/`
- **디자인 변경 이력**: `docs/DESIGN_MIGRATION_HISTORY.md`

---

**최종 업데이트**: 2024-12-04
