export type StoredItemType = "pdf" | "text";

export type StoredItem = {
  id: string;
  type: StoredItemType;
  title: string;
  content: string;
  createdAt: string;
  fileName?: string;
  pages?: number;
};

const STORAGE_KEY = "scholarmind-items";

export function loadStoredItems(): StoredItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredItems(items: StoredItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addStoredItem(item: StoredItem): StoredItem[] {
  const current = loadStoredItems();
  const updated = [item, ...current];
  saveStoredItems(updated);
  return updated;
}

export function formatDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder("latin1").decode(buffer);

  // Simple page counter for basic PDFs. Good enough for local demo usage.
  const pages = text.match(/\/Type\s*\/Page\b/g);
  return pages ? pages.length : 0;
}
