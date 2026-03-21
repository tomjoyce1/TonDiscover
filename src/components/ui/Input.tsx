import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cx } from '@/helpers/class-name.ts';

const fieldBaseClasses = [
  'w-full rounded-xl border border-transparent bg-tg-input text-tg-primary',
  'placeholder:text-tg-dim transition-colors',
  'outline-none focus:border-tg-accent/60 focus:ring-2 focus:ring-tg-accent/35',
].join(' ');

export const inputStyles = (className?: string): string => {
  return cx(fieldBaseClasses, 'h-12 px-4', className);
};

export const selectStyles = (className?: string): string => {
  return cx(fieldBaseClasses, 'h-12 px-4', className);
};

export const textareaStyles = (className?: string): string => {
  return cx(fieldBaseClasses, 'min-h-[112px] p-4 resize-none', className);
};

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  return <input className={inputStyles(className)} {...props} />;
};

export const Select = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => {
  return <select className={selectStyles(className)} {...props} />;
};

export const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return <textarea className={textareaStyles(className)} {...props} />;
};

