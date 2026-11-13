import type { FC } from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
};

export const Spinner: FC<SpinnerProps> = ({
  size = "md",
  className = "",
}: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`
        inline-block animate-spin rounded-full
        border-current border-r-transparent
        ${sizes[size]}
        ${className}
      `}
    />
  );
};
