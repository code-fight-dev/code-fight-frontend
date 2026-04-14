import type { SelectOption } from "./types";

export function getNextEnabledIndex<T extends string>(
  options: readonly SelectOption<T>[],
  startIndex: number,
  direction: 1 | -1,
) {
  if (options.length === 0) {
    return -1;
  }

  for (let offset = 0; offset < options.length; offset += 1) {
    const nextIndex = (startIndex + direction * offset + options.length) % options.length;

    if (!options[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return -1;
}
