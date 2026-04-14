"use client";

import type { ChallengeLanguage } from "@/entities/challenge";
import { PROGRAMMING_LANGUAGE_BY_ID } from "@/entities/challenge";
import { Select, type SelectOption } from "@/shared/ui/Select";

type Props = {
  languages: ChallengeLanguage[];
  value: ChallengeLanguage;
  onChange: (language: ChallengeLanguage) => void;
};

export function LanguageSelector({ languages, value, onChange }: Props) {
  const languageOptions: SelectOption<ChallengeLanguage>[] = languages.map(
    (language) => ({
      value: language,
      label: PROGRAMMING_LANGUAGE_BY_ID[language].label,
    }),
  );

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-[12px] font-semibold text-(--app-text-faint)">Language</span>
      <Select
        aria-label="Language"
        value={value}
        options={languageOptions}
        onValueChange={onChange}
        surface="challenge"
        controlSize="sm"
        className="font-semibold"
      />
    </div>
  );
}
