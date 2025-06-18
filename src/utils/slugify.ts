// src/utils/slugify.ts
export function slugify(text: string, existingSlugs?: Set<string> | string[]): string {
  let baseSlug = text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

  if (!existingSlugs || !new Set(existingSlugs).has(baseSlug)) {
    return baseSlug;
  }

  let uniqueSlug = baseSlug;
  let counter = 1;
  const slugsSet = new Set(existingSlugs);

  while (slugsSet.has(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}