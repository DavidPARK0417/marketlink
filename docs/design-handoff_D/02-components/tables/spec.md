# Table Component 명세서

**버전**: 1.0.0
**작성일**: 2024-12-04
**마지막 수정**: 2024-12-04
**상태**: 최종

---

## 목차

1. [개요](#개요)
2. [Table 구조](#table-구조)
3. [상태 (States)](#상태-states)
4. [반응형 동작](#반응형-동작)
5. [정렬 (Sorting)](#정렬-sorting)
6. [페이지네이션 (Pagination)](#페이지네이션-pagination)
7. [Props 정의](#props-정의)
8. [스타일 명세](#스타일-명세)
9. [사용 예시](#사용-예시)

---

## 개요

Table 컴포넌트는 구조화된 데이터를 표 형태로 표시하는 필수 UI 요소입니다. Farm to Biz 도매 플랫폼에서는 상품 목록, 주문 내역, 거래처 정보 등 다양한 데이터를 효율적으로 표현합니다.

### 특징

- **데스크톱 최적화**: 명확한 헤더와 구조화된 행 (row) 표시
- **모바일 반응형**: 카드 레이아웃으로 자동 전환 (모바일: 카드, 데스크톱: 테이블)
- **행 호버 효과**: 데스크톱에서 행 호버 시 강조 표시
- **정렬 기능**: 클릭 가능한 헤더로 데이터 정렬
- **페이지네이션**: 대량 데이터 관리 위한 페이지 기능
- **액션 버튼**: 각 행에 편집, 삭제 등 액션 버튼 포함
- **선택 기능**: 체크박스를 이용한 다중 행 선택
- **반응형 간격**: 모바일과 데스크톱의 일관된 여백 관리

---

## Table 구조

### 1. Header (테이블 헤더)

테이블의 최상단에 위치하며 각 컬럼의 제목과 정렬 기능을 제공합니다.

**구성 요소:**
- 컬럼 제목 (Column Name)
- 정렬 아이콘 (Sort Icon)
- 필터링 기능 (선택사항)
- 전체 선택 체크박스 (선택사항)

**스타일 특성:**
- 배경색: #F9FAFB (매우 밝은 회색)
- 텍스트 색상: #111827 (진한 회색/검정)
- 폰트: 12px (text-xs), semibold (font-semibold)
- 패딩: px-4 py-3 (모바일), lg:px-6 lg:py-4 (데스크톱)
- 테두리: border-b border-gray-200

**상태:**
- Default: 기본 배경색
- Hover (데스크톱만): 배경색 변경 (#F3F4F6)
- Sorting: 정렬 아이콘 표시 및 색상 변경 (#10B981)

---

### 2. Body (테이블 본문)

헤더 아래에 위치하며 실제 데이터가 표시되는 영역입니다.

**구성 요소:**
- 데이터 행 (Row)
- 셀 (Cell)
- 액션 버튼 (마지막 컬럼)
- 체크박스 (첫 번째 컬럼, 선택사항)

**스타일 특성:**
- 배경색: #FFFFFF (흰색)
- 텍스트 색상: #374151 (중간 회색)
- 폰트: 14px (text-sm), normal (font-normal)
- 패딩: px-4 py-3 (모바일), lg:px-6 lg:py-4 (데스크톱)

---

### 3. Row (행)

테이블의 각 행을 나타내며 하나의 데이터 레코드에 해당합니다.

**스타일 특성:**
- 테두리: border-b border-gray-200
- 호버 배경색: #F9FAFB (데스크톱에서만)
- 높이: auto (내용에 따라 변함)
- Transition: transition-colors duration-200

**호버 효과 (데스크톱):**
- 배경색: #F9FAFB
- 커서: pointer
- 박스 섀도우: 선택사항

**선택 상태:**
- 배경색: #DBEAFE (라이트 블루)
- 테두리 좌측: 3px solid #3B82F6

---

### 4. Cell (셀)

행 내 각 데이터를 표시하는 기본 단위입니다.

**스타일 특성:**
- 패딩: px-4 py-3 (모바일), lg:px-6 lg:py-4 (데스크톱)
- 텍스트 정렬: left (기본), center 또는 right (선택)
- 수직 정렬: middle (v-align)
- 텍스트 자르기: 긴 텍스트는 ellipsis 처리 (옵션)

**셀 타입:**
- Text Cell: 일반 텍스트
- Number Cell: 숫자 (오른쪽 정렬)
- Badge Cell: 상태 배지 (예: "배송중", "완료")
- Image Cell: 이미지 + 텍스트
- Action Cell: 버튼 그룹

---

## 상태 (States)

모든 Table 컴포넌트는 다음 상태를 지원합니다:

### 1. Default State (기본 상태)

- 배경색: #FFFFFF
- 텍스트 색상: #374151
- 테두리: border-gray-200

```css
/* Desktop */
table {
  background-color: #FFFFFF;
  border-collapse: collapse;
}

tr {
  border-bottom: 1px solid #D1D5DB;
}

td {
  color: #374151;
}
```

### 2. Hover State (호버 상태, 데스크톱만)

마우스가 행 위에 올라갔을 때의 상태입니다.

**효과:**
- 배경색: #F9FAFB
- 커서: pointer
- 박스 섀도우: 선택사항 (subtle)
- Transition: transition-colors duration-200

```css
/* Desktop Only */
@media (min-width: 1024px) {
  tr:hover {
    background-color: #F9FAFB;
    cursor: pointer;
  }
}
```

### 3. Selected State (선택 상태)

체크박스로 행을 선택했을 때의 상태입니다.

**효과:**
- 배경색: #DBEAFE (라이트 블루)
- 좌측 테두리: 3px solid #3B82F6
- 체크박스: checked 상태

```css
tr.selected {
  background-color: #DBEAFE;
  border-left: 3px solid #3B82F6;
}
```

### 4. Focus State (포커스 상태)

키보드로 행을 선택했을 때의 상태입니다.

**효과:**
- Focus Ring: ring-2 ring-[#10B981] ring-offset-0
- 적용 대상: 액션 버튼에 주로 적용

```css
tr:focus-within {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}
```

### 5. Loading State (로딩 상태)

데이터 로딩 중일 때의 상태입니다.

**효과:**
- Skeleton 또는 Placeholder 표시
- opacity-50
- cursor-wait

```css
tr.loading {
  opacity: 0.5;
  cursor: wait;
}
```

### 6. Empty State (빈 상태)

데이터가 없을 때의 상태입니다.

**표시:**
- 가운데 정렬 메시지
- 아이콘 (예: 📭)
- 설명 텍스트

```tsx
<div className="text-center py-8 text-gray-500">
  <p className="text-lg">데이터가 없습니다</p>
</div>
```

---

## 반응형 동작

### 데스크톱 (1024px 이상)

**레이아웃:** 전통적인 테이블 형식

```
┌──────────────────────────────────────────────┐
│ 선택 │ 상품명 │ 가격 │ 재고 │ 상태 │ 액션 │
├──────────────────────────────────────────────┤
│  ☐   │ 상품1  │ 50000 │ 100 │ 판매중 │ ▼  │
│  ☐   │ 상품2  │ 30000 │ 50  │ 판매중 │ ▼  │
└──────────────────────────────────────────────┘
```

**특징:**
- 헤더 고정 (sticky header, 선택사항)
- 행 호버 효과
- 수평 스크롤 가능 (초과 시)

### 타블렛 (768px ~ 1023px)

**레이아웃:** 축소된 테이블 또는 카드 전환

**옵션 1: 컬럼 숨김**
- 중요하지 않은 컬럼 숨김
- "상세보기" 버튼으로 확장 정보 제공

**옵션 2: 카드 레이아웃**
- 각 행을 독립 카드로 표시

### 모바일 (768px 미만)

**레이아웃:** 카드 기반 레이아웃

```
┌─────────────────────┐
│ 상품명: 상품1       │
│ 가격: ¥50,000       │
│ 재고: 100개         │
│ 상태: 판매중        │
│ [수정] [삭제]       │
└─────────────────────┘

┌─────────────────────┐
│ 상품명: 상품2       │
│ 가격: ¥30,000       │
│ 재고: 50개          │
│ 상태: 판매중        │
│ [수정] [삭제]       │
└─────────────────────┘
```

**특징:**
- 각 행이 개별 카드로 표시
- Label: Value 형식으로 정보 표시
- 액션 버튼 전체 너비 또는 아이콘 형식
- 선택 체크박스 우측 상단에 위치

**CSS Breakpoints:**
```css
/* Desktop (1024px+) - Table */
@media (min-width: 1024px) {
  display: table;
}

/* Tablet (768px ~ 1023px) - Table with hidden columns */
@media (max-width: 1023px) {
  display: table;
  /* Hidden columns */
  .column-hidden {
    display: none;
  }
}

/* Mobile (< 768px) - Card Layout */
@media (max-width: 767px) {
  display: block;
  /* Convert rows to cards */
  tr {
    display: block;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    padding: 1rem;
  }

  td {
    display: block;
    margin-bottom: 0.5rem;
  }

  td::before {
    content: attr(data-label);
    font-weight: 600;
    display: inline-block;
    width: 100px;
  }
}
```

---

## 정렬 (Sorting)

사용자가 컬럼 헤더를 클릭하여 데이터를 정렬할 수 있습니다.

### 정렬 상태

| 상태 | 아이콘 | 설명 |
|------|--------|------|
| Default | ↕ (또는 아이콘 없음) | 정렬되지 않음 |
| Ascending | ↑ | 오름차순 정렬 |
| Descending | ↓ | 내림차순 정렬 |

### 정렬 아이콘 스타일

```css
.sort-icon {
  color: #9CA3AF; /* Default: 회색 */
  font-size: 0.875rem;
  margin-left: 0.25rem;
  transition: color 200ms;
}

.sort-icon.active {
  color: #10B981; /* Active: 초록색 */
}
```

### 구현 방식

```typescript
// 정렬 가능한 컬럼 표시
<th className="cursor-pointer hover:bg-gray-100" onClick={handleSort}>
  상품명
  <SortIcon sortBy={sortBy} direction={sortDirection} />
</th>
```

---

## 페이지네이션 (Pagination)

대량의 데이터를 여러 페이지로 나누어 표시합니다.

### 페이지네이션 위치

- 테이블 하단
- 또는 테이블 상단과 하단 모두

### 페이지네이션 구성

| 요소 | 설명 |
|------|------|
| Previous Button | 이전 페이지로 이동 |
| Page Numbers | 페이지 번호 버튼 |
| Next Button | 다음 페이지로 이동 |
| Page Info | "1-10 of 150" 형식 |
| Items Per Page | 페이지당 항목 수 선택 (선택사항) |

### 페이지네이션 스타일

```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.pagination-button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  background-color: #FFFFFF;
  color: #374151;
  cursor: pointer;
  transition: all 200ms;
}

.pagination-button:hover:not(.disabled):not(.active) {
  background-color: #F3F4F6;
  border-color: #9CA3AF;
}

.pagination-button.active {
  background-color: #10B981;
  color: #FFFFFF;
  border-color: #10B981;
}

.pagination-button.disabled {
  opacity: 0.5;
  cursor-not-allowed;
}
```

---

## Props 정의

### TableProps (테이블 기본)

```typescript
interface TableProps {
  // 데이터
  data: TableRow[];
  columns: TableColumn[];

  // 상태
  loading?: boolean;
  error?: string | null;

  // 선택
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectRow?: (rowId: string | number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;

  // 정렬
  sortable?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;

  // 페이지네이션
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;

  // 행 이벤트
  onRowClick?: (row: TableRow) => void;
  onRowAction?: (rowId: string | number, action: string) => void;

  // 스타일
  className?: string;
  striped?: boolean; // 줄무늬 (짝수 행 배경색)
  bordered?: boolean; // 테두리 표시
  hover?: boolean; // 호버 효과

  // 반응형
  responsive?: 'table' | 'card' | 'auto';

  // 접근성
  caption?: string;
  ariaLabel?: string;
}
```

### TableColumn

```typescript
interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string | number;
  render?: (value: any, row: TableRow) => React.ReactNode;
  headerClass?: string;
  cellClass?: string;
  hidden?: boolean;
}
```

### TableRow

```typescript
interface TableRow {
  id: string | number;
  [key: string]: any;
}
```

### PaginationConfig

```typescript
interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  pageCount?: number;
}
```

### ActionButtonProps

```typescript
interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: (rowId: string | number) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
}
```

### TableHeaderProps

```typescript
interface TableHeaderProps {
  column: TableColumn;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  selectable?: boolean;
  allSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
}
```

### TableRowProps

```typescript
interface TableRowProps {
  row: TableRow;
  columns: TableColumn[];
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (rowId: string | number, selected: boolean) => void;
  onRowClick?: (row: TableRow) => void;
  onAction?: (rowId: string | number, action: string) => void;
  striped?: boolean;
  hover?: boolean;
}
```

---

## 스타일 명세

### Tailwind CSS 클래스

| 요소 | 클래스 |
|------|--------|
| 테이블 | `w-full border-collapse` |
| 헤더 | `bg-gray-50 border-b border-gray-200 sticky top-0 z-10` |
| 헤더 셀 | `px-4 py-3 lg:px-6 lg:py-4 text-xs font-semibold text-gray-900 text-left` |
| 행 | `border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200` |
| 셀 | `px-4 py-3 lg:px-6 lg:py-4 text-sm text-gray-700` |
| 선택된 행 | `bg-blue-50 border-l-4 border-blue-500` |
| 호버 행 (데스크톱) | `hover:bg-gray-50 cursor-pointer` |
| 체크박스 | `w-4 h-4 border border-gray-300 rounded ring-2 ring-offset-0 focus:ring-emerald-500` |
| 액션 버튼 | `px-2 py-1 text-sm hover:bg-gray-200 rounded transition-colors` |

### 색상 정의

| 요소 | 색상 | 16진수 |
|------|------|--------|
| 헤더 배경 | 밝은 회색 | #F9FAFB |
| 행 배경 | 흰색 | #FFFFFF |
| 행 호버 | 매우 밝은 회색 | #F9FAFB |
| 선택된 행 | 라이트 블루 | #DBEAFE |
| 테두리 | 회색 | #D1D5DB |
| 텍스트 | 중간 회색 | #374151 |
| 정렬 아이콘 활성 | 초록색 | #10B981 |

### 간격 정의

| 요소 | 값 | Tailwind |
|------|-----|----------|
| 셀 패딩 (X, 모바일) | 16px | px-4 |
| 셀 패딩 (Y, 모바일) | 12px | py-3 |
| 셀 패딩 (X, 데스크톱) | 24px | lg:px-6 |
| 셀 패딩 (Y, 데스크톱) | 16px | lg:py-4 |
| 행 간격 (카드 모드) | 16px | mb-4 |

---

## 사용 예시

### 기본 테이블

```tsx
<Table
  data={products}
  columns={[
    { key: 'name', label: '상품명' },
    { key: 'price', label: '가격', align: 'right' },
    { key: 'stock', label: '재고', align: 'center' },
    { key: 'status', label: '상태' },
  ]}
  hover
/>
```

### 정렬 기능이 있는 테이블

```tsx
<Table
  data={products}
  columns={[
    { key: 'name', label: '상품명', sortable: true },
    { key: 'price', label: '가격', sortable: true, align: 'right' },
    { key: 'stock', label: '재고', sortable: true },
  ]}
  sortable
  sortBy="name"
  sortDirection="asc"
  onSort={handleSort}
/>
```

### 선택 기능이 있는 테이블

```tsx
<Table
  data={orders}
  columns={[
    { key: 'orderNumber', label: '주문번호' },
    { key: 'customer', label: '고객' },
    { key: 'total', label: '합계' },
    { key: 'status', label: '상태' },
  ]}
  selectable
  selectedRows={selectedRows}
  onSelectRow={handleSelectRow}
  onSelectAll={handleSelectAll}
/>
```

### 액션 버튼이 있는 테이블

```tsx
<Table
  data={users}
  columns={[
    { key: 'name', label: '이름' },
    { key: 'email', label: '이메일' },
    { key: 'role', label: '역할' },
    {
      key: 'actions',
      label: '액션',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button onClick={() => handleEdit(row.id)}>수정</Button>
          <Button onClick={() => handleDelete(row.id)} variant="danger">삭제</Button>
        </div>
      ),
    },
  ]}
/>
```

### 페이지네이션이 있는 테이블

```tsx
<Table
  data={products}
  columns={columns}
  pagination={{
    page: currentPage,
    pageSize: 10,
    total: totalProducts,
  }}
  onPageChange={handlePageChange}
/>
```

### 반응형 테이블 (모바일에서 카드로 변환)

```tsx
<Table
  data={products}
  columns={columns}
  responsive="auto"
  hover
/>
```

---

## 접근성 (Accessibility)

- **ARIA Labels**: 테이블에 `role="table"`, 행에 `role="row"`, 셀에 `role="cell"`
- **정렬 아이콘**: aria-label로 정렬 상태 설명 (예: "이름으로 오름차순 정렬")
- **선택**: 체크박스는 `aria-checked`, `aria-label` 포함
- **키보드 네비게이션**: Tab 키로 셀 이동, Enter로 행 선택
- **색상만 사용 금지**: 상태는 아이콘, 텍스트로도 표시
- **충분한 대비비율**: WCAG AA 기준 준수

---

## 버전 정보

- **버전**: 1.0.0
- **마지막 업데이트**: 2024-12-04
- **라이브러리**: React 18.0+, Tailwind CSS 3.0+
- **TypeScript**: 5.0+
