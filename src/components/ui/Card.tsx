import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cx } from '@/helpers/class-name.ts';

export type CardVariant = 'default' | 'muted' | 'success' | 'boost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type CardStyleOptions = {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-tg-card border border-tg-border',
  muted: 'bg-tg-input/80 border border-tg-border/80',
  success: 'bg-tg-success/10 border border-tg-success/30',
  boost: 'bg-tg-boost/10 border border-tg-boost/30',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const cardStyles = ({
  variant = 'default',
  padding = 'md',
  className,
}: CardStyleOptions = {}): string => {
  return cx('rounded-2xl', variantClasses[variant], paddingClasses[padding], className);
};

type CardProps = PropsWithChildren<HTMLAttributes<HTMLElement>> & {
  as?: 'section' | 'article' | 'div' | 'form';
  variant?: CardVariant;
  padding?: CardPadding;
};

export const Card = ({
  as = 'section',
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) => {
  const Component = as;
  return (
    <Component className={cardStyles({ variant, padding, className })} {...props}>
      {children}
    </Component>
  );
};
