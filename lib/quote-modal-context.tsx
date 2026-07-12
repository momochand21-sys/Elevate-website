"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface QuoteModalContextType {
  isOpen: boolean;
  open:   () => void;
  close:  () => void;
}

const QuoteModalContext = createContext<QuoteModalContextType>({
  isOpen: false,
  open:   () => {},
  close:  () => {},
});

export function useQuoteModal() { return useContext(QuoteModalContext); }

export function QuoteModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open  = useCallback(() => setIsOpen(true),  []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <QuoteModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </QuoteModalContext.Provider>
  );
}
