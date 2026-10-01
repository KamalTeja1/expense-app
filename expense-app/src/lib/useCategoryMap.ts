import { useLiveQuery } from 'dexie-react-hooks';
import { getAllCategories } from './db';
import { DEFAULT_CATEGORIES } from './categories';
import type { Category } from './types';

export function useCategoryMap(): {
  map: Map<string, Category>;
  get: (id: string) => Category;
} {
  const cats = useLiveQuery(() => getAllCategories(), []);
  const map = new Map<string, Category>((cats ?? []).map((c) => [c.id, c]));
  const fallback =
    DEFAULT_CATEGORIES.find((c) => c.id === 'other-expense') ?? DEFAULT_CATEGORIES[0];

  const get = (id: string): Category => {
    return (
      map.get(id) ??
      DEFAULT_CATEGORIES.find((c) => c.id === id) ??
      fallback
    );
  };

  return { map, get };
}