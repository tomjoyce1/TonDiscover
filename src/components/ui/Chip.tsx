import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cx } from '@/helpers/class-name.ts';

export type ChipVariant = 'default' | 'accent' | 'boost' | 'muted';
export type ChipSize = 'sm' | 'md';

type ChipStyleOptions = {
  variant?: ChipVariant;
  size?: ChipSize;
  active?: boolean;
  className?: string;
};

const variantClasses: Record<ChipVariant, string> = {
  default: 'border-tg-border bg-tg-card text-tg-muted',
  accent: 'border-tg-accent/45 bg-tg-accent/10 text-tg-primary',
  boost: 'border-tg-boost/40 bg-tg-boost/12 text-tg-boost',
  muted: 'border-transparent bg-tg-input text-tg-muted',
};

const sizeClasses: Record<ChipSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export const chipStyles = ({
  variant = 'default',
  size = 'sm',
  active = false,
  className,
}: ChipStyleOptions = {}): string => {
  return cx(
    'inline-flex items-center justify-center whitespace-nowrap rounded-full border font-medium',
    'transition-colors',
    active ? variantClasses.accent : variantClasses[variant],
    sizeClasses[size],
    className,
  );
};

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant;
  size?: ChipSize;
  active?: boolean;
};

export const Chip = ({
  variant = 'default',
  size = 'sm',
  active = false,
  className,
  ...props
}: ChipProps) => {
  return <span className={chipStyles({ variant, size, active, className })} {...props} />;
};

type ChipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipVariant;
  size?: ChipSize;
  active?: boolean;
};

export const ChipButton = ({
  variant = 'default',
  size = 'sm',
  active = false,
  className,
  type = 'button',
  ...props
}: ChipButtonProps) => {
  return (
    <button
      type={type}
      className={chipStyles({
        variant,
        size,
        active,
        className: cx(className, 'text-left'),
      })}
      {...props}
    />
  );
};

