export const EXAM_THEME_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "medical", label: "Medical" },
  { value: "nta", label: "NTA" },
  { value: "flash", label: "Flash" },
  { value: "practice", label: "Practice" },
];

export function normalizeExamTheme(theme) {
  const value = String(theme || "standard").toLowerCase();
  return EXAM_THEME_OPTIONS.some((item) => item.value === value)
    ? value
    : "standard";
}
