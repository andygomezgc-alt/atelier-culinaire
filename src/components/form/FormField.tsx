"use client";
import { Controller, FieldPath, FieldValues, UseControllerProps } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> extends UseControllerProps<T> {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "textarea";
  error?: string;
  helperText?: string;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  error,
  helperText,
  ...rest
}: FormFieldProps<T>) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <Controller
        name={name}
        {...rest}
        render={({ field }) =>
          type === "textarea" ? (
            <textarea {...field} placeholder={placeholder} className="textarea" />
          ) : (
            <input {...field} type={type} placeholder={placeholder} className="input" />
          )
        }
      />
      {error && <span className="form-error">{error}</span>}
      {helperText && <span className="form-helper">{helperText}</span>}
    </div>
  );
}
