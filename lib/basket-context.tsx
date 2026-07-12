"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
export interface BasketItem {
  id: string;
  productName: string;
  productCode: string;
  productHref: string;
  /* Multi-size products */
  sizeQtys?: Record<string, number>;
  /* Single-size products */
  qty?: number;
  totalQty: number;
  logo: "yes" | "no";
  logoFileName?: string;
  logoDataUrl?: string;        // base64 — NOT persisted to localStorage
  digitisingFee?: number;      // 0 or 15
  digitisingLabel?: string;    // human-readable label for basket
  method?: string | null;
  positions?: string[];
  notes?: string;
  basePerUnit: number;
  brandingCost: number;
  totalPerUnit: number;
  totalOrder: number;
  /* ── Bundle items ── */
  isBundle?:   boolean;
  bundleSlug?: string;   // e.g. "new-business-starter-pack" — used for server-side pricing
  bundleImage?: string;
  /** Per-garment breakdown for a bundle line item */
  bundleContents?: {
    name: string;
    code: string;
    qty: number;
    sizeQtys?: Record<string, number>;
  }[];
}

interface BasketContextValue {
  items: BasketItem[];
  totalQty: number;
  totalValue: number;
  totalDigitising: number;
  addItems: (items: Omit<BasketItem, "id">[]) => void;
  updateItem: (id: string, patch: Partial<Omit<BasketItem, "id">>) => void;
  addItem: (item: Omit<BasketItem, "id">) => void;
  removeItem: (id: string) => void;
  clearBasket: () => void;
  isOpen: boolean;
  openBasket: () => void;
  closeBasket: () => void;
}

const BasketContext = createContext<BasketContextValue | null>(null);

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const STORAGE_KEY = "elevate-basket";

/** Strip logoDataUrl before persisting (can be MB-sized). */
function stripDataUrl(item: BasketItem): Omit<BasketItem, "logoDataUrl"> {
  const { logoDataUrl: _omit, ...rest } = item;
  return rest;
}

function loadFromStorage(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as BasketItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: BasketItem[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.map(stripDataUrl))
    );
  } catch {
    /* storage quota exceeded — silently fail */
  }
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ─────────────────────────────────────────────────────────────────
   PROVIDER
───────────────────────────────────────────────────────────────── */
export function BasketProvider({ children }: { children: ReactNode }) {
  const [items,   setItems  ] = useState<BasketItem[]>([]);
  const [isOpen,  setIsOpen ] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Hydrate from localStorage once on mount */
  useEffect(() => {
    setItems(loadFromStorage());
    setMounted(true);
  }, []);

  /* Persist whenever items change (after hydration) */
  useEffect(() => {
    if (mounted) saveToStorage(items);
  }, [items, mounted]);

  const totalQty        = items.reduce((s, i) => s + i.totalQty, 0);
  const totalDigitising = items.reduce((s, i) => s + (i.digitisingFee ?? 0), 0);
  const totalValue      = items.reduce((s, i) => s + i.totalOrder, 0) + totalDigitising;

  const addItem = useCallback((item: Omit<BasketItem, "id">) => {
    const newItem: BasketItem = { ...item, id: uid() };
    setItems(prev => [...prev, newItem]);
    setIsOpen(true);
  }, []);

  const addItems = useCallback((newItems: Omit<BasketItem, "id">[]) => {
    const withIds: BasketItem[] = newItems.map(item => ({ ...item, id: uid() }));
    setItems(prev => [...prev, ...withIds]);
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<Omit<BasketItem, "id">>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }, []);

  const clearBasket = useCallback(() => {
    setItems([]);
  }, []);

  const openBasket  = useCallback(() => setIsOpen(true),  []);
  const closeBasket = useCallback(() => setIsOpen(false), []);

  return (
    <BasketContext.Provider value={{
      items, totalQty, totalValue, totalDigitising,
      addItem, addItems, updateItem, removeItem, clearBasket,
      isOpen, openBasket, closeBasket,
    }}>
      {children}
    </BasketContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────────────── */
export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside <BasketProvider>");
  return ctx;
}
