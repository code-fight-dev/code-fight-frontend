import { cn } from "@/shared/lib/cn";
import { resolveCountryCode } from "@/shared/lib/country";
import { flagIcons } from "@/shared/lib/flags";

type Props = {
  countryCode: string;
  countryName?: string;
  className?: string;
};

export function CountryFlag({ countryCode, countryName, className }: Props) {
  const normalizedCountryCode = resolveCountryCode(countryCode, countryName);
  const Flag = normalizedCountryCode ? flagIcons[normalizedCountryCode] : undefined;

  if (!Flag) {
    return null;
  }

  return (
    <span
      className={cn("inline-flex shrink-0 overflow-hidden rounded-lg", className)}
      title={countryName || normalizedCountryCode}
      aria-hidden="true"
    >
      <span className="inline-flex h-full w-full overflow-hidden rounded-[inherit]">
        <Flag
          className="block h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        />
      </span>
    </span>
  );
}
