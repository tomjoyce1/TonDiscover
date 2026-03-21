import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/helpers/class-name.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'boost' | 'ghost' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-tg-accent text-white hover:bg-[#239bd7] active:bg-[#1e84b6]',
  secondary: 'bg-tg-input text-tg-primary hover:bg-[#2d3b4d] active:bg-[#263242]',
  boost: 'bg-tg-boost text-black hover:bg-[#e89511] active:bg-[#d6890e]',
  ghost: 'bg-transparent text-tg-primary hover:bg-tg-input/70',
  text: 'bg-transparent text-tg-muted hover:text-tg-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs font-semibold',
  md: 'h-11 px-4 text-sm font-semibold',
  lg: 'h-12 px-5 text-sm font-semibold',
  xl: 'h-14 px-6 text-base font-semibold',
  icon: 'h-10 w-10 p-0',
};

export const buttonStyles = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string => {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tg-accent/45',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export const Button = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={buttonStyles({
        variant,
        size,
        fullWidth,
        className,
      })}
      {...props}
    />
  );
};

