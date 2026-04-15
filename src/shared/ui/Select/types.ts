import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SelectOption<T extends string = string> = Readonly<{
  value: T;
  label: ReactNode;
  disabled?: boolean;
}>;

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "defaultValue" | "onChange" | "type" | "value"
>;

export type SelectControlSize = "sm" | "md" | "lg";
export type SelectSurface = "app" | "challenge";

export type SelectProps<T extends string = string> = ButtonProps & {
  value: T;
  options: readonly SelectOption<T>[];
  onValueChange: (value: T) => void;
  controlSize?: SelectControlSize;
  name?: string;
  placeholder?: ReactNode;
  placeholderValue?: T;
  surface?: SelectSurface;
};
