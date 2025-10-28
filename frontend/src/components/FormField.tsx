import classNames from 'classnames';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField = ({ label, htmlFor, error, hint, required, children }: FormFieldProps) => {
  return (
    <label className={classNames('form-field', { 'form-field-error': !!error })} htmlFor={htmlFor}>
      <span className="form-label">
        {label}
        {required ? <span className="form-required" aria-hidden="true">*</span> : null}
      </span>
      <div className="form-control">{children}</div>
      {hint && !error ? <span className="form-hint">{hint}</span> : null}
      {error ? (
        <span className="form-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
};

