import {
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import {
  type InputHTMLAttributes,
  type ReactNode
} from "react";

interface InputProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "size"> {
  name: FieldPath<T>;
  label?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export const Input = <T extends FieldValues>({
  name,
  label,
  helperText,
  leftIcon,
  id,
  required,
  className = "",
  ...props
}: InputProps<T>) => {
  const {
    register,
    getFieldState,
    formState,
  } = useFormContext<T>();

  const { error } = getFieldState(name, formState);
  const inputId = id || name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          {...register(name)}
          {...props}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={`
            w-full rounded-lg border bg-white px-3 py-2.5
            text-sm text-gray-900 outline-none transition
            placeholder:text-gray-400
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
            disabled:cursor-not-allowed disabled:bg-gray-100
            ${leftIcon ? "pl-10" : ""}
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error.message}
        </p>
      )}

      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
