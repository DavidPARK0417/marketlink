'use client';

import React, { ReactNode, ChangeEvent, FocusEvent } from 'react';

/**
 * ============================================================
 * Label Component
 * ============================================================
 */

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, htmlFor, required, optional, disabled, className = '' }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={`
          block text-sm font-medium mb-2
          ${disabled ? 'text-gray-400' : 'text-gray-900'}
          ${className}
        `}
      >
        {children}
        {required && <span className="text-red-500"> *</span>}
        {optional && <span className="text-gray-400"> (선택사항)</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

/**
 * ============================================================
 * Input Component
 * ============================================================
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      size = 'md',
      error = false,
      errorMessage,
      label,
      required,
      helperText,
      disabled,
      placeholder,
      className = '',
      ...props
    },
    ref
  ) => {
    // 크기 클래스
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    // 기본 클래스
    const baseClasses = `
      w-full
      border rounded-lg
      text-gray-900
      placeholder:text-gray-400
      transition-all duration-150
      focus:outline-none
      disabled:bg-gray-100
      disabled:text-gray-300
      disabled:cursor-not-allowed
    `;

    // 상태별 클래스
    const stateClasses = error
      ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0'
      : 'border border-gray-300 focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0 focus:border-transparent';

    return (
      <div className="space-y-1">
        {label && <Label htmlFor={props.id} required={required}>{label}</Label>}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${stateClasses}
            ${className}
          `}
          {...props}
        />
        {errorMessage && error && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * ============================================================
 * Select Component
 * ============================================================
 */

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'md',
      options,
      error = false,
      errorMessage,
      label,
      required,
      helperText,
      disabled,
      placeholder,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const baseClasses = `
      w-full
      border rounded-lg
      text-gray-900
      bg-white
      appearance-none
      cursor-pointer
      transition-all duration-150
      focus:outline-none
      disabled:bg-gray-100
      disabled:text-gray-300
      disabled:cursor-not-allowed
      pr-10
    `;

    const stateClasses = error
      ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0'
      : 'border border-gray-300 focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0';

    return (
      <div className="space-y-1">
        {label && <Label htmlFor={props.id} required={required}>{label}</Label>}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              ${baseClasses}
              ${sizeClasses[size]}
              ${stateClasses}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {errorMessage && error && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

/**
 * ============================================================
 * Textarea Component
 * ============================================================
 */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  characterLimit?: number;
  resizable?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      label,
      required,
      helperText,
      characterLimit,
      resizable = true,
      disabled,
      placeholder,
      className = '',
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(
      typeof value === 'string' ? value.length : 0
    );

    const sizeClasses = {
      sm: 'h-20 px-4 py-2.5 text-sm',
      md: 'h-30 px-4 py-2.5 text-base',
      lg: 'h-40 px-4 py-3 text-lg',
    };

    const baseClasses = `
      w-full
      border rounded-lg
      text-gray-900
      placeholder:text-gray-400
      transition-all duration-150
      focus:outline-none
      disabled:bg-gray-100
      disabled:text-gray-300
      disabled:cursor-not-allowed
      font-sans
      ${resizable ? 'resize-vertical' : 'resize-none'}
    `;

    const stateClasses = error
      ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-offset-0'
      : 'border border-gray-300 focus:ring-2 focus:ring-[#10B981] focus:ring-offset-0';

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="space-y-1">
        {label && <Label htmlFor={props.id} required={required}>{label}</Label>}
        <textarea
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={characterLimit}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${stateClasses}
            ${className}
          `}
          onChange={handleChange}
          value={value}
          {...props}
        />
        <div className="flex justify-between items-center text-xs">
          <div>
            {errorMessage && error && (
              <p className="text-red-500">{errorMessage}</p>
            )}
            {helperText && !error && (
              <p className="text-gray-500">{helperText}</p>
            )}
          </div>
          {characterLimit && (
            <p className={charCount > characterLimit ? 'text-red-500' : 'text-gray-500'}>
              {charCount} / {characterLimit}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * ============================================================
 * Checkbox Component
 * ============================================================
 */

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  required?: boolean;
  error?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      label,
      description,
      required,
      error,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          disabled={disabled}
          className={`
            ${sizeClasses[size]}
            mt-1
            border rounded-md
            text-emerald-500
            bg-white
            border-gray-300
            cursor-pointer
            transition-all duration-150
            focus:ring-2
            focus:ring-[#10B981]
            focus:ring-offset-0
            disabled:bg-gray-100
            disabled:border-gray-300
            disabled:cursor-not-allowed
            accent-emerald-500
            ${error ? 'border-2 border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {label && (
          <div className="flex flex-col">
            <label
              htmlFor={id}
              className={`
                text-base font-medium
                ${disabled ? 'text-gray-400' : 'text-gray-900'}
                cursor-pointer
              `}
            >
              {label}
              {required && <span className="text-red-500"> *</span>}
            </label>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * ============================================================
 * Radio Button Component
 * ============================================================
 */

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  required?: boolean;
  error?: boolean;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      size = 'md',
      label,
      description,
      required,
      error,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="radio"
          id={id}
          disabled={disabled}
          className={`
            ${sizeClasses[size]}
            mt-1
            border-2
            border-gray-300
            text-emerald-500
            bg-white
            rounded-full
            cursor-pointer
            transition-all duration-150
            focus:ring-2
            focus:ring-[#10B981]
            focus:ring-offset-0
            disabled:bg-gray-100
            disabled:border-gray-300
            disabled:cursor-not-allowed
            accent-emerald-500
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {label && (
          <div className="flex flex-col">
            <label
              htmlFor={id}
              className={`
                text-base font-medium
                ${disabled ? 'text-gray-400' : 'text-gray-900'}
                cursor-pointer
              `}
            >
              {label}
              {required && <span className="text-red-500"> *</span>}
            </label>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * ============================================================
 * Radio Group Component
 * ============================================================
 */

interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
  required?: boolean;
  helperText?: string;
  options: RadioGroupOption[];
  error?: boolean;
  errorMessage?: string;
  className?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      onChange,
      direction = 'vertical',
      size = 'md',
      disabled,
      label,
      required,
      helperText,
      options,
      error,
      errorMessage,
      className = '',
    },
    ref
  ) => {
    const directionClass = direction === 'horizontal' ? 'flex flex-wrap gap-6' : 'space-y-3';

    return (
      <div ref={ref} className="space-y-2">
        {label && <Label required={required}>{label}</Label>}
        <div className={directionClass}>
          {options.map((option) => (
            <Radio
              key={option.value}
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled || option.disabled}
              label={option.label}
              description={option.description}
              size={size}
              error={error}
            />
          ))}
        </div>
        {errorMessage && error && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

/**
 * ============================================================
 * Form Wrapper Component (유틸리티)
 * ============================================================
 */

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={`space-y-6 ${className}`}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

/**
 * ============================================================
 * Form Group Wrapper (필드 그룹)
 * ============================================================
 */

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export const FormGroup = ({
  children,
  className = '',
}: FormGroupProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
};

/**
 * ============================================================
 * Form Row (반응형 행)
 * ============================================================
 */

interface FormRowProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const FormRow = ({
  children,
  columns = 1,
  className = '',
}: FormRowProps) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * ============================================================
 * Example Usage Component
 * ============================================================
 */

export const FormExample = () => {
  const [formData, setFormData] = React.useState({
    productName: '',
    category: '',
    description: '',
    price: '',
    shipping: 'standard',
    agreeTerms: false,
    newsletter: false,
  });

  const [errors, setErrors] = React.useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    const newErrors: Record<string, boolean> = {};
    if (!formData.productName) newErrors.productName = true;
    if (!formData.category) newErrors.category = true;
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = true;
    if (!formData.agreeTerms) newErrors.agreeTerms = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="max-w-2xl">
      {/* 기본 정보 섹션 */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>

        {/* 상품명 */}
        <FormGroup>
          <Input
            id="productName"
            label="상품명"
            required
            placeholder="상품명을 입력하세요"
            value={formData.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            error={errors.productName}
            errorMessage={errors.productName ? '상품명은 필수입니다.' : ''}
            helperText="상품명은 최대 100자입니다."
            size="md"
          />
        </FormGroup>

        {/* 카테고리 및 가격 */}
        <FormRow columns={2}>
          <FormGroup>
            <Select
              id="category"
              label="카테고리"
              required
              placeholder="선택하세요"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              error={errors.category}
              errorMessage={errors.category ? '카테고리를 선택해주세요.' : ''}
              options={[
                { value: '', label: '선택하세요', disabled: true },
                { value: 'fruit', label: '신선 과일' },
                { value: 'vegetable', label: '신선 채소' },
                { value: 'grain', label: '곡류' },
              ]}
              size="md"
            />
          </FormGroup>

          <FormGroup>
            <Input
              id="price"
              label="가격"
              required
              type="number"
              placeholder="가격을 입력하세요"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              error={errors.price}
              errorMessage={errors.price ? '0 이상의 가격을 입력해주세요.' : ''}
              helperText="원(₩) 단위"
              size="md"
            />
          </FormGroup>
        </FormRow>

        {/* 설명 */}
        <FormGroup>
          <Textarea
            id="description"
            label="설명"
            placeholder="상품에 대한 상세 설명을 입력해주세요"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            helperText="최대 500자까지 입력 가능합니다."
            characterLimit={500}
            size="md"
          />
        </FormGroup>
      </div>

      {/* 배송 정보 섹션 */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">배송 정보</h3>

        <FormGroup>
          <RadioGroup
            name="shipping"
            label="배송 방법"
            required
            value={formData.shipping}
            onChange={(value) => handleInputChange('shipping', value)}
            size="md"
            options={[
              {
                value: 'standard',
                label: '기본 배송 (무료)',
                description: '3~5일 소요',
              },
              {
                value: 'express',
                label: '우선 배송 (5,000원)',
                description: '1~2일 소요',
              },
              {
                value: 'same-day',
                label: '당일 배송 (10,000원)',
                description: '오늘 배송 (12시까지 주문시)',
              },
            ]}
            helperText="배송 방법을 선택해주세요."
          />
        </FormGroup>
      </div>

      {/* 약관 동의 섹션 */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">약관 동의</h3>

        <FormGroup>
          <Checkbox
            id="agreeTerms"
            label="이용약관에 동의합니다"
            required
            checked={formData.agreeTerms}
            onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
            error={errors.agreeTerms}
          />
        </FormGroup>

        <FormGroup>
          <Checkbox
            id="newsletter"
            label="뉴스레터 구독"
            description="최신 상품과 할인 정보를 받을 수 있습니다."
            checked={formData.newsletter}
            onChange={(e) => handleInputChange('newsletter', e.target.checked)}
          />
        </FormGroup>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-8">
        <button
          type="reset"
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors duration-200"
        >
          등록
        </button>
      </div>
    </Form>
  );
};
