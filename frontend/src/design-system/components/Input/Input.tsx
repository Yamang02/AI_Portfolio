import React, { forwardRef } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      prefix,
      suffix,
      error = false,
      className,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.input,
      styles[size],
      error || variant === 'error' ? styles.error : styles[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClassNames = [
      styles.inputWrapper,
      prefix && styles.withPrefix,
      suffix && styles.withSuffix,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClassNames}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          ref={ref}
          className={classNames}
          {...props}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface PasswordInputProps
  extends Omit<InputProps, 'type'> {
  showPasswordToggle?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showPasswordToggle = true,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        suffix={
          showPasswordToggle ? (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? (
                <EyeInvisibleOutlined />
              ) : (
                <EyeOutlined />
              )}
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
