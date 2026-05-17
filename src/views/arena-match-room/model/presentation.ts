export function toShortID(value: string) {
  return value.slice(0, 8).toUpperCase();
}

export function toReadableStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
