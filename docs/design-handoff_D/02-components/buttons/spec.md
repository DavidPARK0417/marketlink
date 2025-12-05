# Button Component Specification

## 개요

Button 컴포넌트는 사용자 인터랙션의 핵심 요소로, 폼 제출, 페이지 네비게이션, 모달 열기/닫기 등 다양한 작업을 트리거합니다.
모든 버튼은 명확한 시각적 계층구조를 유지하며, 접근성 기준을 충족합니다.

- **최소 높이**: 40px (터치 영역)
- **포커싱**: 키보드 네비게이션 지원
- **상태 피드백**: 호버, 포커스, 액티브, 비활성화 상태 제공

---

## Variants

### 1. Primary Button (주요 행동)
버튼의 기본 형태로 사용자가 취해야 할 주요 작업에 사용됩니다.

| 속성 | 값 |
|------|-----|
| **배경색** | #10B981 (Primary Color) |
| **글자색** | #FFFFFF (White) |
| **테두리** | 없음 |
| **높이** | 40px |
| **패딩** | 12px 16px |
| **글자 크기** | 14px / 400 (Regular) |
| **border-radius** | 6px |

**Tailwind Classes**: `bg-emerald-500 text-white font-medium`

---

### 2. Secondary Button (보조 행동)
Primary와 함께 표시되는 보조 행동용 버튼입니다.

| 속성 | 값 |
|------|-----|
| **배경색** | #F3F4F6 (Gray 100) |
| **글자색** | #374151 (Gray 700) |
| **테두리** | 1px solid #D1D5DB (Gray 300) |
| **높이** | 40px |
| **패딩** | 12px 16px |
| **글자 크기** | 14px / 400 (Regular) |
| **border-radius** | 6px |

**Tailwind Classes**: `bg-gray-100 text-gray-700 border border-gray-300 font-medium`

---

### 3. Ghost Button (텍스트 기반)
배경 없는 텍스트만으로 표시되는 버튼입니다. 모달 취소 버튼, 링크 버튼에 사용됩니다.

| 속성 | 값 |
|------|-----|
| **배경색** | 투명 |
| **글자색** | #10B981 (Primary Color) |
| **테두리** | 없음 |
| **높이** | 40px |
| **패딩** | 12px 16px |
| **글자 크기** | 14px / 400 (Regular) |
| **border-radius** | 6px |

**Tailwind Classes**: `text-emerald-500 font-medium hover:bg-emerald-50`

---

### 4. Danger Button (삭제/위험 작업)
삭제, 취소 같은 위험한 작업에 사용됩니다.

| 속성 | 값 |
|------|-----|
| **배경색** | #EF4444 (Red 500) |
| **글자색** | #FFFFFF (White) |
| **테두리** | 없음 |
| **높이** | 40px |
| **패딩** | 12px 16px |
| **글자 크기** | 14px / 400 (Regular) |
| **border-radius** | 6px |

**Tailwind Classes**: `bg-red-500 text-white font-medium`

---

## States

### Default
버튼의 기본 상태입니다.

- **Cursor**: pointer
- **Opacity**: 1.0

### Hover
마우스가 버튼 위에 있을 때의 상태입니다.

| Variant | 배경색 변화 | Tailwind |
|---------|-----------|----------|
| Primary | #059669 (Emerald 600) | `hover:bg-emerald-600` |
| Secondary | #E5E7EB (Gray 200) | `hover:bg-gray-200` |
| Ghost | #F0FDF4 (Emerald 50) | `hover:bg-emerald-50` |
| Danger | #DC2626 (Red 600) | `hover:bg-red-600` |

### Focus
키보드 포커스 상태입니다.

- **아웃라인**: 2px solid #10B981 (Primary)
- **아웃라인 오프셋**: 2px
- **Tailwind**: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`

### Active
마우스 클릭 시의 상태입니다.

| Variant | 배경색 변화 | Tailwind |
|---------|-----------|----------|
| Primary | #047857 (Emerald 700) | `active:bg-emerald-700` |
| Secondary | #D1D5DB (Gray 300) | `active:bg-gray-300` |
| Ghost | #ECFDF5 (Emerald 100) | `active:bg-emerald-100` |
| Danger | #B91C1C (Red 700) | `active:bg-red-700` |

### Disabled
비활성화 상태입니다.

| 속성 | 값 |
|------|-----|
| **배경색** | #D1D5DB (Gray 300) |
| **글자색** | #9CA3AF (Gray 400) |
| **Cursor** | not-allowed |
| **Opacity** | 0.6 |
| **Tailwind** | `disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60` |

---

## Props 정의

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}
```

### Props 설명

| Props | 타입 | 기본값 | 설명 |
|-------|------|-------|------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | 버튼의 시각적 스타일 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 버튼의 크기 (현재는 md 지원) |
| `disabled` | `boolean` | `false` | 버튼 비활성화 여부 |
| `isLoading` | `boolean` | `false` | 로딩 상태 (추후 구현) |
| `children` | `React.ReactNode` | - | 버튼 텍스트/콘텐츠 |
| `className` | `string` | - | 추가 CSS 클래스 |
| `onClick` | `function` | - | 클릭 이벤트 핸들러 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `fullWidth` | `boolean` | `false` | 부모 컨테이너의 전체 너비 사용 |

---

## 스타일 명세

### Typography
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Font Size**: 14px
- **Font Weight**: 500 (Medium)
- **Line Height**: 1.5 (20px)
- **Letter Spacing**: -0.02em

### Spacing
- **Horizontal Padding**: 16px
- **Vertical Padding**: 12px
- **Min Height**: 40px

### Border Radius
- **All Variants**: 6px

### Transitions
- **Duration**: 150ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Properties**: background-color, box-shadow, color

---

## Tailwind Class Mappings

### Primary Button
```
base: 'bg-emerald-500 text-white'
hover: 'hover:bg-emerald-600'
active: 'active:bg-emerald-700'
focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed'
```

### Secondary Button
```
base: 'bg-gray-100 text-gray-700 border border-gray-300'
hover: 'hover:bg-gray-200'
active: 'active:bg-gray-300'
focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed'
```

### Ghost Button
```
base: 'text-emerald-500'
hover: 'hover:bg-emerald-50'
active: 'active:bg-emerald-100'
focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
disabled: 'disabled:text-gray-400 disabled:cursor-not-allowed'
```

### Danger Button
```
base: 'bg-red-500 text-white'
hover: 'hover:bg-red-600'
active: 'active:bg-red-700'
focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed'
```

---

## 사용 예시

### Primary Button
```jsx
<Button variant="primary" onClick={handleSubmit}>
  저장하기
</Button>
```

### Secondary Button
```jsx
<Button variant="secondary" onClick={handleCancel}>
  취소
</Button>
```

### Ghost Button (텍스트 링크)
```jsx
<Button variant="ghost" onClick={handleDismiss}>
  닫기
</Button>
```

### Danger Button (삭제 확인)
```jsx
<Button variant="danger" onClick={handleDelete}>
  삭제하기
</Button>
```

### Disabled State
```jsx
<Button variant="primary" disabled>
  저장 중...
</Button>
```

### Full Width Button
```jsx
<Button variant="primary" fullWidth>
  로그인
</Button>
```

### 그룹 배치 (모달 예시)
```jsx
<div className="flex gap-3 justify-end">
  <Button variant="secondary" onClick={handleCancel}>
    취소
  </Button>
  <Button variant="primary" onClick={handleConfirm}>
    확인
  </Button>
</div>
```

---

## 접근성

- **ARIA Labels**: 필요시 `aria-label` 속성 사용
- **Keyboard Navigation**: Tab, Enter, Space 키 지원
- **Focus Visible**: 키보드 네비게이션 시 명확한 focus ring 표시
- **Color Contrast**: WCAG AA 기준 충족 (4.5:1 이상)

---

## 성능 및 최적화

- **Memoization**: `React.memo`로 재렌더링 최소화 (props 변경 시에만)
- **Bundle Size**: 순수 UI 컴포넌트로 번들 크기 최소화
- **CSS-in-JS**: Tailwind CSS 사용으로 런타임 오버헤드 제거
