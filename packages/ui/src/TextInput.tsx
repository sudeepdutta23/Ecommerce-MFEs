import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'mt-1.5 block w-full rounded-md border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset',
          'placeholder:text-slate-400 focus:ring-2 focus:ring-inset',
          error ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-brand-600',
        )}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-negative">
          {error}
        </p>
      ) : null}
    </div>
  );
});
