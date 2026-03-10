// components/ui/Button.tsx
import React from 'react';

export interface ButtonProps {
  title: string;
  action: () => void;
  variant: 'solid' | 'outline' | 'disabled';
  size: 'sm' | 'lg';
  classes?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  action,
  variant,
  size,
  classes = '',
  loading = false,
}) => {
  const isDisabled = variant === 'disabled' || loading;

  return (
    <button
      onClick={!isDisabled ? action : undefined}
      disabled={isDisabled}
      aria-busy={loading}
      className={['btn', `btn--${variant}`, `btn--${size}`, classes].filter(Boolean).join(' ')}
    >
      {loading ? (
        <span className="btn__loader" aria-hidden="true" />
      ) : null}
      <span className={loading ? 'btn__label btn__label--loading' : 'btn__label'}>
        {title}
      </span>
    </button>
  );
};

export default Button;

