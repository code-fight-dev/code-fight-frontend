import type { ChallengeLanguage, ChallengeLanguageMeta } from "./types";

export const PROGRAMMING_LANGUAGES = [
  {
    id: "typescript",
    label: "TypeScript",
    monacoLanguage: "typescript",
    extension: "ts",
  },
  {
    id: "javascript",
    label: "JavaScript",
    monacoLanguage: "javascript",
    extension: "js",
  },
  {
    id: "python",
    label: "Python",
    monacoLanguage: "python",
    extension: "py",
  },
  {
    id: "java",
    label: "Java",
    monacoLanguage: "java",
    extension: "java",
  },
  {
    id: "cpp",
    label: "C++",
    monacoLanguage: "cpp",
    extension: "cpp",
  },
  {
    id: "go",
    label: "Go",
    monacoLanguage: "go",
    extension: "go",
  },
  {
    id: "rust",
    label: "Rust",
    monacoLanguage: "rust",
    extension: "rs",
  },
  {
    id: "sql",
    label: "SQL",
    monacoLanguage: "sql",
    extension: "sql",
  },
] as const satisfies ChallengeLanguageMeta[];

export const PROGRAMMING_LANGUAGE_BY_ID = PROGRAMMING_LANGUAGES.reduce(
  (languages, language) => {
    languages[language.id] = language;
    return languages;
  },
  {} as Record<ChallengeLanguage, ChallengeLanguageMeta>,
);

export const DEFAULT_CHALLENGE_LANGUAGE: ChallengeLanguage = "typescript";
