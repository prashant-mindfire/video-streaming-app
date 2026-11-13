import {
  useFormContext,
  type FieldValues,
  type FieldPath,
  type RegisterOptions,
} from "react-hook-form";
import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps<T extends FieldValues>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "size"> {
  name: FieldPath<T>;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  rules?: RegisterOptions<T, FieldPath<T>>;
}

export const SelectInput = <T extends FieldValues>({
  name,
  label,
  options,
  placeholder = "Select an option",
  rules,
  className = "",
  ...props
}: SelectInputProps<T>) => {
  const {
    register,
    getFieldState,
    formState,
  } = useFormContext<T>();

  const { error } = getFieldState(name, formState);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}

      <select
        id={name}
        {...register(name, rules)}
        {...props}
        className={`w-full rounded-md border px-3 py-2 outline-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error.message?.toString()}
        </p>
      )}
    </div>
  );
};
