import React, { ReactNode } from 'react';

/**
 * Card Props Types
 *
 * 기본 카드 컴포넌트의 Props 인터페이스입니다.
 */
interface CardBaseProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  ariaLabel?: string;
}

interface BasicCardProps extends CardBaseProps {
  variant?: 'basic';
}

interface Card3DProps extends CardBaseProps {
  variant: '3d';
  intensity?: 'normal' | 'strong';
}

interface StatusCardProps extends CardBaseProps {
  variant: 'status';
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'inactive';
  icon?: ReactNode;
  label?: string;
}

type CardProps = BasicCardProps | Card3DProps | StatusCardProps;

/**
 * 상태별 색상 맵핑
 */
const STATUS_COLOR_MAP = {
  pending: {
    borderColor: '#FBBF24',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    label: '대기중',
  },
  confirmed: {
    borderColor: '#3B82F6',
    bgColor: '#DBEAFE',
    textColor: '#1E40AF',
    label: '확인됨',
  },
  shipped: {
    borderColor: '#8B5CF6',
    bgColor: '#EDE9FE',
    textColor: '#5B21B6',
    label: '배송중',
  },
  completed: {
    borderColor: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    label: '완료',
  },
  inactive: {
    borderColor: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: '#374151',
    label: '비활성',
  },
} as const;

/**
 * 패딩 맵핑
 */
const PADDING_MAP = {
  sm: 'p-2 lg:p-3',
  md: 'p-4 lg:p-6',
  lg: 'p-6 lg:p-8',
} as const;

/**
 * 카드 컴포넌트
 *
 * 3가지 변형을 지원합니다:
 * 1. Basic Card: 표준 카드 (shadow-md → shadow-xl)
 * 2. 3D Card: 입체감 있는 카드 (초록색 그림자)
 * 3. Status Card: 상태 표시 카드 (색상 코딩)
 *
 * @example
 * // 기본 카드
 * <Card hoverable>
 *   <h3>상품명</h3>
 *   <p>설명</p>
 * </Card>
 *
 * @example
 * // 3D 효과 카드
 * <Card variant="3d" hoverable>
 *   <h3>프리미엄 상품</h3>
 * </Card>
 *
 * @example
 * // 상태 카드
 * <Card variant="status" status="shipped" label="배송 중">
 *   <p>주문 추적 정보</p>
 * </Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      onClick,
      disabled = false,
      padding = 'md',
      hoverable = true,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    // variant 타입 확인
    const variant = (props as any).variant || 'basic';
    const isStatusCard = variant === 'status';
    const is3DCard = variant === '3d';

    // 패딩 클래스 결정
    const paddingClass = PADDING_MAP[padding];

    // 기본 공통 클래스
    const baseClasses = `
      bg-white
      transition-all
      duration-300
      ease-out
      ${paddingClass}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${!disabled && onClick ? 'cursor-pointer' : ''}
      ${className}
    `;

    // 상태 카드 처리
    if (isStatusCard) {
      const statusProps = props as StatusCardProps;
      const statusConfig = STATUS_COLOR_MAP[statusProps.status];

      return (
        <div
          ref={ref}
          className={`
            rounded-2xl
            shadow-md
            hover:shadow-lg
            ${hoverable && !disabled ? 'hover:-translate-y-1' : ''}
            ${baseClasses}
          `}
          style={{
            borderLeft: `4px solid ${statusConfig.borderColor}`,
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.textColor,
          }}
          onClick={!disabled ? onClick : undefined}
          role={onClick ? 'button' : undefined}
          aria-label={ariaLabel || statusProps.label || statusConfig.label}
          aria-disabled={disabled}
          tabIndex={!disabled && onClick ? 0 : undefined}
          onKeyPress={(e) => {
            if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {statusProps.label && (
                <p className="text-sm font-semibold mb-1">{statusProps.label}</p>
              )}
              {children}
            </div>
            {statusProps.icon && (
              <div className="text-2xl flex-shrink-0">{statusProps.icon}</div>
            )}
          </div>
        </div>
      );
    }

    // 3D 효과 카드 처리
    if (is3DCard) {
      const intensity = (props as Card3DProps).intensity || 'normal';
      const shadowValue =
        intensity === 'strong'
          ? '0 30px 60px rgba(16, 185, 129, 0.2)'
          : '0 20px 50px rgba(16, 185, 129, 0.15)';
      const hoverShadowValue =
        intensity === 'strong'
          ? '0 30px 60px rgba(16, 185, 129, 0.25)'
          : '0 20px 50px rgba(16, 185, 129, 0.2)';

      return (
        <div
          ref={ref}
          className={`
            rounded-3xl
            ${hoverable && !disabled ? 'hover:-translate-y-2' : ''}
            ${baseClasses}
          `}
          style={{
            boxShadow: shadowValue,
            ...(hoverable && !disabled && {
              '--hover-shadow': hoverShadowValue,
            } as React.CSSProperties),
          }}
          onClick={!disabled ? onClick : undefined}
          role={onClick ? 'button' : undefined}
          aria-label={ariaLabel}
          aria-disabled={disabled}
          tabIndex={!disabled && onClick ? 0 : undefined}
          onKeyPress={(e) => {
            if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onClick();
            }
          }}
          onMouseEnter={(e) => {
            if (hoverable && !disabled) {
              (e.currentTarget as HTMLElement).style.boxShadow = hoverShadowValue;
            }
          }}
          onMouseLeave={(e) => {
            if (hoverable && !disabled) {
              (e.currentTarget as HTMLElement).style.boxShadow = shadowValue;
            }
          }}
        >
          {children}
        </div>
      );
    }

    // 기본 카드 처리
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          shadow-md
          hover:shadow-xl
          ${hoverable && !disabled ? 'hover:-translate-y-1' : ''}
          ${baseClasses}
        `}
        onClick={!disabled ? onClick : undefined}
        role={onClick ? 'button' : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        tabIndex={!disabled && onClick ? 0 : undefined}
        onKeyPress={(e) => {
          if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
export type { CardProps, BasicCardProps, Card3DProps, StatusCardProps };

/**
 * 예제 컴포넌트들
 */

/**
 * 제품 카드 예제
 */
export const ProductCard: React.FC<{
  image: string;
  title: string;
  description: string;
  price: number;
  onClick?: () => void;
}> = ({ image, title, description, price, onClick }) => (
  <Card hoverable onClick={onClick}>
    <div className="flex flex-col gap-3">
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover rounded-lg"
      />
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="mt-3 font-semibold text-emerald-600 text-lg">
          ¥{price.toLocaleString()}
        </p>
      </div>
    </div>
  </Card>
);

/**
 * 통계 카드 예제 (3D 효과)
 */
export const StatsCard3D: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
}> = ({ title, value, change, icon }) => (
  <Card variant="3d" hoverable padding="lg">
    <div className="text-center">
      {icon && <div className="text-4xl mb-3 text-center">{icon}</div>}
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {change !== undefined && (
        <p
          className={`text-sm mt-2 ${
            change >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? '+' : ''}{change}%
        </p>
      )}
    </div>
  </Card>
);

/**
 * 주문 상태 카드 예제
 */
export const OrderStatusCard: React.FC<{
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'inactive';
  date?: string;
  icon?: string;
}> = ({ orderNumber, status, date, icon }) => (
  <Card
    variant="status"
    status={status}
    icon={icon}
    padding="md"
  >
    <div className="space-y-1">
      <p className="font-bold">주문번호: {orderNumber}</p>
      {date && (
        <p className="text-sm">
          {status === 'shipped' ? '예상 배송' : '주문일'}: {date}
        </p>
      )}
    </div>
  </Card>
);

/**
 * 사용자 정보 카드 예제
 */
export const UserCard: React.FC<{
  avatar: string;
  name: string;
  role: string;
  email: string;
  onClick?: () => void;
}> = ({ avatar, name, role, email, onClick }) => (
  <Card hoverable onClick={onClick}>
    <div className="flex items-center gap-4">
      <img
        src={avatar}
        alt={name}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{role}</p>
        <p className="text-xs text-gray-500 mt-1">{email}</p>
      </div>
    </div>
  </Card>
);

/**
 * 높은 대조 상태 카드 예제 (접근성)
 */
export const AccessibleStatusCard: React.FC<{
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'inactive';
  title: string;
  description: string;
}> = ({ status, title, description }) => (
  <Card
    variant="status"
    status={status}
    padding="md"
    role="article"
  >
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-sm mt-2">{description}</p>
  </Card>
);

/**
 * 스타일 참고:
 *
 * Tailwind Mapping:
 * - 기본 카드: rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300
 * - 3D 카드: rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:-translate-y-2
 * - 상태 카드: rounded-2xl border-l-4 shadow-md hover:shadow-lg hover:-translate-y-1
 * - 공통: bg-white p-4 lg:p-6 transition-all duration-300
 *
 * Custom Shadows (CSS):
 * - card3D: box-shadow: 0 20px 50px rgba(16, 185, 129, 0.15);
 * - cardHover: box-shadow: 0 20px 50px rgba(16, 185, 129, 0.2);
 */
