import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import './Button.css';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'md' | 'sm' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  'data-testid'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    type = 'button',
    'data-testid': dataTestId,
    ...rest
  },
  ref
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        loading && 'btn-loading',
        className
      )}
      disabled={disabled || loading}
      data-testid={dataTestId ?? 'btn'}
    >
      {loading ? <Loader2 className="btn-spinner" size={16} /> : leftIcon}
      <span className="btn-label">{children}</span>
      {!loading && rightIcon}
    </button>
  );
});

export default Button;