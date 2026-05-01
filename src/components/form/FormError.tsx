"use client";
import { FieldErrors } from "react-hook-form";

export function FormError({ errors }: { errors: FieldErrors }) {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className="form-errors">
      {Object.entries(errors).map(([field, error]) => (
        <div key={field} className="form-error-item">
          {(error?.message as string) || `${field} is invalid`}
        </div>
      ))}
    </div>
  );
}
