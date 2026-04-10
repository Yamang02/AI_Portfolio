const idCounters = new Map<string, number>();

export const resetHeadingIdCounters = () => {
  idCounters.clear();
};

export const generateHeadingId = (text: string, index?: number): string => {
  let id = text
    .toLowerCase()
    .replaceAll(/[^a-z0-9가-힣\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-/, '')
    .replaceAll(/-$/, '');

  if (!id) {
    id = `heading-${index ?? 0}`;
  }

  if (idCounters.has(id)) {
    const count = idCounters.get(id)! + 1;
    idCounters.set(id, count);
    return `${id}-${count}`;
  }

  idCounters.set(id, 0);
  return id;
};
