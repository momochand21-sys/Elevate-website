"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DUMMY_CUSTOMER, type Customer } from "@/lib/portal-data";

interface PortalContextType {
  customer:  Customer | null;
  isLoading: boolean;
  login:     (email: string, password: string) => Promise<{ error?: string }>;
  logout:    () => void;
}

const PortalContext = createContext<PortalContextType>({
  customer:  null,
  isLoading: true,
  login:     async () => ({}),
  logout:    () => {},
});

export function usePortal() { return useContext(PortalContext); }

const SESSION_KEY = "elv_portal_session";

export default function PortalProvider({ children }: { children: React.ReactNode }) {
  const [customer,  setCustomer ] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router   = useRouter();
  const pathname = usePathname();

  /* Restore session on mount */
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  /* Redirect unauthenticated users away from portal pages */
  useEffect(() => {
    if (isLoading) return;
    const isPortal    = pathname.startsWith("/portal");
    const isLoginPage = pathname === "/portal/login";
    if (isPortal && !isLoginPage && !customer) {
      router.replace("/portal/login");
    }
    if (isLoginPage && customer) {
      router.replace("/portal");
    }
  }, [customer, isLoading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { error: "Please enter your email and password." };
    }
    /* Credentials are checked server-side — never compared in the browser */
    const res = await fetch("/api/portal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error ?? "Login failed. Please try again." };
    }
    setCustomer(DUMMY_CUSTOMER);
    localStorage.setItem(SESSION_KEY, JSON.stringify(DUMMY_CUSTOMER));
    router.push("/portal");
    return {};
  }, [router]);

  const logout = useCallback(() => {
    setCustomer(null);
    localStorage.removeItem(SESSION_KEY);
    router.push("/portal/login");
  }, [router]);

  return (
    <PortalContext.Provider value={{ customer, isLoading, login, logout }}>
      {children}
    </PortalContext.Provider>
  );
}
