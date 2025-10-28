import classNames from 'classnames';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  leftSlot,
  rightSlot,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={classNames('btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : null, className, {
        'btn-disabled': isDisabled,
        'btn-loading': isLoading,
      })}
      disabled={isDisabled}
      {...rest}
    >
      {leftSlot ? <span className="btn-slot btn-slot-left">{leftSlot}</span> : null}
      <span className="btn-content">{children}</span>
      {rightSlot ? <span className="btn-slot btn-slot-right">{rightSlot}</span> : null}
      {isLoading ? <span className="btn-spinner" aria-hidden="true" /> : null}
    </button>
  );
};

