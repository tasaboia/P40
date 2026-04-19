const ADMIN_NAME_PATTERNS = [
  ["paula", "garcia"],
  ["luciana", "rodrigues"],
  ["gabriel", "contri"],
  ["antonio", "garcia"],
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function shouldAutoAdmin(name?: string | null) {
  if (!name) {
    return false;
  }

  const normalizedName = normalizeText(name);

  return ADMIN_NAME_PATTERNS.some((tokens) =>
    tokens.every((token) => normalizedName.includes(token)),
  );
}
