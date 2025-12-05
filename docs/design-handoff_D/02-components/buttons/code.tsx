import React from 'react';

/**
 * Button component props interface
 * Extends HTML button attributes for semantic HTML support
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click event handler
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * HTML button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Whether the button should take full width of parent
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Variant styles configuration
 * Maps variant names to their Tailwind CSS classes
 */
const variantStyles = {
  primary: {
    base: 'bg-emerald-500 text-white',
    hover: 'hover:bg-emerald-600',
    active: 'active:bg-emerald-700',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60',
  },
  secondary: {
    base: 'bg-gray-100 text-gray-700 border border-gray-300',
    hover: 'hover:bg-gray-200 hover:border-gray-400',
    active: 'active:bg-gray-300',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-gray-300',
  },
  ghost: {
    base: 'text-emerald-500 bg-transparent',
    hover: 'hover:bg-emerald-50',
    active: 'active:bg-emerald-100',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
    disabled: 'disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60',
  },
  danger: {
    base: 'bg-red-500 text-white',
    hover: 'hover:bg-red-600',
    active: 'active:bg-red-700',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60',
  },
};

/**
 * Size styles configuration
 * Maps size names to their Tailwind CSS classes
 */
const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
};

/**
 * Base button styles applied to all variants
 */
const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out rounded-md whitespace-nowrap';

/**
 * Button Component
 *
 * A versatile button component with multiple variants and states.
 * Supports primary, secondary, ghost, and danger styling with
 * full accessibility features and keyboard navigation.
 *
 * @example
 * // Primary button
 * <Button onClick={handleClick}>Submit</Button>
 *
 * @example
 * // Secondary button
 * <Button variant="secondary">Cancel</Button>
 *
 * @example
 * // Ghost button (text only)
 * <Button variant="ghost">Dismiss</Button>
 *
 * @example
 * // Danger button
 * <Button variant="danger">Delete</Button>
 *
 * @example
 * // Disabled button
 * <Button disabled>Disabled</Button>
 *
 * @example
 * // Full width button
 * <Button fullWidth>Login</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      isLoading = false,
      children,
      className = '',
      onClick,
      type = 'button',
      fullWidth = false,
      ...rest
    },
    ref
  ) => {
    // Get variant styles
    const currentVariant = variantStyles[variant];
    const currentSize = sizeStyles[size];

    // Build class name
    const buttonClasses = [
      baseStyles,
      currentVariant.base,
      currentVariant.hover,
      currentVariant.active,
      currentVariant.focus,
      currentVariant.disabled,
      currentSize,
      fullWidth ? 'w-full' : '',
      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Handle click event with disabled state check
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={buttonClasses}
        {...rest}
      >
        {/* Show loading indicator if isLoading is true */}
        {isLoading && (
          <span className="mr-2">
            <svg
              className="inline-block animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  }
);

// Display name for debugging
Button.displayName = 'Button';

/**
 * Button Group Component
 *
 * Utility component for grouping multiple buttons together
 * with consistent spacing (typically used in modals or toolbars)
 *
 * @example
 * <ButtonGroup>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="primary">Submit</Button>
 * </ButtonGroup>
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className = '', justify = 'end' }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={`flex gap-3 ${justifyClasses[justify]} ${className}`}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

/**
 * Icon Button Component
 *
 * Specialized button for displaying icons
 * Typically used for toolbar actions or secondary interactions
 *
 * @example
 * <IconButton aria-label="Close">
 *   <XIcon />
 * </IconButton>
 */
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  children: React.ReactNode;
  ariaLabel?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, ariaLabel, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        className="inline-flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Export all button-related components
 */
export default Button;
