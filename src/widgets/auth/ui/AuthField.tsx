"use client";

import Link from "next/link";
import { AtSign, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import type { AuthFieldConfig } from "../model/types";

type Props = {
  field: AuthFieldConfig;
  disabled?: boolean;
};

const iconMap = {
  username: AtSign,
  email: Mail,
  password: LockKeyhole,
} as const;

export function AuthField({ field, disabled = false }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const Icon = iconMap[field.icon];
  const inputType = field.type === "password" && isRevealed ? "text" : field.type;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <label
          htmlFor={field.id}
          className="text-[15px] font-medium tracking-[-0.03em] text-white/88"
        >
          {field.label}
        </label>

        {field.auxiliaryLink ? (
          <Link
            href={field.auxiliaryLink.href}
            className="text-[14px] font-medium tracking-[-0.03em] text-blue-400 transition-colors hover:text-blue-300"
          >
            {field.auxiliaryLink.label}
          </Link>
        ) : null}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/38">
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>

        <input
          id={field.id}
          name={field.id}
          type={inputType}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          disabled={disabled}
          className="h-14.5 w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,27,46,0.86)_0%,rgba(9,16,30,0.92)_100%)] pr-12 pl-12 text-[16px] tracking-[-0.03em] text-white/88 transition-[border-color,box-shadow,background-color] duration-200 outline-none placeholder:text-white/28 focus:border-blue-400/22 focus:bg-[linear-gradient(180deg,rgba(19,31,54,0.92)_0%,rgba(11,19,37,0.96)_100%)] focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_30px_rgba(3,7,18,0.18)]"
        />

        {field.type === "password" && field.allowReveal ? (
          <button
            type="button"
            aria-label={isRevealed ? "Hide password" : "Show password"}
            disabled={disabled}
            onClick={() => setIsRevealed((currentValue) => !currentValue)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/42 transition-colors hover:text-white/72"
          >
            {isRevealed ? (
              <EyeOff className="h-4.5 w-4.5" strokeWidth={2} />
            ) : (
              <Eye className="h-4.5 w-4.5" strokeWidth={2} />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
